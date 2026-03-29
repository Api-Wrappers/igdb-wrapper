import type {
	ConditionBuilder,
	SelectProxy,
	WhereProxy,
} from "../types/query.types";
import { buildConditionBuilder } from "./operators";

export const FIELD_PATH = Symbol("fieldPath");

const WILDCARD_KEY = "$all";

type AnyProxy = Record<string | symbol, unknown>;

// ---------------------------------------------------------------------------
// Select proxy
// ---------------------------------------------------------------------------

function createSelectProxyNode(path: string[]): AnyProxy {
	return new Proxy({} as AnyProxy, {
		get(_, key: string | symbol) {
			if (key === FIELD_PATH) return path;
			if (typeof key === "symbol") return undefined;

			// .$all → append wildcard to current path: e.g. similar_games.*
			if (key === WILDCARD_KEY) {
				return createSelectProxyNode([...path, "*"]);
			}

			return createSelectProxyNode([...path, key]);
		},
	});
}

export function createSelectProxy<T>(): SelectProxy<T> {
	return createSelectProxyNode([]) as SelectProxy<T>;
}

export function extractFieldPaths(shape: Record<string, unknown>): string[] {
	const paths: string[] = [];

	for (const value of Object.values(shape)) {
		if (value === null || typeof value !== "object") {
			throw new Error(
				`select() received a primitive. Use g.fieldName, g.relation.$all, or nest objects.`,
			);
		}

		const p = (value as AnyProxy)[FIELD_PATH];

		if (Array.isArray(p)) {
			// It's a tracked proxy leaf — use its path directly.
			paths.push((p as string[]).join("."));
		} else {
			// It's a plain nested object — recurse to collect inner paths.
			paths.push(...extractFieldPaths(value as Record<string, unknown>));
		}
	}

	return paths;
}

// ---------------------------------------------------------------------------
// Where proxy
// ---------------------------------------------------------------------------

type WhereNode<T> = WhereProxy<T> & ConditionBuilder<T>;

function createWhereProxyNode<T>(path: string[]): WhereNode<T> {
	const fieldStr = path.join(".");
	const builder = buildConditionBuilder<T>(fieldStr);

	return new Proxy(builder as WhereNode<T>, {
		get(target, key: string | symbol) {
			if (typeof key === "symbol") return undefined;
			if (key in target) return (target as Record<string, unknown>)[key];
			return createWhereProxyNode<unknown>([...path, key]);
		},
	});
}

export function createWhereProxy<T>(): WhereProxy<T> {
	return createWhereProxyNode<T>([]) as WhereProxy<T>;
}

// ---------------------------------------------------------------------------
// Sort proxy
// ---------------------------------------------------------------------------

export function createSortProxy<T>(): SelectProxy<T> {
	return createSelectProxyNode([]) as SelectProxy<T>;
}

export function extractSortPath(proxy: unknown): string {
	const p = (proxy as AnyProxy)[FIELD_PATH];
	if (!Array.isArray(p)) throw new Error(`sort() received a non-proxy value.`);
	return (p as string[]).join(".");
}
