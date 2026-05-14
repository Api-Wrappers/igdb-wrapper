<h1 align="center">@api-wrappers/igdb-wrapper</h1>

<p align="center">
  A type-safe TypeScript client for the <a href="https://api.igdb.com">IGDB API</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@api-wrappers/igdb-wrapper"><img alt="npm version" src="https://img.shields.io/npm/v/@api-wrappers/igdb-wrapper"></a>
  <a href="https://www.npmjs.com/package/@api-wrappers/igdb-wrapper"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@api-wrappers/igdb-wrapper"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/@api-wrappers/igdb-wrapper"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Api-Wrappers/igdb-wrapper/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/api-wrappers/igdb-wrapper"></a>
</p>

The package is built for the way IGDB is normally used: start with a typed query, shape the fields you want, drop to raw APICalypse only when you need to, and keep your app code readable.

```ts
import { IGDBClient, buildImageUrl } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});

const games = await client.games
  .query()
  .select((game) => ({
    id: game.id,
    name: game.name,
    rating: game.rating,
    cover: {
      imageId: game.cover.image_id,
    },
  }))
  .where((game, { or }) =>
    or(game.rating.gte(90), game.aggregated_rating.gte(90)),
  )
  .sort((game) => game.rating, "desc")
  .limit(5)
  .execute();

for (const game of games) {
  const coverUrl = game.cover?.imageId
    ? buildImageUrl(game.cover.imageId, { size: "cover_big", retina: true })
    : null;

  console.log(game.name, game.rating, coverUrl);
}
```

---

## Why use it?

- **Typed field selection** with editor autocomplete for model fields and nested relations.
- **Readable filters** through `.where()`, `or()`, `and()`, and typed comparison helpers.
- **Raw APICalypse escape hatches** with `.fields()`, `.whereRaw()`, `.apicalypse()`, and `endpoint.request()`.
- **Every registered IGDB v4 endpoint** exposed as a camel-cased `IGDBClient` property.
- **Pagination helpers** with `.count()` and async-generator `.paginate()`.
- **Automatic auth, retry, and rate limiting** through `@api-wrappers/api-core`.
- **Useful extras** for image URLs, tag numbers, `/meta`, protobuf, multi-query, and webhooks.
- **Structured errors** so app code can handle auth, validation, rate limit, and not-found cases directly.

---

## Installation

```bash
npm install @api-wrappers/igdb-wrapper
# or
yarn add @api-wrappers/igdb-wrapper
# or
pnpm add @api-wrappers/igdb-wrapper
# or
bun add @api-wrappers/igdb-wrapper
```

> **Requirements:** Node.js 18+ (uses native `fetch`). TypeScript 5+ recommended.

---

## Quick Start

IGDB uses Twitch application credentials. Create an app in the [Twitch Developer Console](https://dev.twitch.tv/console/apps), then set:

```bash
TWITCH_CLIENT_ID=your_client_id
TWITCH_CLIENT_SECRET=your_client_secret
```

```ts
import { IGDBClient } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});

const game = await client.games
  .query()
  .select((game) => ({
    name: game.name,
    summary: game.summary,
    releaseDate: game.first_release_date,
  }))
  .where((game) => game.slug.eq("elden-ring"))
  .first();

console.log(game?.name);
```

---

## Common Recipes

### Search games

```ts
const results = await client.games
  .search("zelda")
  .select((game) => ({
    name: game.name,
    slug: game.slug,
    rating: game.rating,
  }))
  .where((game) => game.rating.gte(70))
  .limit(10)
  .execute();
```

### Build a paginated list

```ts
const pageSize = 20;
const page = 2;

const query = client.games
  .query()
  .select((game) => ({ name: game.name, rating: game.rating }))
  .where((game) => game.rating_count.gte(100))
  .sort((game) => game.rating, "desc");

const [items, total] = await Promise.all([
  query.limit(pageSize).offset(page * pageSize).execute(),
  query.count(),
]);
```

### Use raw IGDB syntax when needed

```ts
const games = await client.games
  .query()
  .fields("name", "platforms.name", "cover.image_id")
  .whereRaw("platforms = {48,6}")
  .apicalypse("limit 10;")
  .execute();
```

### Fetch a cover URL

```ts
import { buildImageUrl } from "@api-wrappers/igdb-wrapper";

const game = await client.games
  .query()
  .select((game) => ({
    name: game.name,
    cover: { imageId: game.cover.image_id },
  }))
  .where((game) => game.slug.eq("hades"))
  .first();

const coverUrl = game?.cover?.imageId
  ? buildImageUrl(game.cover.imageId, { size: "cover_big", retina: true })
  : null;
```

---

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](./docs/getting-started.md) | Installation, credentials, and your first query |
| [Querying](./docs/querying.md) | Full query builder API: select, where, sort, paginate |
| [Examples](./docs/examples.md) | Copyable recipes for search, pagination, images, raw requests, and webhooks |
| [Endpoints](./docs/endpoints.md) | All IGDB v4 endpoint properties and raw endpoint access |
| [Error Handling](./docs/error-handling.md) | All error types and how to handle them |
| [Configuration](./docs/configuration.md) | Retry, rate limiting, and advanced options |
| [API Reference](./docs/api-reference.md) | Complete method signatures |

Example source files are also available in [`examples/`](./examples).

---

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/Api-Wrappers/igdb-wrapper/blob/main/LICENSE) file for details.

<br/>

# ❤️

<p align="center">
<a target="_blank" href="https://tdanks.com/mental-health/quote">
❤️ Reminder that <strong><i>you are great, you are enough, and your presence is valued.</i></strong> If you are struggling with your mental health, please reach out to someone you love and consult a professional. You are not alone. ❤️
</a>
</p>
