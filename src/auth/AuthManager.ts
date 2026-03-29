import { IGDBAuthError } from "../errors";

const TOKEN_BUFFER_MS = 60_000;

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
}

export class AuthManager {
	readonly #config: AuthConfig;
	#cache: TokenCache | null = null;

	constructor(config: AuthConfig) {
		this.#config = config;
	}

	async getAccessToken(): Promise<string> {
		if (this.#cache && Date.now() < this.#cache.expiresAt - TOKEN_BUFFER_MS) {
			return this.#cache.accessToken;
		}
		return this.#refresh();
	}

	async #refresh(): Promise<string> {
		const url = new URL("https://id.twitch.tv/oauth2/token");
		url.searchParams.set("client_id", this.#config.clientId);
		url.searchParams.set("client_secret", this.#config.clientSecret);
		url.searchParams.set("grant_type", "client_credentials");

		const res = await fetch(url.toString(), { method: "POST" });

		if (!res.ok) {
			throw new IGDBAuthError(
				`Token fetch failed: ${res.status} ${await res.text()}`,
			);
		}

		const data = (await res.json()) as TwitchTokenResponse;

		this.#cache = {
			accessToken: data.access_token,
			expiresAt: Date.now() + data.expires_in * 1000,
		};

		return this.#cache.accessToken;
	}
}
