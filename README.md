<h1 align="center">@api-wrappers/igdb-wrapper</h1>

<p align="center">
  A type-safe IGDB client with a fluent query builder that keeps APICalypse out of fragile strings.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@api-wrappers/igdb-wrapper"><img alt="npm version" src="https://img.shields.io/npm/v/@api-wrappers/igdb-wrapper"></a>
  <a href="https://www.npmjs.com/package/@api-wrappers/igdb-wrapper"><img alt="npm downloads" src="https://img.shields.io/npm/dm/@api-wrappers/igdb-wrapper"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/npm/l/@api-wrappers/igdb-wrapper"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Api-Wrappers/igdb-wrapper/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Api-Wrappers/igdb-wrapper/stargazers"><img alt="GitHub Repo stars" src="https://img.shields.io/github/stars/api-wrappers/igdb-wrapper"></a>
</p>

IGDB's APICalypse query language is powerful, but raw request strings get
brittle quickly. Field names, filters, nested relations, pagination clauses,
and sort order all live inside string literals that TypeScript cannot check.

`@api-wrappers/igdb-wrapper` keeps the IGDB request model and gives you a
typed, fluent query builder for the parts that usually break: selected fields,
filters, sorting, pagination, endpoint access, auth, retries, rate limiting,
and structured errors. You can still drop to raw APICalypse when IGDB supports
syntax the builder does not cover yet.

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

## Before and after

Raw APICalypse works, but every field and clause is a string:

```ts
const games = await client.request(
  "games",
  `
fields id,name,rating,first_release_date,cover.image_id;
where rating >= 80 & first_release_date >= 1672531200 & platforms = [48,6];
sort rating desc;
limit 10;
`,
);
```

The equivalent query-builder version keeps field names and filter operators in
typed TypeScript code:

```ts
const games = await client.games
  .query()
  .select((game) => ({
    id: game.id,
    name: game.name,
    rating: game.rating,
    releaseDate: game.first_release_date,
    cover: {
      imageId: game.cover.image_id,
    },
  }))
  .where((game) => [
    game.rating.gte(80),
    game.first_release_date.gte(1672531200),
    game.platforms.containsAll([48, 6]),
  ])
  .sort((game) => game.rating, "desc")
  .limit(10)
  .execute();
```

---

## Why use it?

- **Typed query builder:** select fields, compose filters, sort, limit, offset,
  inspect the generated APICalypse with `.raw()` / `.inspect()`, and keep the
  returned shape typed.
- **Endpoint helpers:** every registered IGDB v4 endpoint is exposed as a
  camel-cased `IGDBClient` property with `.query()`, `.findById()`,
  `.search()`, `.request()`, `.count()`, `.meta()`, and protobuf helpers.
- **Auth:** Twitch client credentials are exchanged, cached, and refreshed with
  single-flight concurrency so parallel cold-start requests share one token
  fetch.
- **Retries:** transient failures are retried through `@api-wrappers/api-core`.
- **Rate limiting:** the default limiter matches IGDB's documented request and
  concurrency limits.
- **Pagination:** use `limit()` / `offset()` for UI pages, `.count()` for
  totals, and `.paginate()` for background syncs.
- **Structured errors:** handle `IGDBAuthError`, `IGDBRateLimitError`,
  `IGDBNotFoundError`, and `IGDBValidationError` without parsing strings.
- **api-core runtime:** HTTP transport, plugins, retry, rate limiting, timeout,
  custom fetch, and logging flow through the shared
  `@api-wrappers/api-core` runtime.

---

## API coverage

- Registered IGDB v4 endpoints are available as camel-cased client properties,
  including `games`, `platforms`, `companies`, `covers`, `genres`, `websites`,
  and the rest of the generated endpoint map.
- Each endpoint exposes typed query helpers plus raw escape hatches:
  `.query()`, `.findMany()`, `.findById()`, `.search()`, `.request()`,
  `.count()`, `.meta()`, and `.requestProtobuf()`.
- Client-level helpers cover custom endpoint access, raw requests, counts,
  metadata, protobuf responses, raw or builder-based multi-query bodies, and
  webhooks.
- Utility exports include IGDB image URL building and tag-number creation.

See [Endpoints](./docs/endpoints.md) and [API Reference](./docs/api-reference.md)
for the full surface.

---

## Practical examples

### Search games

```ts
const results = await client.games
  .search("zelda")
  .select((game) => ({
    id: game.id,
    name: game.name,
    slug: game.slug,
    rating: game.rating,
  }))
  .limit(10)
  .execute();
```

### Get a game by ID

```ts
const game = await client.games.findById(1942);
```

### Select only the fields your app needs

```ts
const games = await client.games
  .query()
  .select((game) => ({
    title: game.name,
    summary: game.summary,
    releaseDate: game.first_release_date,
    cover: {
      imageId: game.cover.image_id,
    },
  }))
  .limit(5)
  .execute();
```

### Filter by rating, release date, and platform

```ts
const games = await client.games
  .query()
  .where((game) => [
    game.rating.gte(80),
    game.first_release_date.gte(1672531200),
    game.platforms.containsAll([48, 6]),
  ])
  .limit(20)
  .execute();
```

### Sort results

```ts
const topRated = await client.games
  .query()
  .select((game) => ({ name: game.name, rating: game.rating }))
  .sort((game) => game.rating, "desc")
  .limit(10)
  .execute();
```

### Build paginated UI

```ts
const pageSize = 20;
const pageIndex = 0;

const baseQuery = client.games
  .query()
  .select((game) => ({ id: game.id, name: game.name, rating: game.rating }))
  .where((game) => game.rating_count.gte(100))
  .sort((game) => game.rating, "desc");

const [items, total] = await Promise.all([
  baseQuery.limit(pageSize).offset(pageIndex * pageSize).execute(),
  baseQuery.count(),
]);
```

### Build an IGDB image URL

```ts
import { buildImageUrl } from "@api-wrappers/igdb-wrapper";

const coverUrl = game.cover?.imageId
  ? buildImageUrl(game.cover.imageId, { size: "cover_big", retina: true })
  : null;
```

### Send a multi-query request

Use `multiQueryBuilder()` when each block can be expressed with the normal
query builder. It compiles through the same `.raw()` path as regular queries:

```ts
const query = client
  .multiQueryBuilder()
  .query(client.games, "Top Games", (games) =>
    games.fields("name", "rating").sort((game) => game.rating, "desc").limit(5),
  )
  .count(client.platforms, "Platform Count");

const response = await client.multiQuery(query);
```

Raw IGDB multi-query bodies remain supported for full APICalypse compatibility:

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
```

---

## Common app use cases

- **Game library apps:** search IGDB, store stable IDs, and fetch typed details
  for game pages.
- **Recommendation apps:** filter by rating, platform, genre, release window,
  and popularity signals without hand-building long strings.
- **Launchers:** enrich local game metadata with cover art, platform data,
  release dates, and involved companies.
- **Game collection trackers:** build paginated browse screens, collection
  imports, wishlist views, and background sync jobs.

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

## Runtime support

- Node.js 18+.
- Bun, including the repo's development and validation commands.
- TypeScript 5 or 6 projects.
- Custom `fetch`, transport, plugins, logger, retry, timeout, and rate-limit
  options through `@api-wrappers/api-core`.
- Twitch client credentials should be used from server-side code or trusted
  backend environments, not exposed in browser bundles.

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

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](./docs/getting-started.md) | Installation, credentials, and your first query |
| [Querying](./docs/querying.md) | Full query builder API: select, where, sort, paginate |
| [Examples](./docs/examples.md) | Copyable recipes for search, IDs, field selection, filtering, sorting, pagination, images, and multi-query |
| [Endpoints](./docs/endpoints.md) | All IGDB v4 endpoint properties and raw endpoint access |
| [Error Handling](./docs/error-handling.md) | All error types and how to handle them |
| [Configuration](./docs/configuration.md) | Retry, rate limiting, and advanced options |
| [API Reference](./docs/api-reference.md) | Complete method signatures |
| [Release Readiness](./docs/release-readiness.md) | Trust checklist for releases, docs, CI, package contents, and examples |
| [Contributing Ideas](./docs/contributing-ideas.md) | Beginner-friendly issues and slightly larger contribution ideas |
| [Roadmap](./ROADMAP.md) | Current strengths, known API gaps, and planned improvements |
| [Contributing](./CONTRIBUTING.md) | Setup, validation, code style, and pull request expectations |

Example source files are also available in [`examples/`](./examples).

---

## Release process

Maintainers publish through Changesets on the `main` branch. The release
workflow installs with Bun, runs `bun run verify`, creates or updates the
Changesets version PR when changesets are present, publishes to npm with
provenance, and creates GitHub release notes from the published tag.

Required repository settings:

- `NPM_TOKEN` secret with permission to publish `@api-wrappers/igdb-wrapper`.
- GitHub Actions workflow permissions enabled for contents, pull requests, and
  OIDC provenance.

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
