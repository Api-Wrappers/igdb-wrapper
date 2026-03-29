import type { Condition } from "../types/query.types";

export interface SortClause {
	field: string;
	direction: "asc" | "desc";
}

export interface QueryAST {
	fields: string[];
	where: Condition[];
	sort?: SortClause;
	limit?: number;
	offset?: number;
	search?: string;
}

export function emptyAST(): QueryAST {
	return { fields: [], where: [] };
}
