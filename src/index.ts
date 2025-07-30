import type { IGDBClientOptions } from "@/@types";
import { IGDBRequestHandler } from "@/request";
import { IGDBCompaniesRoute, IGDBGamesRoute, IGDBGenresRoute } from "@/routes";
import { IGDBTokenManager } from "@/token-manager";
import { checkClientProperties } from "@/utils";

export class IGDB {
	private readonly tokenManager: IGDBTokenManager;
	private readonly requestHandler: IGDBRequestHandler;

	// Route instances
	public readonly games: IGDBGamesRoute;
	public readonly genres: IGDBGenresRoute;
	public readonly companies: IGDBCompaniesRoute;

	constructor(options: IGDBClientOptions) {
		checkClientProperties(options);
		this.tokenManager = new IGDBTokenManager(options);
		this.requestHandler = new IGDBRequestHandler(this.tokenManager, options);

		// Initialize route instances
		this.games = new IGDBGamesRoute(this.requestHandler);
		this.genres = new IGDBGenresRoute(this.requestHandler);
		this.companies = new IGDBCompaniesRoute(this.requestHandler);
	}

	/**
	 * Get access to the token manager for advanced use cases
	 */
	getTokenManager(): IGDBTokenManager {
		return this.tokenManager;
	}

	/**
	 * Get access to the request handler for advanced use cases
	 */
	getRequestHandler(): IGDBRequestHandler {
		return this.requestHandler;
	}

	/**
	 * Check if the client has a valid token
	 */
	hasValidToken(): boolean {
		return this.tokenManager.hasValidToken();
	}

	/**
	 * Manually refresh the authentication token
	 */
	async refreshToken(): Promise<void> {
		await this.tokenManager.getValidToken();
	}

	/**
	 * Clear the stored authentication token
	 */
	clearToken(): void {
		this.tokenManager.clearToken();
	}
}

// Export types
export type {
	Artwork,
	Company,
	Cover,
	Game,
	GameEngine,
	GameMode,
	GameVideo,
	Genre,
	IGDBClientOptions,
	IGDBEndpoint,
	IGDBImageSize,
	IGDBRequestOptions,
	IGDBResponse,
	IGDBRouteRequestOptions,
	InvolvedCompany,
	Platform,
	PlatformLogo,
	ReleaseDate,
	Screenshot,
	SimilarGame,
	Theme,
	TokenResponse,
	Website,
} from "@/@types";
export { IGDBRequestHandler } from "@/request";
// Export route classes
export {
	defaultFields,
	IGDBCompaniesRoute,
	IGDBGamesRoute,
	IGDBGenresRoute,
	IGDBRouteBase,
	RATE_LIMIT,
} from "@/routes";
// Export classes for advanced use cases
export { IGDBTokenManager } from "@/token-manager";
// Export utility functions and types
export {
	buildIGDBImageUrl,
	convertIGDBTimestamp,
	formatReleaseDate,
	getArtworkImageUrls,
	getBaseFieldName,
	getCoverImageUrl,
	getScreenshotImageUrls,
	isExpandedField,
} from "@/utils";
