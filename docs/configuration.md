# Configuration

`IGDBClient` accepts an `IGDBClientConfig` object. Only `clientId` and `clientSecret` are required — everything else has sensible defaults.

```ts
interface IGDBClientConfig {
  clientId: string;
  clientSecret: string;
  retry?: Partial<RetryOptions>;
  rateLimit?: Partial<RateLimiterOptions>;
}
```

---

## Retry

The client retries failed requests with **exponential backoff**. The delay between attempt `n` is `baseDelayMs * 2^n`.

```ts
interface RetryOptions {
  maxAttempts: number; // default: 3
  baseDelayMs: number; // default: 300
}
```

| Attempt | Delay (default) |
|---|---|
| 1st retry | 300ms |
| 2nd retry | 600ms |
| 3rd retry | 1200ms |

**Example — more aggressive retries:**

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  retry: {
    maxAttempts: 5,
    baseDelayMs: 500,
  },
});
```

**Example — disable retries:**

```ts
retry: { maxAttempts: 1 }
```

---

## Rate Limiting

The built-in rate limiter respects IGDB's constraints by limiting concurrent requests and enforcing a minimum interval between calls.

```ts
interface RateLimiterOptions {
  concurrency: number; // default: 4  — max simultaneous requests
  intervalMs: number;  // default: 250 — min ms between requests
}
```

These defaults keep you comfortably within IGDB's free tier limit of 4 requests per second.

**Example — more conservative limits:**

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  rateLimit: {
    concurrency: 2,
    intervalMs: 500,
  },
});
```

**Example — higher throughput (if you have a paid plan):**

```ts
rateLimit: {
  concurrency: 8,
  intervalMs: 100,
}
```

---

## Full example

```ts
import { IGDBClient } from "@tdanks2000/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
  retry: {
    maxAttempts: 4,
    baseDelayMs: 400,
  },
  rateLimit: {
    concurrency: 3,
    intervalMs: 350,
  },
});
```
