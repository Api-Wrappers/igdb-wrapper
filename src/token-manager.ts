import type { IGDBClientOptions, TokenResponse } from "@/@types";
import { CONSTANTS, checkClientProperties } from "@/utils";

export class IGDBTokenManager {
	private expiresAt: number | null = null;
	private accessToken: string | null = null;
	private tokenPromise: Promise<string> | null = null;

	constructor(private readonly options: IGDBClientOptions) {
		checkClientProperties(options);
	}

	/**
	 * Get a valid access token, refreshing if necessary
	 */
	async getValidToken(): Promise<string> {
		// If we have a valid token that hasn't expired, return it
		if (this.accessToken && this.expiresAt && Date.now() < this.expiresAt) {
			return this.accessToken;
		}

		// If we're already refreshing the token, wait for that to complete
		if (this.tokenPromise) {
			return this.tokenPromise;
		}

		// Refresh the token
		this.tokenPromise = this.refreshToken();

		try {
			const token = await this.tokenPromise;
			return token;
		} finally {
			this.tokenPromise = null;
		}
	}

	/**
	 * Request a new access token from Twitch OAuth2
	 */
	private async refreshToken(): Promise<string> {
		const url = `${CONSTANTS.TWITCH_API_URL}/token`;
		const params = new URLSearchParams({
			client_id: this.options.clientId,
			client_secret: this.options.clientSecret,
			grant_type: "client_credentials",
		});

		try {
			const response = await fetch(`${url}?${params.toString()}`, {
				method: "POST",
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
			});

			if (!response.ok) {
				throw new Error(
					`Failed to refresh token: ${response.status} ${response.statusText}`,
				);
			}

			const data = (await response.json()) as TokenResponse;

			this.accessToken = data.access_token;
			// Set expiration time with a 5-minute buffer for safety
			this.expiresAt = Date.now() + (data.expires_in - 300) * 1000;

			return this.accessToken;
		} catch (error) {
			this.accessToken = null;
			this.expiresAt = null;
			throw new Error(`Token refresh failed: ${error}`);
		}
	}

	/**
	 * Clear the stored token (useful for testing or manual refresh)
	 */
	clearToken(): void {
		this.accessToken = null;
		this.expiresAt = null;
		this.tokenPromise = null;
	}

	/**
	 * Check if we have a valid token
	 */
	hasValidToken(): boolean {
		return (
			this.accessToken !== null &&
			this.expiresAt !== null &&
			Date.now() < this.expiresAt
		);
	}

	/**
	 * Get the current token without refreshing (may return null if expired)
	 */
	getCurrentToken(): string | null {
		if (this.hasValidToken()) {
			return this.accessToken;
		}
		return null;
	}
}
