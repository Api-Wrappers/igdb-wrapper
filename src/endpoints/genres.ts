import type { HttpClient } from "../http/HttpClient.ts";
import { QueryBuilder } from "../query/QueryBuilder.ts";
import type { Genre } from "../types/models.ts";

export class GenresEndpoint {
	readonly #http: HttpClient;
	constructor(http: HttpClient) {
		this.#http = http;
	}
	#execute = <T>(query: string): Promise<T[]> =>
		this.#http.request<T>("genres", query);
	query(): QueryBuilder<Genre> {
		return new QueryBuilder<Genre>(this.#execute);
	}
	findMany(): QueryBuilder<Genre> {
		return this.query().limit(50);
	}
}
