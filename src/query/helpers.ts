import type { Condition } from "../types/query.types.ts";

export interface WhereHelpers {
	/** Joins conditions with | (OR) */
	or(...conditions: Condition[]): Condition;
	/** Joins conditions with & (AND) — useful for explicit grouping */
	and(...conditions: Condition[]): Condition;
}

export const whereHelpers: WhereHelpers = {
	or(...conditions) {
		return { raw: `(${conditions.map((c) => c.raw).join(" | ")})` };
	},
	and(...conditions) {
		return { raw: `(${conditions.map((c) => c.raw).join(" & ")})` };
	},
};
