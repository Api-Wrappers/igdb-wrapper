import type { HttpClient } from "../http/HttpClient.ts";
import { QueryBuilder } from "../query/QueryBuilder.ts";
import type { Game } from "../types/models.ts";

export class GamesEndpoint {
	readonly #http: HttpClient;

	constructor(http: HttpClient) {
		this.#http = http;
	}

	#execute = <T>(query: string): Promise<T[]> =>
		this.#http.request<T>("games", query);

	#countFn = (query: string): Promise<number> =>
		this.#http.requestCount("games", query);

	query(): QueryBuilder<Game> {
		return new QueryBuilder<Game>(this.#execute, this.#countFn);
	}

	findMany(): QueryBuilder<Game> {
		return this.query().limit(50);
	}

	findById(id: number): Promise<Game> {
		return this.query()
			.where((g) => g.id.eq(id))
			.firstOrThrow("games");
	}

	search(term: string): QueryBuilder<Game> {
		return this.query().search(term).limit(50);
	}
}
