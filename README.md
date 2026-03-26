# igdb-wrapper

A type-safe TypeScript client for the [IGDB API](https://api.igdb.com) with a fluent query builder, automatic retries, and built-in rate limiting.

```ts
const games = await client.games
  .query()
  .select((g) => ({ name: g.name, rating: g.rating }))
  .where((g, { or }) => or(g.rating.gte(90), g.aggregated_rating.gte(90)))
  .sort((g) => g.rating, "desc")
  .limit(10)
  .execute();
```

---

## Features

- **Fully type-safe** — field selection and where conditions are inferred from your model types, with no stringly-typed field names
- **Fluent query builder** — chainable `.select()`, `.where()`, `.sort()`, `.limit()`, `.offset()`, `.search()`
- **Automatic retries** — exponential backoff on transient failures, configurable
- **Rate limiting** — respects IGDB's concurrency limits out of the box
- **Pagination** — async generator via `.paginate()`, plus `.count()` for UI pagination
- **Structured errors** — `IGDBAuthError`, `IGDBRateLimitError`, `IGDBNotFoundError`, `IGDBValidationError`

---

## Installation

```bash
npm install igdb-wrapper
# or
yarn add igdb-wrapper
# or
pnpm add igdb-wrapper
# or
bun add igdb-wrapper
```

> **Requirements:** Node.js 18+ (uses native `fetch`). TypeScript 5+ recommended.

---

## Quick Start

You'll need a [Twitch Developer application](https://dev.twitch.tv/console/apps) to obtain a `client_id` and `client_secret`.

```ts
import { IGDBClient } from "igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});

const game = await client.games
  .query()
  .where((g) => g.slug.eq("elden-ring"))
  .first();

console.log(game?.name); // "Elden Ring"
```

---

## Documentation

| Guide | Description |
|---|---|
| [Getting Started](./docs/getting-started.md) | Installation, credentials, and your first query |
| [Querying](./docs/querying.md) | Full query builder API — select, where, sort, paginate |
| [Endpoints](./docs/endpoints.md) | Games, Genres, Platforms, Companies |
| [Error Handling](./docs/error-handling.md) | All error types and how to handle them |
| [Configuration](./docs/configuration.md) | Retry, rate limiting, and advanced options |
| [API Reference](./docs/api-reference.md) | Complete method signatures |

---

## License

MIT
