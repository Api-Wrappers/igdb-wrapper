# Querying

Every endpoint exposes a `.query()` method that returns a `QueryBuilder`. The builder compiles to an IGDB APICalypse request body.

The builder is **immutable**: each method returns a new instance, so you can safely branch queries.

```ts
const base = client.games.query().where((g) => g.rating.gte(80));

const recent = base.sort((g) => g.first_release_date, "desc").limit(10);
const popular = base.sort((g) => g.rating_count, "desc").limit(10);
// `base` is unchanged
```

---

## select()

Specify which fields to fetch. The proxy argument is fully typed, so your editor can autocomplete model fields and nested relations.

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

// games[0].cover.imageId is fully typed, no `any`
```

The object keys become the TypeScript result shape. The proxy values become IGDB field paths. That means you can rename fields for app code while still requesting the correct IGDB field:

```ts
const games = await client.games
  .query()
  .select((g) => ({
    title: g.name,
    releaseDate: g.first_release_date,
  }))
  .limit(5)
  .execute();

// games[0].title
// games[0].releaseDate
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

## fields() and exclude()

Use raw field paths when IGDB adds a field before the wrapper model is updated,
or when you want to write APICalypse paths directly.

```ts
const games = await client.games
  .query()
  .fields("name", "platforms.name", "cover.image_id")
  .exclude("screenshots")
  .limit(10)
  .execute();
```

`exclude()` compiles to IGDB's `exclude` clause and is commonly paired with
`fields *`.

---

## Choosing between select(), fields(), and request()

Use the highest-level API that still lets you express the query clearly.

| Use this | When |
|---|---|
| `.select()` | You want typed output and editor autocomplete |
| `.fields()` | You know the IGDB field path or the model is missing a new field |
| `.whereRaw()` | Only the filter expression needs raw APICalypse |
| `.apicalypse()` | You need to append a raw APICalypse clause |
| `.request()` | You already have a complete APICalypse body |

```ts
await client.games.request(`
fields name,cover.image_id;
where rating > 90;
sort rating desc;
limit 10;
`);
```

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
| `.notIn(values[])` | `field != (v1, v2, ...)` |
| `.contains(value)` | `field = [value]` |
| `.containsAll(values[])` | `field = [v1, v2, ...]` |
| `.excludesAll(values[])` | `field != [v1, v2, ...]` |
| `.exact(values[])` | `field = {v1, v2, ...}` |
| `.isNull()` | `field = null` |
| `.notNull()` | `field != null` |
| `.startsWith(value)` | `field = "value"*` |
| `.endsWith(value)` | `field = *"value"` |
| `.containsText(value)` | `field = *"value"*` |

Pass `{ caseSensitive: false }` to text matching methods to compile IGDB's
case-insensitive `~` operator.

### Multiple conditions (AND)

Calling `.where()` multiple times chains conditions with `AND`:

```ts
.where((g) => g.rating.gte(80))
.where((g) => g.rating_count.gte(100))
// where rating >= 80 & rating_count >= 100
```

You can also return an array from a single `.where()`:

```ts
.where((g) => [g.rating.gte(80), g.rating_count.gte(100)])
```

### OR conditions

Use the `or` helper from the second argument. No imports needed:

```ts
.where((g, { or }) => or(g.rating.gte(90), g.aggregated_rating.gte(90)))
```

The helper wraps the expression in parentheses, so it composes cleanly with other `.where()` calls:

```ts
.where((g) => g.rating_count.gte(100))
.where((g, { or }) => or(g.rating.gte(90), g.aggregated_rating.gte(90)))
// where rating_count >= 100 & (rating >= 90 | aggregated_rating >= 90)
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

### Raw conditions

For IGDB expressions that are easier to write directly, use `whereRaw()` or
the `raw` helper:

```ts
client.games
  .query()
  .whereRaw("platforms = {48,6}")
  .where((g, { raw }) => raw("themes != (42)"));
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
.limit(20)    // 1 to 500, throws IGDBValidationError outside this range
.offset(40)   // >= 0
```

---

## search()

Full-text search via IGDB's search endpoint. Can be combined with `.where()` to filter results further.

```ts
const results = await client.games
  .search("zelda")
  .where((g) => g.rating.gte(70))
  .limit(10)
  .execute();
```

`client.games.search("zelda")` starts from the games endpoint and applies `search "zelda"; limit 50;`. Use `.query().search("zelda")` when you do not want that default limit.

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
  .firstOrThrow("games"); // Game, never null
```

### count()

Returns the number of documents matching the current `where`/`search` filters. Useful for building pagination UI.

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

If you only need one UI page, use `limit()` and `offset()`. Use `paginate()` for background syncs, exports, and import jobs.

---

## Debug helpers

`raw()` and `inspect()` are side-effect free. `debug()` and `explain()` log and
return `this` so you can keep chaining.

```ts
builder.raw()      // returns the compiled query string
builder.inspect()  // returns { ast, query }
builder.debug()    // logs the structured inspect() payload
builder.explain()  // logs the compiled IGDB query string
```

Use `.apicalypse("...")` to append a raw APICalypse clause after the generated
query when IGDB supports syntax that does not need a dedicated builder method.

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

---

## Multi-query builder

`client.multiQueryBuilder()` builds IGDB multi-query bodies from regular
`QueryBuilder` blocks. Pass endpoint properties, such as `client.games`, when
you want model inference inside the callback.

```ts
const query = client
  .multiQueryBuilder()
  .query(client.games, "Recent Games", (games) =>
    games.fields("id", "name").limit(5),
  )
  .count(client.platforms, "Platform Count");

console.log(query.raw());

const results = await client.multiQuery(query);
```

Raw strings are still supported for custom endpoints or APICalypse syntax that
the builder does not cover:

```ts
await client.multiQuery(`
query games "Top Games" {
  fields name,rating;
  sort rating desc;
  limit 5;
};
`);
```
