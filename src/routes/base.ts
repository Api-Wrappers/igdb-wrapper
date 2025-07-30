import type {
	IGDBEndpoint,
	IGDBResponse,
	IGDBRouteRequestOptions,
} from "@/@types";
import type { IGDBRequestHandler } from "@/request";
import { defaultFields, RATE_LIMIT } from "./constants";

export abstract class IGDBRouteBase {
	protected abstract readonly endpoint: IGDBEndpoint;
	protected abstract readonly defaultFieldsKey: keyof typeof defaultFields;

	constructor(protected readonly requestHandler: IGDBRequestHandler) {}

	/**
	 * Make a request to this route's endpoint
	 */
	protected async makeRequest<T = unknown>(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<T>> {
		const {
			fields = [],
			includeDefaultFields = true,
			sort,
			limit,
			offset,
			search,
			where,
		} = options;

		// Build the fields clause, merging defaultFields if enabled
		const selectedFields = includeDefaultFields
			? [...fields, ...defaultFields[this.defaultFieldsKey]]
			: fields;

		// Remove duplicates and filter out empty strings
		const uniqueFields = [...new Set(selectedFields)].filter(Boolean);

		// Construct the request body
		let requestBody = `fields ${uniqueFields.join(",")}`;

		if (sort) requestBody += `; sort ${sort}`;

		if (limit !== undefined) {
			const l = Math.max(1, Math.min(limit, RATE_LIMIT.MAX_LIMIT_PER_REQUEST));
			requestBody += `; limit ${l}`;
		}

		if (offset !== undefined) {
			const o = Math.max(0, Math.min(offset, RATE_LIMIT.MAX_OFFSET));
			requestBody += `; offset ${o}`;
		}

		if (search) requestBody += `; search "${search}"`;
		if (where) requestBody += `; where ${where}`;

		requestBody += ";";

		return this.requestHandler.post<T>(this.endpoint, requestBody);
	}

	/**
	 * Get all items with optional filtering and pagination
	 */
	async getAll<T = unknown>(
		options: Partial<IGDBRouteRequestOptions> = {},
	): Promise<IGDBResponse<T[]>> {
		return this.makeRequest<T[]>(options);
	}

	/**
	 * Get a single item by ID
	 */
	async getById<T = unknown>(
		id: number,
		options: Partial<Omit<IGDBRouteRequestOptions, "where" | "search">> = {},
	): Promise<IGDBResponse<T[]>> {
		return this.makeRequest<T[]>({
			...options,
			where: `id = ${id}`,
			limit: 1,
		});
	}

	/**
	 * Search for items by name
	 */
	async search<T = unknown>(
		query: string,
		options: Partial<Omit<IGDBRouteRequestOptions, "search">> = {},
	): Promise<IGDBResponse<T[]>> {
		return this.makeRequest<T[]>({
			...options,
			search: query,
		});
	}

	/**
	 * Get items by multiple IDs
	 */
	async getByIds<T = unknown>(
		ids: number[],
		options: Partial<Omit<IGDBRouteRequestOptions, "where">> = {},
	): Promise<IGDBResponse<T[]>> {
		if (ids.length === 0) return [] as IGDBResponse<T[]>;

		const idsString = ids.length === 1 ? `${ids[0]}` : `(${ids.join(",")})`;

		return this.makeRequest<T[]>({
			...options,
			where: `id = ${idsString}`,
		});
	}
}
