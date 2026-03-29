import type { RateLimiterOptions } from "../http/rateLimiter";
import type { RetryOptions } from "../http/retry";

export interface IGDBClientConfig {
	clientId: string;
	clientSecret: string;
	retry?: Partial<RetryOptions>;
	rateLimit?: Partial<RateLimiterOptions>;
}
