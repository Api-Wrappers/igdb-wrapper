export type SelectProxy<T> = {
	[K in keyof T]: T[K] extends Array<infer U>
		? SelectProxy<U> & { $all: SelectProxyLeaf }
		: T[K] extends object
			? SelectProxy<T[K]> & { $all: SelectProxyLeaf }
			: T[K];
} & { $all: SelectProxyLeaf };

// Opaque marker type — the proxy returns this when .$all is accessed.
// extractFieldPaths reads FIELD_PATH from it just like any other leaf.
export type SelectProxyLeaf = { readonly __leaf: unique symbol };

export type WhereProxy<T> = {
	[K in keyof T]: T[K] extends Array<infer U>
		? WhereProxy<U>
		: T[K] extends object
			? WhereProxy<T[K]>
			: ConditionBuilder<T[K]>;
};

export interface ConditionBuilder<_T> {
	eq(value: _T): Condition;
	not(value: _T): Condition;
	gt(value: _T): Condition;
	gte(value: _T): Condition;
	lt(value: _T): Condition;
	lte(value: _T): Condition;
	in(values: _T[]): Condition;
	contains(value: _T): Condition;
}

export interface Condition {
	raw: string;
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
