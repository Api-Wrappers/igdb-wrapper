import { ApiError, createClient } from "@api-wrappers/api-core";
import type { ClientConfig } from "@api-wrappers/api-core";
import { IGDBAuthError } from "../errors";

const TOKEN_BUFFER_MS = 60_000;
const TWITCH_AUTH_BASE = "https://id.twitch.tv";

interface TokenCache {
	accessToken: string;
	expiresAt: number;
}

interface TwitchTokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

export interface AuthConfig {
	clientId: string;
	clientSecret: string;
	fetch?: ClientConfig["fetch"];
	timeoutMs?: number;
	logger?: ClientConfig["logger"];
}

export class AuthManager {
	readonly #config: AuthConfig;
	readonly #client: ReturnType<typeof createClient>;
	#cache: TokenCache | null = null;

	constructor(config: AuthConfig) {
		this.#config = config;
		this.#client = createClient({
			baseUrl: TWITCH_AUTH_BASE,
			defaultHeaders: {
				accept: "application/json",
				"content-type": "application/x-www-form-urlencoded",
			},
			fetch: config.fetch,
			logger: config.logger,
			timeoutMs: config.timeoutMs,
		});
	}

	async getAccessToken(): Promise<string> {
		if (this.#cache && Date.now() < this.#cache.expiresAt - TOKEN_BUFFER_MS) {
			return this.#cache.accessToken;
		}
		return this.#refresh();
	}

	dispose(): Promise<void> {
		return this.#client.dispose();
	}

	async #refresh(): Promise<string> {
		let data: TwitchTokenResponse;

		try {
			data = await this.#client.post<TwitchTokenResponse>(
				"/oauth2/token",
				undefined,
				{
					query: {
						client_id: this.#config.clientId,
						client_secret: this.#config.clientSecret,
						grant_type: "client_credentials",
					},
				},
			);
		} catch (error) {
			throw toAuthError(error);
		}

		this.#cache = {
			accessToken: data.access_token,
			expiresAt: Date.now() + data.expires_in * 1000,
		};

		return this.#cache.accessToken;
	}
}

function toAuthError(error: unknown): IGDBAuthError {
	const cause = unwrapPluginError(error);
	if (cause instanceof IGDBAuthError) return cause;

	if (cause instanceof ApiError) {
		return new IGDBAuthError(
			`Token fetch failed: ${cause.status} ${formatBody(cause.responseBody)}`,
		);
	}

	if (cause instanceof Error) {
		return new IGDBAuthError(`Token fetch failed: ${cause.message}`);
	}

	return new IGDBAuthError(`Token fetch failed: ${String(cause)}`);
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
