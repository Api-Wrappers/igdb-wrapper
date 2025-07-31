import type {
	Game,
	GameQueryBuilder,
	IGDBResponse,
	IGDBRouteRequestOptions,
} from "@/@types";
import { IGDBQueryFactory } from "@/@types";
import { IGDBRouteBase } from "./base";

export class IGDBGamesRoute extends IGDBRouteBase {
	protected readonly endpoint = "games" as const;
	protected readonly defaultFieldsKey = "games" as const;

	/**
	 * Get games with enhanced type safety
	 */
	async getGames(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.getAll<Game>(options);
	}

	/**
	 * Create a type-safe query builder for games
	 */
	query(): GameQueryBuilder {
		return IGDBQueryFactory.games();
	}

	/**
	 * Get a single game by ID
	 */
	async getGame(
		id: number,
		options: Partial<Omit<IGDBRouteRequestOptions, "where" | "search">> = {},
	): Promise<Game | null> {
		const result = await this.getById<Game>(id, options);
		return Array.isArray(result) && result.length > 0
			? (result[0] ?? null)
			: null;
	}

	/**
	 * Search for games by name
	 */
	async searchGames(
		query: string,
		options: Partial<Omit<IGDBRouteRequestOptions, "search">> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.search<Game>(query, options);
	}

	/**
	 * Get games by multiple IDs
	 */
	async getGamesByIds(
		ids: number[],
		options: Partial<Omit<IGDBRouteRequestOptions, "where">> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.getByIds<Game>(ids, options);
	}

	/**
	 * Get popular games (sorted by rating)
	 */
	async getPopularGames(
		options: Partial<Omit<IGDBRouteRequestOptions, "sort">> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.getGames({
			...options,
			sort: "total_rating desc",
			where: options.where
				? `${options.where} & total_rating != null`
				: "total_rating != null",
		});
	}

	/**
	 * Get recently released games
	 */
	async getRecentGames(
		options: Partial<Omit<IGDBRouteRequestOptions, "sort" | "where">> = {},
	): Promise<IGDBResponse<Game[]>> {
		const currentTimestamp = Math.floor(Date.now() / 1000);
		const thirtyDaysAgo = currentTimestamp - 30 * 24 * 60 * 60;

		return this.getGames({
			...options,
			sort: "first_release_date desc",
			where: `first_release_date >= ${thirtyDaysAgo} & first_release_date <= ${currentTimestamp}`,
		});
	}

	/**
	 * Get upcoming games
	 */
	async getUpcomingGames(
		options: Partial<Omit<IGDBRouteRequestOptions, "sort" | "where">> = {},
	): Promise<IGDBResponse<Game[]>> {
		const currentTimestamp = Math.floor(Date.now() / 1000);

		return this.getGames({
			...options,
			sort: "first_release_date asc",
			where: `first_release_date > ${currentTimestamp}`,
		});
	}

	/**
	 * Get games by genre ID
	 */
	async getGamesByGenre(
		genreId: number,
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.getGames({
			...options,
			where: options.where
				? `${options.where} & genres = ${genreId}`
				: `genres = ${genreId}`,
		});
	}

	/**
	 * Get games by platform ID
	 */
	async getGamesByPlatform(
		platformId: number,
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Game[]>> {
		return this.getGames({
			...options,
			where: options.where
				? `${options.where} & platforms = ${platformId}`
				: `platforms = ${platformId}`,
		});
	}
}
