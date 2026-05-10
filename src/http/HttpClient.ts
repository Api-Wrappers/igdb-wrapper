import {
	ApiError,
	createAuthPlugin,
	createClient,
	createRateLimitPlugin,
	RateLimitError,
} from "@api-wrappers/api-core";
import type {
	ApiPlugin,
	ClientConfig,
	RateLimitPluginOptions,
	RetryConfig,
} from "@api-wrappers/api-core";
import type { AuthManager } from "../auth/AuthManager";
import { IGDBAuthError, IGDBError, IGDBRateLimitError } from "../errors";

const IGDB_BASE = "https://api.igdb.com/v4";

const DEFAULT_RETRY: RetryConfig = {
	maxAttempts: 3,
	delayMs: 300,
};

const DEFAULT_RATE_LIMIT: RateLimitPluginOptions = {
	maxConcurrent: 8,
	intervalMs: 1000,
	maxRequestsPerInterval: 4,
	minTimeMs: 250,
};

export interface HttpClientOptions {
	clientId: string;
	auth: AuthManager;
	retry?: Partial<RetryConfig>;
	rateLimit?: RateLimitPluginOptions;
	timeoutMs?: number;
	fetch?: ClientConfig["fetch"];
	transport?: ClientConfig["transport"];
	plugins?: ApiPlugin[];
	logger?: ClientConfig["logger"];
}

interface IGDBCountResponse {
	count: number;
}

export class HttpClient {
	readonly #client: ReturnType<typeof createClient>;

	constructor(options: HttpClientOptions) {
		this.#client = createClient({
			baseUrl: IGDB_BASE,
			defaultHeaders: {
				accept: "application/json",
				"client-id": options.clientId,
				"content-type": "text/plain",
			},
			fetch: options.fetch,
			logger: options.logger,
			plugins: [
				createRateLimitPlugin({
					...DEFAULT_RATE_LIMIT,
					...options.rateLimit,
				}),
				createAuthPlugin({
					getToken: () => options.auth.getAccessToken(),
				}),
				...(options.plugins ?? []),
			],
			retry: {
				...DEFAULT_RETRY,
				...options.retry,
			},
			timeoutMs: options.timeoutMs,
			transport: options.transport,
		});
	}

	async request<T>(endpoint: string, body: string): Promise<T[]> {
		return this.post<T[]>(endpoint, body);
	}

	async requestCount(endpoint: string, body: string): Promise<number> {
		const res = await this.post<IGDBCountResponse>(`${endpoint}/count`, body);
		return res.count;
	}

	async requestProtobuf(endpoint: string, body: string): Promise<ArrayBuffer> {
		const normalized = normalizeEndpoint(endpoint).replace(/\.pb$/, "");

		try {
			return await this.#client.request<ArrayBuffer>(`/${normalized}.pb`, {
				body,
				headers: {
					accept: "application/octet-stream",
				},
				method: "POST",
				responseType: "arrayBuffer",
			});
		} catch (error) {
			throw toIGDBError(error, `${normalized}.pb`);
		}
	}

	async get<T>(endpoint: string): Promise<T> {
		return this.#request<T>("GET", endpoint);
	}

	async post<T>(endpoint: string, body?: unknown): Promise<T> {
		return this.#request<T>("POST", endpoint, body);
	}

	async postForm<T>(
		endpoint: string,
		body: URLSearchParams,
		query?: Record<string, string | number>,
	): Promise<T> {
		return this.#request<T>("POST", endpoint, body, {
			headers: { "content-type": "application/x-www-form-urlencoded" },
			query,
		});
	}

	async delete<T>(endpoint: string): Promise<T> {
		return this.#request<T>("DELETE", endpoint);
	}

	dispose(): Promise<void> {
		return this.#client.dispose();
	}

	async #request<T>(
		method: "GET" | "POST" | "DELETE",
		endpoint: string,
		body?: unknown,
		options?: {
			headers?: Record<string, string>;
			query?: Record<string, string | number>;
		},
	): Promise<T> {
		try {
			return await this.#client.request<T>(`/${normalizeEndpoint(endpoint)}`, {
				body,
				headers: options?.headers,
				method,
				query: options?.query,
			});
		} catch (error) {
			throw toIGDBError(error, endpoint);
		}
	}
}

function normalizeEndpoint(endpoint: string): string {
	return endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
}

function toIGDBError(error: unknown, endpoint: string): IGDBError {
	const cause = unwrapPluginError(error);
	if (cause instanceof IGDBError) return cause;

	if (cause instanceof RateLimitError) {
		return new IGDBRateLimitError(cause.retryAfterMs);
	}

	if (cause instanceof ApiError) {
		if (cause.status === 401) {
			return new IGDBAuthError("Unauthorized - check your client credentials");
		}

		return new IGDBError(
			`HTTP ${cause.status} on /${endpoint}: ${formatBody(
				cause.responseBody,
			)}`,
		);
	}

	if (cause instanceof Error) {
		return new IGDBError(cause.message);
	}

	return new IGDBError(String(cause));
}

function unwrapPluginError(error: unknown): unknown {
	if (
		error instanceof Error &&
		error.name === "PluginError" &&
		error.cause !== undefined
	) {
		return unwrapPluginError(error.cause);
	}
	return error;
}

function formatBody(body: unknown): string {
	if (body === undefined) return "";
	if (typeof body === "string") return body;
	try {
		return JSON.stringify(body);
	} catch {
		return String(body);
	}
}
