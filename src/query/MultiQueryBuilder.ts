import { IGDBValidationError } from "../errors";
import type { IGDBEndpoint } from "../endpoints/Endpoint";
import type { IGDBEndpointPath } from "../endpoints/registry";
import type { IGDBEntity } from "../types/models";
import { QueryBuilder } from "./QueryBuilder";

type EndpointInput<TModel extends IGDBEntity> =
	| IGDBEndpoint<TModel>
	| IGDBEndpointPath
	| string;
type QueryFactory<TModel extends IGDBEntity> = (
	query: QueryBuilder<TModel>,
) => QueryBuilder<TModel, unknown>;

export interface MultiQueryBlock {
	endpoint: string;
	name: string;
	query: string;
	count: boolean;
}

export interface MultiQueryDebugInfo {
	blocks: MultiQueryBlock[];
	query: string;
}

export class MultiQueryBuilder {
	readonly #blocks: MultiQueryBlock[];

	constructor(blocks: MultiQueryBlock[] = []) {
		this.#blocks = blocks;
	}

	query<TModel extends IGDBEntity>(
		endpoint: IGDBEndpoint<TModel>,
		name: string,
		build: QueryFactory<TModel>,
	): MultiQueryBuilder;
	query<TModel extends IGDBEntity = IGDBEntity>(
		endpoint: IGDBEndpointPath | string,
		name: string,
		build: QueryFactory<TModel>,
	): MultiQueryBuilder;
	query<TModel extends IGDBEntity = IGDBEntity>(
		endpoint: EndpointInput<TModel>,
		name: string,
		build: QueryFactory<TModel>,
	): MultiQueryBuilder {
		return this.#add(endpoint, name, build, false);
	}

	count<TModel extends IGDBEntity>(
		endpoint: IGDBEndpoint<TModel>,
		name: string,
		build?: QueryFactory<TModel>,
	): MultiQueryBuilder;
	count<TModel extends IGDBEntity = IGDBEntity>(
		endpoint: IGDBEndpointPath | string,
		name: string,
		build?: QueryFactory<TModel>,
	): MultiQueryBuilder;
	count<TModel extends IGDBEntity = IGDBEntity>(
		endpoint: EndpointInput<TModel>,
		name: string,
		build: QueryFactory<TModel> = (query) => query,
	): MultiQueryBuilder {
		return this.#add(`${endpointPath(endpoint)}/count`, name, build, true);
	}

	raw(): string {
		return this.#blocks.map(compileBlock).join("\n");
	}

	inspect(): MultiQueryDebugInfo {
		return {
			blocks: this.#blocks.map((block) => ({ ...block })),
			query: this.raw(),
		};
	}

	toJSON(): MultiQueryDebugInfo {
		return this.inspect();
	}

	#add<TModel extends IGDBEntity>(
		endpoint: EndpointInput<TModel>,
		name: string,
		build: QueryFactory<TModel>,
		count: boolean,
	): MultiQueryBuilder {
		const normalizedName = name.trim();
		if (!normalizedName) {
			throw new IGDBValidationError("multi-query name is required");
		}

		const query = build(
			new QueryBuilder<TModel>(async () => {
				throw new IGDBValidationError(
					"multi-query blocks cannot be executed directly",
				);
			}),
		).raw();

		return new MultiQueryBuilder([
			...this.#blocks,
			{
				count,
				endpoint: endpointPath(endpoint),
				name: normalizedName,
				query,
			},
		]);
	}
}

function compileBlock(block: MultiQueryBlock): string {
	return `query ${block.endpoint} ${JSON.stringify(block.name)} {\n${block.query}\n};`;
}

function endpointPath<TModel extends IGDBEntity>(
	endpoint: EndpointInput<TModel>,
): string {
	if (typeof endpoint === "string") return stripSlashes(endpoint);
	return endpoint.path;
}

function stripSlashes(endpoint: IGDBEndpointPath | string): string {
	return endpoint.replace(/^\/+/, "").replace(/\/+$/, "");
}
