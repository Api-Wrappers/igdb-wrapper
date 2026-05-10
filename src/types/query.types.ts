export type SelectProxy<T> = {
	[K in keyof T]-?: NonNullable<T[K]> extends Array<infer U>
		? SelectProxy<NonNullable<U>> & { $all: SelectProxyLeaf }
		: NonNullable<T[K]> extends object
			? SelectProxy<NonNullable<T[K]>> & { $all: SelectProxyLeaf }
			: NonNullable<T[K]>;
} & { $all: SelectProxyLeaf };

// Opaque marker type — the proxy returns this when .$all is accessed.
// extractFieldPaths reads FIELD_PATH from it just like any other leaf.
export type SelectProxyLeaf = { readonly __leaf: unique symbol };

export type WhereProxy<T> = {
	[K in keyof T]-?: NonNullable<T[K]> extends Array<infer U>
		? WhereProxy<NonNullable<U>> & ConditionBuilder<ConditionValue<U>>
		: NonNullable<T[K]> extends object
			? WhereProxy<NonNullable<T[K]>> &
					ConditionBuilder<ConditionValue<NonNullable<T[K]>>>
			: ConditionBuilder<ConditionValue<NonNullable<T[K]>>>;
};

export type ConditionValue<T> = T extends null | undefined
	? T
	: T extends string | number | boolean
		? T
		: number;

export interface ConditionBuilder<_T> {
	eq(value: _T | null): Condition;
	not(value: _T | null): Condition;
	gt(value: _T): Condition;
	gte(value: _T): Condition;
	lt(value: _T): Condition;
	lte(value: _T): Condition;
	in(values: _T[]): Condition;
	notIn(values: _T[]): Condition;
	contains(value: _T): Condition;
	containsAll(values: _T[]): Condition;
	excludesAll(values: _T[]): Condition;
	exact(values: _T[]): Condition;
	isNull(): Condition;
	notNull(): Condition;
	startsWith(value: string, options?: TextMatchOptions): Condition;
	endsWith(value: string, options?: TextMatchOptions): Condition;
	containsText(value: string, options?: TextMatchOptions): Condition;
}

export interface Condition {
	raw: string;
}

export interface TextMatchOptions {
	caseSensitive?: boolean;
}

export type SelectorOutput<TModel, TShape> = TShape extends Record<
	string,
	unknown
>
	? { [K in keyof TShape]: TShape[K] }
	: never;

export type InferShape<
	TProxy,
	TSelector extends (proxy: TProxy) => unknown,
> = ReturnType<TSelector>;
