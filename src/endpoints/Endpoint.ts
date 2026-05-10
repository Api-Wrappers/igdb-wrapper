import { IGDBNotFoundError } from "../errors";
import type { HttpClient } from "../http/HttpClient";
import { QueryBuilder } from "../query/QueryBuilder";
import type { IGDBEntity, MetaField } from "../types/models";

export class IGDBEndpoint<TModel extends IGDBEntity = IGDBEntity> {
	readonly #http: HttpClient;
	readonly #path: string;

	constructor(http: HttpClient, path: string) {
		this.#http = http;
		this.#path = path;
	}

	#execute = <TShape>(query: string): Promise<TShape[]> =>
		this.#http.request<TShape>(this.#path, query);

	#countFn = (query: string): Promise<number> =>
		this.#http.requestCount(this.#path, query);

	get path(): string {
		return this.#path;
	}

	query(): QueryBuilder<TModel> {
		return new QueryBuilder<TModel>(this.#execute, this.#countFn);
	}

	findMany(): QueryBuilder<TModel> {
		return this.query().limit(50);
	}

	findById(id: number): Promise<TModel> {
		return this.query()
			.whereRaw(`id = ${id}`)
			.firstOrThrow(this.#path);
	}

	search(term: string): QueryBuilder<TModel> {
		return this.query().search(term).limit(50);
	}

	request<TShape = TModel>(query: string): Promise<TShape[]> {
		return this.#http.request<TShape>(this.#path, query);
	}

	async count(query = ""): Promise<number> {
		return this.#http.requestCount(this.#path, query);
	}

	meta(): Promise<MetaField[]> {
		return this.#http.get<MetaField[]>(`${this.#path}/meta`);
	}

	requestProtobuf(query: string): Promise<ArrayBuffer> {
		return this.#http.requestProtobuf(this.#path, query);
	}

	async firstOrThrow(query: string): Promise<TModel> {
		const [result] = await this.request<TModel>(`${query}\nlimit 1;`);
		if (!result) throw new IGDBNotFoundError(this.#path);
		return result;
	}
}
