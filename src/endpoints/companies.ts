import type { HttpClient } from "../http/HttpClient";
import { QueryBuilder } from "../query/QueryBuilder";
import type { Company } from "../types/models";

export class CompaniesEndpoint {
	readonly #http: HttpClient;
	constructor(http: HttpClient) {
		this.#http = http;
	}
	#execute = <T>(query: string): Promise<T[]> =>
		this.#http.request<T>("companies", query);
	query(): QueryBuilder<Company> {
		return new QueryBuilder<Company>(this.#execute);
	}
	findMany(): QueryBuilder<Company> {
		return this.query().limit(50);
	}
	search(term: string): QueryBuilder<Company> {
		return this.query().search(term).limit(50);
	}
}
