# Examples

These files show practical ways to use `@api-wrappers/igdb-wrapper`.

## Setup

Create a Twitch Developer application, then expose the credentials before running an example:

```bash
export TWITCH_CLIENT_ID=your_client_id
export TWITCH_CLIENT_SECRET=your_client_secret
```

From this repository, build the package first so local package exports point at `dist`:

```bash
bun run build
bun run examples/search-games.ts
```

In a separate app that already installed the package, copy an example file and run it with your normal TypeScript runtime.

## Files

| File | Shows |
|---|---|
| [`client.ts`](./client.ts) | Shared client creation and credential checks |
| [`search-games.ts`](./search-games.ts) | Full-text search, typed selection, filters, and image URLs |
| [`paginated-browser.ts`](./paginated-browser.ts) | Immutable base queries, UI pagination, and counts |
| [`raw-apicalypse.ts`](./raw-apicalypse.ts) | Mixing typed filters with raw APICalypse fields |
| [`multi-query.ts`](./multi-query.ts) | Fetching multiple result blocks in one IGDB request |
