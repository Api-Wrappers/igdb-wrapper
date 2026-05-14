# Getting Started

This guide gets you from a fresh install to a typed IGDB request. The wrapper handles Twitch OAuth token requests for you; your app only provides Twitch application credentials.

## Prerequisites

igdb-wrapper requires **Node.js 18 or later** and uses the native `fetch` API. TypeScript 5+ is recommended for the best type inference experience.

## Installation

```bash
npm install @api-wrappers/igdb-wrapper
# or
pnpm add @api-wrappers/igdb-wrapper
# or
yarn add @api-wrappers/igdb-wrapper
# or
bun add @api-wrappers/igdb-wrapper
```

---

## Obtaining Credentials

IGDB's API is proxied through Twitch. You'll need a free Twitch Developer account to get credentials.

1. Go to [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) and log in
2. Click **Register Your Application**
3. Set the OAuth redirect URL to `http://localhost` (not used, just required)
4. Copy your **Client ID** and generate a **Client Secret**

Store them as environment variables. Do not commit real credentials to source control.

```bash
# .env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

---

## Creating a Client

Create the client once and reuse it across your app. The client caches Twitch access tokens and refreshes them automatically.

```ts
import { IGDBClient } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});
```

For scripts and short-lived jobs, call `dispose()` when the script exits so any internal timers or transports can clean up:

```ts
try {
  // Run IGDB work.
} finally {
  await client.dispose();
}
```

---

## Your First Query

```ts
const topGames = await client.games
  .query()
  .select((game) => ({
    id: game.id,
    name: game.name,
    rating: game.rating,
    releaseDate: game.first_release_date,
  }))
  .where((game) => game.rating.gte(90))
  .sort((game) => game.rating, "desc")
  .limit(5)
  .execute();

for (const game of topGames) {
  console.log(`${game.name}: ${game.rating}`);
}
```

The `.select()` shape controls both the IGDB `fields` clause and the TypeScript result type. In the example above, each item is typed with `id`, `name`, `rating`, and `releaseDate`.

---

## Search Instead of Filter

Use `.search()` when you want IGDB's full-text search:

```ts
const games = await client.games
  .search("metroid")
  .select((game) => ({
    name: game.name,
    slug: game.slug,
    rating: game.rating,
  }))
  .limit(10)
  .execute();
```

`endpoint.search(term)` is shorthand for `endpoint.query().search(term).limit(50)`, so you can keep chaining query builder methods.

---

## Raw APICalypse When You Need It

Typed queries cover the common path, but IGDB has a large APICalypse surface. You can always use raw field paths or raw request bodies:

```ts
const games = await client.games
  .query()
  .fields("name", "platforms.name", "cover.image_id")
  .whereRaw("platforms = {48,6}")
  .limit(10)
  .execute();

const rawGames = await client.games.request(`
fields name,platforms.name;
where platforms = {48,6};
limit 10;
`);
```

---

## Next Steps

- Learn the full query builder API in [Querying](./querying.md)
- Copy task-focused recipes from [Examples](./examples.md)
- Explore all available endpoints in [Endpoints](./endpoints.md)
- Understand how errors are structured in [Error Handling](./error-handling.md)
