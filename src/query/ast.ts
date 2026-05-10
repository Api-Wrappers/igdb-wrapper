import type { Condition } from "../types/query.types";

export interface SortClause {
	field: string;
	direction: "asc" | "desc";
}

export interface QueryAST {
	fields: string[];
	exclude: string[];
	where: Condition[];
	sort?: SortClause;
	limit?: number;
	offset?: number;
	search?: string;
	rawClauses: string[];
}

export function emptyAST(): QueryAST {
	return { exclude: [], fields: [], rawClauses: [], where: [] };
}
