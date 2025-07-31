import type {
	Company,
	CompanyQueryBuilder,
	IGDBResponse,
	IGDBRouteRequestOptions,
} from "@/@types";
import { IGDBQueryFactory } from "@/@types";
import { IGDBRouteBase } from "./base";

export class IGDBCompaniesRoute extends IGDBRouteBase {
	protected readonly endpoint = "companies" as const;
	protected readonly defaultFieldsKey = "companies" as const;

	/**
	 * Get companies with enhanced type safety
	 */
	async getCompanies(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getAll<Company>(options);
	}

	/**
	 * Create a type-safe query builder for companies
	 */
	query(): CompanyQueryBuilder {
		return IGDBQueryFactory.companies();
	}

	/**
	 * Get a single company by ID
	 */
	async getCompany(
		id: number,
		options: Partial<Omit<IGDBRouteRequestOptions, "where" | "search">> = {},
	): Promise<Company | null> {
		const result = await this.getById<Company>(id, options);
		return Array.isArray(result) && result.length > 0
			? (result[0] ?? null)
			: null;
	}

	/**
	 * Search for companies by name
	 */
	async searchCompanies(
		query: string,
		options: Partial<Omit<IGDBRouteRequestOptions, "search">> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.search<Company>(query, options);
	}

	/**
	 * Get companies by multiple IDs
	 */
	async getCompaniesByIds(
		ids: number[],
		options: Partial<Omit<IGDBRouteRequestOptions, "where">> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getByIds<Company>(ids, options);
	}

	/**
	 * Get all companies sorted by name
	 */
	async getAllCompaniesSorted(
		options: Partial<Omit<IGDBRouteRequestOptions, "sort">> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getCompanies({
			...options,
			sort: "name asc",
		});
	}

	/**
	 * Get companies by country code
	 */
	async getCompaniesByCountry(
		countryCode: number,
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getCompanies({
			...options,
			where: options.where
				? `${options.where} & country = ${countryCode}`
				: `country = ${countryCode}`,
		});
	}

	/**
	 * Get companies that developed games (have developed games)
	 */
	async getDeveloperCompanies(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getCompanies({
			...options,
			where: options.where
				? `${options.where} & developed != null`
				: "developed != null",
		});
	}

	/**
	 * Get companies that published games (have published games)
	 */
	async getPublisherCompanies(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<Company[]>> {
		return this.getCompanies({
			...options,
			where: options.where
				? `${options.where} & published != null`
				: "published != null",
		});
	}
}
