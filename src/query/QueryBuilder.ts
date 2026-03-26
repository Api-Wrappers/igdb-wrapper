import { IGDBNotFoundError, IGDBValidationError } from "../errors.ts";
import type {
	Condition,
	SelectProxy,
	WhereProxy,
} from "../types/query.types.ts";
import type { QueryAST, SortClause } from "./ast.ts";
import { emptyAST } from "./ast.ts";
import { compileAST } from "./compiler.ts";
import {
	createSelectProxy,
	createSortProxy,
	createWhereProxy,
	extractFieldPaths,
	extractSortPath,
} from "./fieldProxy.ts";
import type { WhereHelpers } from "./helpers.ts";
import { whereHelpers } from "./helpers.ts";

export type ExecuteFn<T> = (query: string) => Promise<T[]>;
export type CountFn = (query: string) => Promise<number>;

export class QueryBuilder<TModel, TShape = TModel> {
	readonly #ast: QueryAST;
	readonly #execute: ExecuteFn<TShape>;
	readonly #count: CountFn | null;

	constructor(
		execute: ExecuteFn<TShape>,
		countFn: CountFn | null = null,
		ast?: QueryAST,
	) {
		this.#execute = execute;
		this.#count = countFn;
		this.#ast = ast ?? emptyAST();
	}

	#clone(patch: Partial<QueryAST>): QueryBuilder<TModel, TShape> {
		return new QueryBuilder<TModel, TShape>(this.#execute, this.#count, {
			...this.#ast,
			...patch,
		});
	}

	select<TNewShape extends Record<string, unknown>>(
		selector: (proxy: SelectProxy<TModel>) => TNewShape,
	): QueryBuilder<TModel, TNewShape> {
		const proxy = createSelectProxy<TModel>();
		const shape = selector(proxy);
		const fields = extractFieldPaths(shape);
		const newExecute = this.#execute as unknown as ExecuteFn<TNewShape>;
		return new QueryBuilder<TModel, TNewShape>(newExecute, this.#count, {
			...this.#ast,
			fields,
		});
	}

	where(
		builder: (
			proxy: WhereProxy<TModel>,
			helpers: WhereHelpers,
		) => Condition | Condition[],
	): QueryBuilder<TModel, TShape> {
		const proxy = createWhereProxy<TModel>();
		const result = builder(proxy, whereHelpers);
		const conditions = Array.isArray(result) ? result : [result];
		return this.#clone({ where: [...this.#ast.where, ...conditions] });
	}

	sort(
		selector: (proxy: SelectProxy<TModel>) => unknown,
		direction: SortClause["direction"] = "asc",
	): QueryBuilder<TModel, TShape> {
		const proxy = createSortProxy<TModel>();
		const field = extractSortPath(selector(proxy));
		return this.#clone({ sort: { field, direction } });
	}

	limit(n: number): QueryBuilder<TModel, TShape> {
		if (n < 1 || n > 500) {
			throw new IGDBValidationError(
				`limit() must be between 1 and 500, got ${n}`,
			);
		}
		return this.#clone({ limit: n });
	}

	offset(n: number): QueryBuilder<TModel, TShape> {
		if (n < 0) {
			throw new IGDBValidationError(`offset() must be >= 0, got ${n}`);
		}
		return this.#clone({ offset: n });
	}

	search(term: string): QueryBuilder<TModel, TShape> {
		return this.#clone({ search: term });
	}

	// ---------------------------------------------------------------------------
	// Debug helpers
	// ---------------------------------------------------------------------------

	raw(): string {
		return compileAST(this.#ast);
	}

	debug(): this {
		console.log("[igdb-wrapper] AST:", JSON.stringify(this.#ast, null, 2));
		return this;
	}

	explain(): this {
		console.log(`[igdb-wrapper] Compiled query:\n${this.raw()}`);
		return this;
	}

	// ---------------------------------------------------------------------------
	// Execution
	// ---------------------------------------------------------------------------

	async execute(): Promise<TShape[]> {
		return this.#execute(this.raw());
	}

	/** Returns the first result or null. */
	async first(): Promise<TShape | null> {
		const results = await this.#clone({ limit: 1 }).execute();
		return results[0] ?? null;
	}

	/** Returns the first result or throws IGDBNotFoundError. */
	async firstOrThrow(endpoint = "unknown"): Promise<TShape> {
		const result = await this.first();
		if (result === null) throw new IGDBNotFoundError(endpoint);
		return result;
	}

	/** Returns the total count matching the current where/search filters. */
	async count(): Promise<number> {
		if (!this.#count) {
			throw new IGDBValidationError(
				"count() is not supported on this endpoint",
			);
		}
		// Only where + search are relevant for a count query.
		const countAST: QueryAST = {
			fields: [],
			where: this.#ast.where,
			search: this.#ast.search,
		};
		return this.#count(compileAST(countAST));
	}

	async *paginate(pageSize = 50): AsyncGenerator<TShape[], void, unknown> {
		if (pageSize < 1 || pageSize > 500) {
			throw new IGDBValidationError(
				`paginate() page size must be between 1 and 500, got ${pageSize}`,
			);
		}

		let currentOffset = this.#ast.offset ?? 0;

		while (true) {
			const page = await this.#clone({
				limit: pageSize,
				offset: currentOffset,
			}).execute();

			if (page.length === 0) break;
			yield page;
			if (page.length < pageSize) break;
			currentOffset += pageSize;
		}
	}
}
