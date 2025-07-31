import type {
	Genre,
	GenreQueryBuilder,
	IGDBResponse,
	IGDBRouteRequestOptions,
} from "@/@types";
import { IGDBQueryFactory } from "@/@types";
import { IGDBRouteBase } from "./base";

export class IGDBGenresRoute extends IGDBRouteBase {
	protected readonly endpoint = "genres" as const;
	protected readonly defaultFieldsKey = "genres" as const;

	/**
	 * Get genres with enhanced type safety
	 */
	async getGenres(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Genre[]>> {
		return this.getAll<Genre>(options);
	}

	/**
	 * Create a type-safe query builder for genres
	 */
	query(): GenreQueryBuilder {
		return IGDBQueryFactory.genres();
	}

	/**
	 * Get a single genre by ID
	 */
	async getGenre(
		id: number,
		options: Partial<Omit<IGDBRouteRequestOptions, "where" | "search">> = {},
	): Promise<Genre | null> {
		const result = await this.getById<Genre>(id, options);
		return Array.isArray(result) && result.length > 0
			? (result[0] ?? null)
			: null;
	}

	/**
	 * Note: IGDB API does not support search on genres endpoint.
	 * Use getGenres() and filter locally instead.
	 *
	 * Example:
	 * const allGenres = await getGenres();
	 * const filtered = allGenres.filter(g => g.name.includes("action"));
	 */

	/**
	 * Get genres by multiple IDs
	 */
	async getGenresByIds(
		ids: number[],
		options: Partial<Omit<IGDBRouteRequestOptions, "where">> = {},
	): Promise<IGDBResponse<Genre[]>> {
		return this.getByIds<Genre>(ids, options);
	}

	/**
	 * Get all genres sorted by name
	 */
	async getAllGenresSorted(
		options: Partial<Omit<IGDBRouteRequestOptions, "sort">> = {},
	): Promise<IGDBResponse<Genre[]>> {
		return this.getGenres({
			...options,
			sort: "name asc",
		});
	}

	/**
	 * Get genre by slug
	 */
	async getGenreBySlug(
		slug: string,
		options: Partial<Omit<IGDBRouteRequestOptions, "where">> = {},
	): Promise<Genre | null> {
		const result = await this.getGenres({
			...options,
			where: `slug = "${slug}"`,
			limit: 1,
		});
		return Array.isArray(result) && result.length > 0
			? (result[0] ?? null)
			: null;
	}
}
