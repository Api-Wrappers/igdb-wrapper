# Querying

Every endpoint exposes a `.query()` method that returns a `QueryBuilder`. The builder is **immutable** — each method returns a new instance, so you can safely branch queries.

```ts
const base = client.games.query().where((g) => g.rating.gte(80));

const recent = base.sort((g) => g.first_release_date, "desc").limit(10);
const popular = base.sort((g) => g.rating_count, "desc").limit(10);
// `base` is unchanged
```

---

## select()

Specify which fields to fetch. The proxy argument is fully typed — your editor will autocomplete every field and nested relation.

```ts
const games = await client.games
  .query()
  .select((g) => ({
    name: g.name,
    rating: g.rating,
    cover: {
      imageId: g.cover.image_id,
    },
  }))
  .execute();

// games[0].cover.imageId — fully typed, no `any`
```

**Fetching all fields on a relation** with `.$all`:

```ts
.select((g) => ({
  name: g.name,
  genres: g.genres.$all,       // fetches genres.*
  platforms: g.platforms.$all, // fetches platforms.*
}))
```

If `.select()` is omitted, the query defaults to `fields *` (all top-level fields).

---

## where()

Filter results using typed condition builders. The callback receives a proxy of your model and an optional helpers object.

### Basic conditions

```ts
.where((g) => g.slug.eq("elden-ring"))
.where((g) => g.rating.gte(85))
.where((g) => g.first_release_date.gt(1672531200)) // Unix timestamp
```

### Available operators

| Method | IGDB equivalent |
|---|---|
| `.eq(value)` | `field = value` |
| `.not(value)` | `field != value` |
| `.gt(value)` | `field > value` |
| `.gte(value)` | `field >= value` |
| `.lt(value)` | `field < value` |
| `.lte(value)` | `field <= value` |
| `.in(values[])` | `field = (v1, v2, ...)` |
| `.contains(value)` | `field = [value]` |

### Multiple conditions (AND)

Calling `.where()` multiple times chains conditions with `AND`:

```ts
.where((g) => g.rating.gte(80))
.where((g) => g.rating_count.gte(100))
// → where rating >= 80 & rating_count >= 100
```

You can also return an array from a single `.where()`:

```ts
.where((g) => [g.rating.gte(80), g.rating_count.gte(100)])
```

### OR conditions

Use the `or` helper from the second argument — no imports needed:

```ts
.where((g, { or }) => or(g.rating.gte(90), g.aggregated_rating.gte(90)))
```

### AND grouping

Use `and` to group sub-expressions:

```ts
.where((g, { or, and }) =>
  or(
    and(g.rating.gte(90), g.rating_count.gte(500)),
    g.aggregated_rating.gte(95),
  )
)
```

### Nested fields

```ts
.where((g) => g.genres.id.eq(12))           // genres.id = 12
.where((g) => g.cover.width.gte(1080))      // cover.width >= 1080
.where((g) => g.involved_companies.developer.eq(true))
```

---

## sort()

```ts
.sort((g) => g.rating, "desc")              // sort rating desc
.sort((g) => g.first_release_date, "asc")  // sort first_release_date asc
```

The default direction is `"asc"`.

---

## limit() and offset()

```ts
.limit(20)    // 1–500, throws IGDBValidationError outside this range
.offset(40)   // >= 0
```

---

## search()

Full-text search via IGDB's search endpoint. Can be combined with `.where()` to filter results further.

```ts
const results = await client.games
  .query()
  .search("zelda")
  .where((g) => g.rating.gte(70))
  .limit(10)
  .execute();
```

---

## Execution methods

### execute()

Returns all matching results as an array.

```ts
const games: Game[] = await client.games.query().execute();
```

### first()

Returns the first result or `null`. Internally applies `limit(1)`.

```ts
const game = await client.games
  .query()
  .where((g) => g.slug.eq("elden-ring"))
  .first(); // Game | null
```

### firstOrThrow(endpoint?)

Like `first()`, but throws `IGDBNotFoundError` instead of returning `null`.

```ts
const game = await client.games
  .query()
  .where((g) => g.slug.eq("elden-ring"))
  .firstOrThrow("games"); // Game — never null
```

### count()

Returns the number of documents matching the current `where`/`search` filters. Useful for building pagination UI. Only available on endpoints that support it (currently `games`).

```ts
const total = await client.games
  .query()
  .where((g) => g.rating.gte(80))
  .count(); // number
```

### paginate(pageSize?)

An async generator that yields pages of results until exhausted. Default page size is 50.

```ts
for await (const page of client.games.query().paginate(20)) {
  for (const game of page) {
    console.log(game.name);
  }
}
```

---

## Debug helpers

These methods are for development only and return `this` so you can keep chaining.

```ts
builder.debug()    // logs the internal AST as JSON
builder.explain()  // logs the compiled IGDB query string
builder.raw()      // returns the compiled query string
```

Example:

```ts
client.games
  .query()
  .where((g) => g.rating.gte(90))
  .sort((g) => g.rating, "desc")
  .explain()
  .execute();

// [igdb-wrapper] Compiled query:
// fields *;
// where rating >= 90;
// sort rating desc;
```
