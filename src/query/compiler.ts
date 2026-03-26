import type { QueryAST } from "./ast.ts";

export function compileAST(ast: QueryAST): string {
	const parts: string[] = [];

	const fields = ast.fields.length > 0 ? ast.fields : ["*"];
	parts.push(`fields ${fields.join(",")};`);

	if (ast.search) {
		parts.push(`search "${ast.search}";`);
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

	return parts.join("\n");
}
