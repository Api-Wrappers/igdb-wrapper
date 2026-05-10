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
	readonly #auth: AuthManager;
	readonly #clientId: string;
	readonly #fetch: typeof globalThis.fetch;
	readonly #timeoutMs: number | undefined;

	constructor(options: HttpClientOptions) {
		this.#auth = options.auth;
		this.#clientId = options.clientId;
		this.#fetch = options.fetch ?? globalThis.fetch;
		this.#timeoutMs = options.timeoutMs;
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
		const url = `${IGDB_BASE}/${normalized}.pb`;
		const token = await this.#auth.getAccessToken();
		const controller =
			this.#timeoutMs === undefined ? null : new AbortController();
		const timeout =
			controller === null
				? undefined
				: setTimeout(() => controller.abort(), this.#timeoutMs);

		try {
			const response = await this.#fetch(url, {
				body,
				headers: {
					accept: "application/octet-stream",
					authorization: `Bearer ${token}`,
					"client-id": this.#clientId,
					"content-type": "text/plain",
				},
				method: "POST",
				signal: controller?.signal,
			});

			if (!response.ok) {
				throw await toIGDBResponseError(response, `${normalized}.pb`);
			}

			return response.arrayBuffer();
		} catch (error) {
			if (error instanceof IGDBError) throw error;
			throw toIGDBError(error, `${normalized}.pb`);
		} finally {
			if (timeout) clearTimeout(timeout);
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

async function toIGDBResponseError(
	response: Response,
	endpoint: string,
): Promise<IGDBError> {
	const body = await response.text().catch(() => "");

	if (response.status === 401) {
		return new IGDBAuthError("Unauthorized - check your client credentials");
	}

	if (response.status === 429) {
		return new IGDBRateLimitError(readRetryAfterMs(response));
	}

	return new IGDBError(`HTTP ${response.status} on /${endpoint}: ${body}`);
}

function readRetryAfterMs(response: Response): number | undefined {
	const raw = response.headers.get("retry-after");
	if (!raw) return undefined;
	const seconds = Number(raw);
	if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
	const date = Date.parse(raw);
	return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
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
