// Type-Safe IGDB Query Builder
// This file provides type-safe query construction for IGDB API requests

import type {
	CompanyFields,
	GameFields,
	GenreFields,
	PlatformFields,
	QueryOptions,
	ValidFields,
} from "./fields";

// ============================================================================
// QUERY BUILDER CLASS
// ============================================================================

export class IGDBQueryBuilder<T> {
	private fields: string[] = [];
	private whereConditions: string[] = [];
	private sortFields: string[] = [];
	private limitValue?: number;
	private offsetValue?: number;
	private searchValue?: string;
	private includeDefaultFields = true;

	/**
	 * Add fields to the query
	 */
	select<F extends ValidFields<T>>(...fields: F[]): this {
		this.fields.push(...fields.map((f) => String(f)));
		return this;
	}

	/**
	 * Exclude default fields from the query
	 */
	excludeDefaults(): this {
		this.includeDefaultFields = false;
		return this;
	}

	/**
	 * Include default fields in the query (default behavior)
	 */
	includeDefaults(): this {
		this.includeDefaultFields = true;
		return this;
	}

	/**
	 * Add a WHERE condition
	 */
	where(condition: string): this {
		this.whereConditions.push(condition);
		return this;
	}

	/**
	 * Add multiple WHERE conditions (joined with AND)
	 */
	whereAnd(...conditions: string[]): this {
		this.whereConditions.push(...conditions);
		return this;
	}

	/**
	 * Add WHERE conditions joined with OR
	 */
	whereOr(...conditions: string[]): this {
		if (conditions.length > 0) {
			const orCondition = `(${conditions.join(" | ")})`;
			this.whereConditions.push(orCondition);
		}
		return this;
	}

	/**
	 * Add sorting by field
	 */
	sortBy<F extends ValidFields<T>>(
		field: F,
		direction: "asc" | "desc" = "asc",
	): this {
		this.sortFields.push(`${String(field)} ${direction}`);
		return this;
	}

	/**
	 * Add multiple sort fields
	 */
	sortByMultiple<F extends ValidFields<T>>(
		...sorts: Array<{ field: F; direction?: "asc" | "desc" }>
	): this {
		const sortStrings = sorts.map(
			(sort) => `${String(sort.field)} ${sort.direction || "asc"}`,
		);
		this.sortFields.push(...sortStrings);
		return this;
	}

	/**
	 * Set the limit for the query
	 */
	limit(value: number): this {
		this.limitValue = Math.max(1, Math.min(value, 500)); // IGDB max limit
		return this;
	}

	/**
	 * Set the offset for pagination
	 */
	offset(value: number): this {
		this.offsetValue = Math.max(0, Math.min(value, 10000)); // IGDB max offset
		return this;
	}

	/**
	 * Set search term
	 */
	search(term: string): this {
		this.searchValue = term;
		return this;
	}

	/**
	 * Build the query string
	 */
	build(): string {
		const parts: string[] = [];

		// Fields clause
		if (this.fields.length > 0) {
			parts.push(`fields ${this.fields.join(",")}`);
		}

		// Sort clause
		if (this.sortFields.length > 0) {
			parts.push(`sort ${this.sortFields.join(",")}`);
		}

		// Limit clause
		if (this.limitValue !== undefined) {
			parts.push(`limit ${this.limitValue}`);
		}

		// Offset clause
		if (this.offsetValue !== undefined) {
			parts.push(`offset ${this.offsetValue}`);
		}

		// Search clause
		if (this.searchValue) {
			parts.push(`search "${this.searchValue}"`);
		}

		// Where clause
		if (this.whereConditions.length > 0) {
			parts.push(`where ${this.whereConditions.join(" & ")}`);
		}

		return `${parts.join("; ")};`;
	}

	/**
	 * Get the query options object
	 */
	getOptions(): QueryOptions<T> {
		return {
			fields:
				this.fields.length > 0 ? (this.fields as ValidFields<T>[]) : undefined,
			includeDefaultFields: this.includeDefaultFields,
			where:
				this.whereConditions.length > 0
					? this.whereConditions.join(" & ")
					: undefined,
			sort: this.sortFields.length > 0 ? this.sortFields.join(",") : undefined,
			limit: this.limitValue,
			offset: this.offsetValue,
			search: this.searchValue,
		};
	}

	/**
	 * Reset the query builder
	 */
	reset(): this {
		this.fields = [];
		this.whereConditions = [];
		this.sortFields = [];
		this.limitValue = undefined;
		this.offsetValue = undefined;
		this.searchValue = undefined;
		this.includeDefaultFields = true;
		return this;
	}
}

// ============================================================================
// SPECIALIZED QUERY BUILDERS
// ============================================================================

export class GameQueryBuilder extends IGDBQueryBuilder<GameFields> {
	/**
	 * Filter games by genre
	 */
	byGenre(genreId: number): this {
		return this.where(`genres = ${genreId}`);
	}

	/**
	 * Filter games by platform
	 */
	byPlatform(platformId: number): this {
		return this.where(`platforms = ${platformId}`);
	}

	/**
	 * Filter games by rating range
	 */
	byRating(min: number, max?: number): this {
		if (max !== undefined) {
			return this.where(`rating >= ${min} & rating <= ${max}`);
		}
		return this.where(`rating >= ${min}`);
	}

	/**
	 * Filter games by release date range
	 */
	byReleaseDate(startDate: number, endDate?: number): this {
		if (endDate !== undefined) {
			return this.where(
				`first_release_date >= ${startDate} & first_release_date <= ${endDate}`,
			);
		}
		return this.where(`first_release_date >= ${startDate}`);
	}

	/**
	 * Filter games by company involvement
	 */
	byCompany(
		companyId: number,
		role: "developer" | "publisher" | "both" = "both",
	): this {
		switch (role) {
			case "developer":
				return this.where(
					`involved_companies.developer = true & involved_companies.company = ${companyId}`,
				);
			case "publisher":
				return this.where(
					`involved_companies.publisher = true & involved_companies.company = ${companyId}`,
				);
			default:
				return this.where(`involved_companies.company = ${companyId}`);
		}
	}

	/**
	 * Get popular games (sorted by rating)
	 */
	popular(): this {
		return this.sortBy("total_rating", "desc").where("total_rating != null");
	}

	/**
	 * Get recent games
	 */
	recent(days: number = 30): this {
		const currentTime = Math.floor(Date.now() / 1000);
		const startTime = currentTime - days * 24 * 60 * 60;
		return this.byReleaseDate(startTime, currentTime).sortBy(
			"first_release_date",
			"desc",
		);
	}

	/**
	 * Get upcoming games
	 */
	upcoming(): this {
		const currentTime = Math.floor(Date.now() / 1000);
		return this.byReleaseDate(currentTime).sortBy("first_release_date", "asc");
	}
}

export class GenreQueryBuilder extends IGDBQueryBuilder<GenreFields> {
	/**
	 * Filter genres by name
	 */
	byName(name: string): this {
		return this.where(`name = "${name}"`);
	}

	/**
	 * Search genres by name
	 */
	searchByName(name: string): this {
		return this.search(name);
	}
}

export class CompanyQueryBuilder extends IGDBQueryBuilder<CompanyFields> {
	/**
	 * Filter companies by country
	 */
	byCountry(countryId: number): this {
		return this.where(`country = ${countryId}`);
	}

	/**
	 * Filter developer companies
	 */
	developers(): this {
		return this.where("developed != null");
	}

	/**
	 * Filter publisher companies
	 */
	publishers(): this {
		return this.where("published != null");
	}

	/**
	 * Search companies by name
	 */
	searchByName(name: string): this {
		return this.search(name);
	}
}

export class PlatformQueryBuilder extends IGDBQueryBuilder<PlatformFields> {
	/**
	 * Filter platforms by category
	 */
	byCategory(categoryId: number): this {
		return this.where(`category = ${categoryId}`);
	}

	/**
	 * Filter platforms by generation
	 */
	byGeneration(generation: number): this {
		return this.where(`generation = ${generation}`);
	}

	/**
	 * Search platforms by name
	 */
	searchByName(name: string): this {
		return this.search(name);
	}
}

// ============================================================================
// QUERY BUILDER FACTORY
// ============================================================================

export const IGDBQueryFactory = {
	/**
	 * Create a game query builder
	 */
	games(): GameQueryBuilder {
		return new GameQueryBuilder();
	},

	/**
	 * Create a genre query builder
	 */
	genres(): GenreQueryBuilder {
		return new GenreQueryBuilder();
	},

	/**
	 * Create a company query builder
	 */
	companies(): CompanyQueryBuilder {
		return new CompanyQueryBuilder();
	},

	/**
	 * Create a platform query builder
	 */
	platforms(): PlatformQueryBuilder {
		return new PlatformQueryBuilder();
	},

	/**
	 * Create a generic query builder
	 */
	create<T>(): IGDBQueryBuilder<T> {
		return new IGDBQueryBuilder<T>();
	},
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a simple query for getting an entity by ID
 */
export function queryById<T>(id: number, fields?: ValidFields<T>[]): string {
	const query = new IGDBQueryBuilder<T>();

	if (fields && fields.length > 0) {
		query.select(...fields);
	}

	return query.where(`id = ${id}`).limit(1).build();
}

/**
 * Create a simple query for getting entities by IDs
 */
export function queryByIds<T>(
	ids: number[],
	fields?: ValidFields<T>[],
): string {
	const query = new IGDBQueryBuilder<T>();

	if (fields && fields.length > 0) {
		query.select(...fields);
	}

	const idsString = ids.length === 1 ? `${ids[0]}` : `(${ids.join(",")})`;
	return query.where(`id = ${idsString}`).build();
}

/**
 * Create a search query
 */
export function querySearch<T>(
	searchTerm: string,
	fields?: ValidFields<T>[],
): string {
	const query = new IGDBQueryBuilder<T>();

	if (fields && fields.length > 0) {
		query.select(...fields);
	}

	return query.search(searchTerm).build();
}
