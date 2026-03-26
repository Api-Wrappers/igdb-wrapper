# API Reference

Complete signatures for all public APIs.

---

## IGDBClient

```ts
class IGDBClient {
  readonly games: GamesEndpoint;
  readonly genres: GenresEndpoint;
  readonly platforms: PlatformsEndpoint;
  readonly companies: CompaniesEndpoint;

  constructor(config: IGDBClientConfig);
}

interface IGDBClientConfig {
  clientId: string;
  clientSecret: string;
  retry?: Partial<RetryOptions>;
  rateLimit?: Partial<RateLimiterOptions>;
}
```

---

## QueryBuilder\<TModel, TShape\>

The `QueryBuilder` is generic over two type parameters:
- `TModel` — the source model (e.g. `Game`)
- `TShape` — the output shape after `.select()` (defaults to `TModel`)

All methods return a new `QueryBuilder` instance — the original is never mutated.

```ts
class QueryBuilder<TModel, TShape = TModel> {

  // Field selection
  select<TNewShape extends Record<string, unknown>>(
    selector: (proxy: SelectProxy<TModel>) => TNewShape
  ): QueryBuilder<TModel, TNewShape>;

  // Filtering
  where(
    builder: (
      proxy: WhereProxy<TModel>,
      helpers: WhereHelpers
    ) => Condition | Condition[]
  ): QueryBuilder<TModel, TShape>;

  // Sorting
  sort(
    selector: (proxy: SelectProxy<TModel>) => unknown,
    direction?: "asc" | "desc"   // default: "asc"
  ): QueryBuilder<TModel, TShape>;

  // Pagination
  limit(n: number): QueryBuilder<TModel, TShape>;    // 1–500
  offset(n: number): QueryBuilder<TModel, TShape>;   // >= 0

  // Full-text search
  search(term: string): QueryBuilder<TModel, TShape>;

  // Execution
  execute(): Promise<TShape[]>;
  first(): Promise<TShape | null>;
  firstOrThrow(endpoint?: string): Promise<TShape>;
  count(): Promise<number>;
  paginate(pageSize?: number): AsyncGenerator<TShape[], void, unknown>;

  // Debug
  raw(): string;
  debug(): this;
  explain(): this;
}
```

---

## WhereHelpers

Passed as the second argument to `.where()` callbacks.

```ts
interface WhereHelpers {
  or(...conditions: Condition[]): Condition;
  and(...conditions: Condition[]): Condition;
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
  contains(value: T): Condition;
}
```

---

## Endpoint classes

### GamesEndpoint

```ts
class GamesEndpoint {
  query(): QueryBuilder<Game>;
  findMany(): QueryBuilder<Game>;           // query().limit(50)
  findById(id: number): Promise<Game>;      // throws IGDBNotFoundError if missing
  search(term: string): QueryBuilder<Game>; // query().search(term).limit(50)
}
```

### GenresEndpoint

```ts
class GenresEndpoint {
  query(): QueryBuilder<Genre>;
  findMany(): QueryBuilder<Genre>;
}
```

### PlatformsEndpoint

```ts
class PlatformsEndpoint {
  query(): QueryBuilder<Platform>;
  findMany(): QueryBuilder<Platform>;
}
```

### CompaniesEndpoint

```ts
class CompaniesEndpoint {
  query(): QueryBuilder<Company>;
  findMany(): QueryBuilder<Company>;
  search(term: string): QueryBuilder<Company>;
}
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
  readonly retryAfterMs: number;
}
class IGDBValidationError extends IGDBError {}
```

---

## Configuration types

```ts
interface RetryOptions {
  maxAttempts: number; // default: 3
  baseDelayMs: number; // default: 300
}

interface RateLimiterOptions {
  concurrency: number; // default: 4
  intervalMs: number;  // default: 250
}
```

---

## Models

```ts
interface Game {
  id: number;
  name: string;
  slug: string;
  summary: string;
  storyline: string;
  rating: number;
  rating_count: number;
  aggregated_rating: number;
  aggregated_rating_count: number;
  first_release_date: number;
  cover: Cover;
  genres: Genre[];
  platforms: Platform[];
  involved_companies: InvolvedCompany[];
  similar_games: Game[];
  url: string;
  status: number;
  category: number;
}

interface Cover {
  id: number;
  image_id: string;
  width: number;
  height: number;
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface Platform {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
}

interface Company {
  id: number;
  name: string;
  description: string;
  country: number;
  slug: string;
}

interface InvolvedCompany {
  id: number;
  company: Company;
  developer: boolean;
  publisher: boolean;
}
```
