import type { QueryAST } from "./ast";
import { quoteString } from "./operators";

export function compileAST(ast: QueryAST): string {
	const parts: string[] = [];

	const fields = ast.fields.length > 0 ? ast.fields : ["*"];
	parts.push(`fields ${fields.join(",")};`);

	if (ast.exclude.length > 0) {
		parts.push(`exclude ${ast.exclude.join(",")};`);
	}

	if (ast.search) {
		parts.push(`search ${quoteString(ast.search)};`);
	}

	if (ast.where.length > 0) {
		const clauses = ast.where.map((c) => c.raw).join(" & ");
		parts.push(`where ${clauses};`);
	}

	if (ast.sort) {
		parts.push(`sort ${ast.sort.field} ${ast.sort.direction};`);
	}

	if (ast.limit !== undefined) {
		parts.push(`limit ${ast.limit};`);
	}

	if (ast.offset !== undefined) {
		parts.push(`offset ${ast.offset};`);
	}

	for (const clause of ast.rawClauses) {
		parts.push(normalizeRawClause(clause));
	}

	return parts.join("\n");
}

function normalizeRawClause(clause: string): string {
	const trimmed = clause.trim();
	return trimmed.endsWith(";") ? trimmed : `${trimmed};`;
}
