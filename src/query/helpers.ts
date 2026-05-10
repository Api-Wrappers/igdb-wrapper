import type { Condition } from "../types/query.types";

export interface WhereHelpers {
	/** Joins conditions with | (OR) */
	or(...conditions: Condition[]): Condition;
	/** Joins conditions with & (AND) — useful for explicit grouping */
	and(...conditions: Condition[]): Condition;
	/** Adds an APICalypse filter expression verbatim. */
	raw(expression: string): Condition;
}

export const whereHelpers: WhereHelpers = {
	or(...conditions) {
		return { raw: `(${conditions.map((c) => c.raw).join(" | ")})` };
	},
	and(...conditions) {
		return { raw: `(${conditions.map((c) => c.raw).join(" & ")})` };
	},
	raw(expression) {
		return { raw: expression.trim().replace(/;$/, "") };
	},
};
