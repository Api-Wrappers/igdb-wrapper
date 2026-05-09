import type {
	ApiPlugin,
	ClientConfig,
	RateLimitPluginOptions,
	RetryConfig,
} from "@api-wrappers/api-core";

export interface IGDBClientConfig {
	clientId: string;
	clientSecret: string;
	retry?: Partial<RetryConfig>;
	rateLimit?: RateLimitPluginOptions;
	timeoutMs?: number;
	fetch?: ClientConfig["fetch"];
	transport?: ClientConfig["transport"];
	plugins?: ApiPlugin[];
	logger?: ClientConfig["logger"];
}
