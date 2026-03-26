import type { Condition, ConditionBuilder } from "../types/query.types.ts";

function condition(raw: string): Condition {
	return { raw };
}

function formatValue(value: unknown): string {
	if (typeof value === "string") return `"${value}"`;
	return String(value);
}

export function buildConditionBuilder<T>(field: string): ConditionBuilder<T> {
	return {
		eq: (v) => condition(`${field} = ${formatValue(v)}`),
		not: (v) => condition(`${field} != ${formatValue(v)}`),
		gt: (v) => condition(`${field} > ${formatValue(v)}`),
		gte: (v) => condition(`${field} >= ${formatValue(v)}`),
		lt: (v) => condition(`${field} < ${formatValue(v)}`),
		lte: (v) => condition(`${field} <= ${formatValue(v)}`),
		in: (vals) => condition(`${field} = (${vals.map(formatValue).join(",")})`),
		contains: (v) => condition(`${field} = [${formatValue(v)}]`),
	};
}
