import type { HttpClient } from "../http/HttpClient.ts";
import { QueryBuilder } from "../query/QueryBuilder.ts";
import type { Platform } from "../types/models.ts";

export class PlatformsEndpoint {
	readonly #http: HttpClient;
	constructor(http: HttpClient) {
		this.#http = http;
	}
	#execute = <T>(query: string): Promise<T[]> =>
		this.#http.request<T>("platforms", query);
	query(): QueryBuilder<Platform> {
		return new QueryBuilder<Platform>(this.#execute);
	}
	findMany(): QueryBuilder<Platform> {
		return this.query().limit(50);
	}
}
