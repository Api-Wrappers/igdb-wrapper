# Getting Started

## Prerequisites

igdb-wrapper requires **Node.js 18 or later** and uses the native `fetch` API. TypeScript 5+ is recommended for the best type inference experience.

## Installation

```bash
npm install igdb-wrapper
# or
pnpm add igdb-wrapper
# or
yarn add igdb-wrapper
# or
bun add igdb-wrapper
```

---

## Obtaining Credentials

IGDB's API is proxied through Twitch. You'll need a free Twitch Developer account to get credentials.

1. Go to [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps) and log in
2. Click **Register Your Application**
3. Set the OAuth redirect URL to `http://localhost` (not used, just required)
4. Copy your **Client ID** and generate a **Client Secret**

Store them as environment variables — never commit them to source control.

```bash
# .env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

---

## Creating a Client

```ts
import { IGDBClient } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
});
```

The client handles OAuth token acquisition and refresh automatically. You do not need to manage tokens yourself.

---

## Your First Query

```ts
// Fetch the top 5 highest-rated games
const topGames = await client.games
  .query()
  .select((g) => ({
    name: g.name,
    rating: g.rating,
    releaseDate: g.first_release_date,
  }))
  .where((g) => g.rating.gte(90))
  .sort((g) => g.rating, "desc")
  .limit(5)
  .execute();

for (const game of topGames) {
  console.log(`${game.name} — ${game.rating}`);
}
```

---

## Next Steps

- Learn the full query builder API in [Querying](./querying.md)
- Explore all available endpoints in [Endpoints](./endpoints.md)
- Understand how errors are structured in [Error Handling](./error-handling.md)
