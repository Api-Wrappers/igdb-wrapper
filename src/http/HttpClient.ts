import type { AuthManager } from "../auth/AuthManager.ts";
import { IGDBAuthError, IGDBError, IGDBRateLimitError } from "../errors.ts";
import type { RateLimiterOptions } from "./rateLimiter.ts";
import { DEFAULT_RATE_LIMITER, RateLimiter } from "./rateLimiter.ts";
import type { RetryOptions } from "./retry.ts";
import { DEFAULT_RETRY, withRetry } from "./retry.ts";

const IGDB_BASE = "https://api.igdb.com/v4";

export interface HttpClientOptions {
	clientId: string;
	auth: AuthManager;
	retry?: Partial<RetryOptions>;
	rateLimit?: Partial<RateLimiterOptions>;
}

interface IGDBCountResponse {
	count: number;
}

export class HttpClient {
	readonly #options: HttpClientOptions;
	readonly #limiter: RateLimiter;
	readonly #retry: RetryOptions;

	constructor(options: HttpClientOptions) {
		this.#options = options;
		this.#limiter = new RateLimiter({
			...DEFAULT_RATE_LIMITER,
			...options.rateLimit,
		});
		this.#retry = { ...DEFAULT_RETRY, ...options.retry };
	}

	async request<T>(endpoint: string, body: string): Promise<T[]> {
		await this.#limiter.acquire();
		try {
			return await withRetry(
				() => this.#send<T[]>(endpoint, body),
				this.#retry,
			);
		} finally {
			this.#limiter.release();
		}
	}

	async requestCount(endpoint: string, body: string): Promise<number> {
		await this.#limiter.acquire();
		try {
			const res = await withRetry(
				() => this.#send<IGDBCountResponse>(`${endpoint}/count`, body),
				this.#retry,
			);
			return (res as IGDBCountResponse).count;
		} finally {
			this.#limiter.release();
		}
	}

	async #send<T>(endpoint: string, body: string): Promise<T> {
		const token = await this.#options.auth.getAccessToken();

		const res = await fetch(`${IGDB_BASE}/${endpoint}`, {
			method: "POST",
			headers: {
				"Client-ID": this.#options.clientId,
				Authorization: `Bearer ${token}`,
				"Content-Type": "text/plain",
				Accept: "application/json",
			},
			body,
		});

		if (res.status === 401) {
			throw new IGDBAuthError(`Unauthorized — check your client credentials`);
		}

		if (res.status === 429) {
			const retryAfter = Number(res.headers.get("Retry-After") ?? 1) * 1000;
			throw new IGDBRateLimitError(retryAfter);
		}

		if (!res.ok) {
			throw new IGDBError(
				`HTTP ${res.status} on /${endpoint}: ${await res.text()}`,
			);
		}

		return res.json() as Promise<T>;
	}
}
