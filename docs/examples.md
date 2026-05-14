# Examples

These examples are written as copyable starting points. They assume you already have a client:

```ts
import { IGDBClient } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});
```

For full files, see [`../examples`](../examples).

---

## Search for games

Use `endpoint.search(term)` for IGDB full-text search. It returns a normal query builder, so you can still select fields, filter, sort, and limit.

```ts
const games = await client.games
  .search("zelda")
  .select((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    rating: game.rating,
    cover: {
      imageId: game.cover.image_id,
    },
  }))
  .where((game) => game.rating.gte(70))
  .limit(10)
  .execute();
```

---

## Render cover images

IGDB returns image IDs. Use `buildImageUrl()` to produce a CDN URL.

```ts
import { buildImageUrl } from "@api-wrappers/igdb-wrapper";

const coverUrl = game.cover?.imageId
  ? buildImageUrl(game.cover.imageId, {
      size: "cover_big",
      retina: true,
      extension: "webp",
    })
  : null;
```

---

## Build a paginated UI query

Keep a reusable base query, then branch it into `execute()` and `count()`. Query builders are immutable, so `limit()` and `offset()` do not mutate the base query.

```ts
const pageSize = 20;
const pageIndex = 0;

const baseQuery = client.games
  .query()
  .select((game) => ({
    id: game.id,
    name: game.name,
    rating: game.rating,
    ratingCount: game.rating_count,
  }))
  .where((game) => game.rating_count.gte(100))
  .sort((game) => game.rating, "desc");

const [items, total] = await Promise.all([
  baseQuery.limit(pageSize).offset(pageIndex * pageSize).execute(),
  baseQuery.count(),
]);
```

---

## Stream all pages

Use `paginate()` for jobs, imports, and background syncs where you want to walk through every page until IGDB returns fewer records than requested.

```ts
for await (const page of client.games
  .query()
  .select((game) => ({ id: game.id, name: game.name }))
  .where((game) => game.first_release_date.notNull())
  .paginate(100)) {
  for (const game of page) {
    console.log(game.id, game.name);
  }
}
```

---

## Mix typed and raw filters

Use typed helpers for the readable parts and raw APICalypse for expressions that are more compact in IGDB syntax.

```ts
const games = await client.games
  .query()
  .fields("name", "platforms.name", "genres.name", "cover.image_id")
  .where((game) => game.rating.gte(80))
  .whereRaw("platforms = {48,6}")
  .limit(10)
  .execute();
```

---

## Inspect the generated APICalypse

`raw()` returns the compiled query string. `explain()` logs it and returns the same builder so you can keep chaining.

```ts
const query = client.games
  .query()
  .where((game) => game.rating.gte(90))
  .sort((game) => game.rating, "desc")
  .limit(5);

console.log(query.raw());

const games = await query.explain().execute();
```

---

## Fetch endpoint metadata

Use metadata while building admin tools, schema explorers, or diagnostics.

```ts
const fields = await client.games.meta();

for (const field of fields) {
  console.log(field.name, field.type);
}
```

---

## Multi-query

Multi-query is useful when a screen needs several unrelated datasets in one IGDB request.

```ts
const response = await client.multiQuery(`
query games "Top Games" {
  fields name,rating;
  sort rating desc;
  limit 5;
};

query platforms/count "Platform Count" {
};
`);

const topGames = response.find((entry) => entry.name === "Top Games")?.result;
const platformCount = response.find(
  (entry) => entry.name === "Platform Count",
)?.count;
```

---

## Handle expected errors

```ts
import {
  IGDBAuthError,
  IGDBNotFoundError,
  IGDBRateLimitError,
  IGDBValidationError,
} from "@api-wrappers/igdb-wrapper";

try {
  const game = await client.games.findById(999999999);
  console.log(game.name);
} catch (error) {
  if (error instanceof IGDBNotFoundError) {
    console.log("No game found");
  } else if (error instanceof IGDBAuthError) {
    console.error("Check TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET");
  } else if (error instanceof IGDBRateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfterMs ?? 0}ms`);
  } else if (error instanceof IGDBValidationError) {
    throw error;
  } else {
    throw error;
  }
}
```

---

## Webhooks

```ts
const webhook = await client.createWebhook("games", {
  method: "create",
  secret: process.env.IGDB_WEBHOOK_SECRET!,
  url: "https://example.com/igdb/webhooks/games",
});

await client.testWebhook("games", webhook.id, 1942);

const hooks = await client.listWebhooks();
console.log(hooks.map((hook) => hook.url));
```
