# Endpoints

All endpoints are available as properties on the `IGDBClient` instance. Each exposes a `.query()` method returning a fully-typed `QueryBuilder`, plus a handful of convenience methods.

```
client.games
client.genres
client.platforms
client.companies
```

---

## client.games

Model: `Game`

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
  first_release_date: number; // Unix timestamp
  cover: Cover;
  genres: Genre[];
  platforms: Platform[];
  involved_companies: InvolvedCompany[];
  similar_games: Game[];
  url: string;
  status: number;
  category: number;
}
```

### Methods

**`query()`** — returns a base `QueryBuilder<Game>` with no filters applied.

**`findMany()`** — shorthand for `query().limit(50)`.

**`findById(id: number)`** — fetches a single game by ID. Throws `IGDBNotFoundError` if not found.

```ts
const game = await client.games.findById(1942); // Hades
```

**`search(term: string)`** — shorthand for `query().search(term).limit(50)`.

```ts
const results = await client.games.search("hollow knight");
```

> The `games` endpoint also supports `.count()` on its `QueryBuilder`.

---

## client.genres

Model: `Genre`

```ts
interface Genre {
  id: number;
  name: string;
  slug: string;
}
```

### Methods

**`query()`**, **`findMany()`** — same as games.

```ts
const genres = await client.genres.findMany().execute();
```

---

## client.platforms

Model: `Platform`

```ts
interface Platform {
  id: number;
  name: string;
  slug: string;
  abbreviation: string;
}
```

### Methods

**`query()`**, **`findMany()`**

```ts
const ps5 = await client.platforms
  .query()
  .where((p) => p.slug.eq("ps5"))
  .first();
```

---

## client.companies

Model: `Company`

```ts
interface Company {
  id: number;
  name: string;
  description: string;
  country: number;
  slug: string;
}
```

### Methods

**`query()`**, **`findMany()`**, **`search(term)`**

```ts
const fromJapan = await client.companies
  .query()
  .where((c) => c.country.eq(392)) // ISO 3166-1 numeric
  .limit(20)
  .execute();
```

---

## Related types

```ts
interface Cover {
  id: number;
  image_id: string;
  width: number;
  height: number;
}

interface InvolvedCompany {
  id: number;
  company: Company;
  developer: boolean;
  publisher: boolean;
}
```
