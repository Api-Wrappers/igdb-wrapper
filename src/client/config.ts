import type { RateLimiterOptions } from "../http/rateLimiter.ts";
import type { RetryOptions } from "../http/retry.ts";

export interface IGDBClientConfig {
	clientId: string;
	clientSecret: string;
	retry?: Partial<RetryOptions>;
	rateLimit?: Partial<RateLimiterOptions>;
}
