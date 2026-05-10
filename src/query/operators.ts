import type {
	Condition,
	ConditionBuilder,
	TextMatchOptions,
} from "../types/query.types";

function condition(raw: string): Condition {
	return { raw };
}

export function formatValue(value: unknown): string {
	if (typeof value === "string") return quoteString(value);
	if (value === null) return "null";
	return String(value);
}

export function quoteString(value: string): string {
	return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
}

function formatValues(values: unknown[], opener: string, closer: string): string {
	return `${opener}${values.map(formatValue).join(",")}${closer}`;
}

function textOperator(options?: TextMatchOptions): "=" | "~" {
	return options?.caseSensitive === false ? "~" : "=";
}

export function buildConditionBuilder<T>(field: string): ConditionBuilder<T> {
	return {
		eq: (v) => condition(`${field} = ${formatValue(v)}`),
		not: (v) => condition(`${field} != ${formatValue(v)}`),
		gt: (v) => condition(`${field} > ${formatValue(v)}`),
		gte: (v) => condition(`${field} >= ${formatValue(v)}`),
		lt: (v) => condition(`${field} < ${formatValue(v)}`),
		lte: (v) => condition(`${field} <= ${formatValue(v)}`),
		in: (vals) => condition(`${field} = ${formatValues(vals, "(", ")")}`),
		notIn: (vals) => condition(`${field} != ${formatValues(vals, "(", ")")}`),
		contains: (v) => condition(`${field} = [${formatValue(v)}]`),
		containsAll: (vals) =>
			condition(`${field} = ${formatValues(vals, "[", "]")}`),
		excludesAll: (vals) =>
			condition(`${field} != ${formatValues(vals, "[", "]")}`),
		exact: (vals) => condition(`${field} = ${formatValues(vals, "{", "}")}`),
		isNull: () => condition(`${field} = null`),
		notNull: () => condition(`${field} != null`),
		startsWith: (value, options) =>
			condition(`${field} ${textOperator(options)} ${quoteString(value)}*`),
		endsWith: (value, options) =>
			condition(`${field} ${textOperator(options)} *${quoteString(value)}`),
		containsText: (value, options) =>
			condition(`${field} ${textOperator(options)} *${quoteString(value)}*`),
	};
}
