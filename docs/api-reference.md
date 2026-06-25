# API Reference

Complete signatures for all public APIs.

---

## IGDBClient

```ts
class IGDBClient {
  readonly games: IGDBEndpoint<Game>;
  readonly genres: IGDBEndpoint<Genre>;
  readonly platforms: IGDBEndpoint<Platform>;
  readonly companies: IGDBEndpoint<Company>;
  // ...plus every endpoint listed in docs/endpoints.md

  constructor(config: IGDBClientConfig);
  endpoint<TModel extends IGDBEntity = IGDBAnyEntity>(path: string): IGDBEndpoint<TModel>;
  request<T = IGDBAnyEntity>(endpoint: string, query: string): Promise<T[]>;
  count(endpoint: string, query?: string): Promise<number>;
  meta(endpoint: string): Promise<MetaField[]>;
  requestProtobuf(endpoint: string, query: string): Promise<ArrayBuffer>;
  multiQuery<T = IGDBAnyEntity>(query: string | MultiQueryBuilder): Promise<Array<MultiQueryResult<T>>>;
  multiQueryBuilder(): MultiQueryBuilder;
  createWebhook(endpoint: string, options: CreateWebhookOptions): Promise<Webhook>;
  listWebhooks(): Promise<Webhook[]>;
  getWebhook(id: number | string): Promise<Webhook>;
  deleteWebhook(id: number | string): Promise<Webhook>;
  testWebhook(endpoint: string, webhookId: number | string, entityId: number | string): Promise<unknown>;
  dispose(): Promise<void>;
}

interface IGDBClientConfig {
  clientId: string;
  clientSecret: string;
  retry?: Partial<RetryConfig>;
  rateLimit?: RateLimitPluginOptions;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
  transport?: Transport;
  plugins?: ApiPlugin[];
  logger?: LoggerInterface;
}
```

---

## QueryBuilder\<TModel, TShape\>

The `QueryBuilder` is generic over two type parameters:
- `TModel` - the source model (e.g. `Game`)
- `TShape` - the output shape after `.select()` (defaults to `TModel`)

All methods return a new `QueryBuilder` instance. The original is never mutated.

```ts
class QueryBuilder<TModel, TShape = TModel> {

  // Field selection
  select<TNewShape extends Record<string, unknown>>(
    selector: (proxy: SelectProxy<TModel>) => TNewShape
  ): QueryBuilder<TModel, TNewShape>;
  fields(...fields: string[]): QueryBuilder<TModel, TShape>;
  exclude(...fields: string[]): QueryBuilder<TModel, TShape>;

  // Filtering
  where(
    builder: (
      proxy: WhereProxy<TModel>,
      helpers: WhereHelpers
    ) => Condition | Condition[]
  ): QueryBuilder<TModel, TShape>;
  whereRaw(condition: string): QueryBuilder<TModel, TShape>;

  // Sorting
  sort(
    selector: (proxy: SelectProxy<TModel>) => unknown,
    direction?: "asc" | "desc"   // default: "asc"
  ): QueryBuilder<TModel, TShape>;

  // Pagination
  limit(n: number): QueryBuilder<TModel, TShape>;    // 1 to 500
  offset(n: number): QueryBuilder<TModel, TShape>;   // >= 0

  // Full-text search
  search(term: string): QueryBuilder<TModel, TShape>;
  apicalypse(clause: string): QueryBuilder<TModel, TShape>;

  // Execution
  execute(): Promise<TShape[]>;
  first(): Promise<TShape | null>;
  firstOrThrow(endpoint?: string): Promise<TShape>;
  count(): Promise<number>;
  paginate(pageSize?: number): AsyncGenerator<TShape[], void, unknown>;

  // Debug
  raw(): string;
  inspect(): QueryDebugInfo;
  toJSON(): QueryDebugInfo;
  debug(): this;
  explain(): this;
}
```

```ts
interface QueryDebugInfo {
  ast: QueryAST;
  query: string;
}
```

---

## MultiQueryBuilder

```ts
class MultiQueryBuilder {
  query<TModel extends IGDBEntity>(
    endpoint: IGDBEndpoint<TModel>,
    name: string,
    build: (query: QueryBuilder<TModel>) => QueryBuilder<TModel, unknown>
  ): MultiQueryBuilder;
  query<TModel extends IGDBEntity = IGDBEntity>(
    endpoint: string,
    name: string,
    build: (query: QueryBuilder<TModel>) => QueryBuilder<TModel, unknown>
  ): MultiQueryBuilder;
  count<TModel extends IGDBEntity>(
    endpoint: IGDBEndpoint<TModel>,
    name: string,
    build?: (query: QueryBuilder<TModel>) => QueryBuilder<TModel, unknown>
  ): MultiQueryBuilder;
  count<TModel extends IGDBEntity = IGDBEntity>(
    endpoint: string,
    name: string,
    build?: (query: QueryBuilder<TModel>) => QueryBuilder<TModel, unknown>
  ): MultiQueryBuilder;
  raw(): string;
  inspect(): MultiQueryDebugInfo;
  toJSON(): MultiQueryDebugInfo;
}

interface MultiQueryDebugInfo {
  blocks: MultiQueryBlock[];
  query: string;
}
```

---

## WhereHelpers

Passed as the second argument to `.where()` callbacks.

```ts
interface WhereHelpers {
  or(...conditions: Condition[]): Condition;
  and(...conditions: Condition[]): Condition;
  raw(expression: string): Condition;
}
```

---

## ConditionBuilder\<T\>

Returned by accessing a leaf field on the `WhereProxy`.

```ts
interface ConditionBuilder<T> {
  eq(value: T): Condition;
  not(value: T): Condition;
  gt(value: T): Condition;
  gte(value: T): Condition;
  lt(value: T): Condition;
  lte(value: T): Condition;
  in(values: T[]): Condition;
  notIn(values: T[]): Condition;
  contains(value: T): Condition;
  containsAll(values: T[]): Condition;
  excludesAll(values: T[]): Condition;
  exact(values: T[]): Condition;
  isNull(): Condition;
  notNull(): Condition;
  startsWith(value: string, options?: TextMatchOptions): Condition;
  endsWith(value: string, options?: TextMatchOptions): Condition;
  containsText(value: string, options?: TextMatchOptions): Condition;
}
```

---

## Endpoint class

All client endpoint properties use the same class.

```ts
class IGDBEndpoint<TModel extends IGDBEntity = IGDBEntity> {
  readonly path: string;
  query(): QueryBuilder<TModel>;
  findMany(): QueryBuilder<TModel>;
  findById(id: number): Promise<TModel>;
  search(term: string): QueryBuilder<TModel>;
  request<TShape = TModel>(query: string): Promise<TShape[]>;
  count(query?: string): Promise<number>;
  meta(): Promise<MetaField[]>;
  requestProtobuf(query: string): Promise<ArrayBuffer>;
  firstOrThrow(query: string): Promise<TModel>;
}
```

## Reference Helpers

```ts
const coverUrl = buildImageUrl("image_id", {
  size: "cover_big",
  retina: true,
  extension: "webp",
});

const tag = createTagNumber("genre", 5);
```

---

## Errors

```ts
class IGDBError extends Error {}
class IGDBAuthError extends IGDBError {}
class IGDBNotFoundError extends IGDBError {
  readonly endpoint: string;
}
class IGDBRateLimitError extends IGDBError {
  readonly retryAfterMs: number | undefined;
}
class IGDBValidationError extends IGDBError {}
```

---

## Configuration types

```ts
interface RetryConfig {
  maxAttempts: number;
  delayMs?: number;
  jitter?: boolean;
  retriableStatusCodes?: number[];
}

interface RateLimitPluginOptions {
  maxConcurrent?: number;
  minTimeMs?: number;
  maxRequestsPerInterval?: number;
  intervalMs?: number;
}
```

---

## Models

All endpoint model types are exported from the package root, including `Game`,
`Artwork`, `AgeRating`, `CompanyWebsite`, `PopularityPrimitive`, `Webhook`, and
the shared base types `IGDBEntity`, `NamedEntity`, and `ImageEntity`.

Model fields are optional except for core identifiers and a few established
fields, because IGDB only returns fields requested by the APICalypse body.
