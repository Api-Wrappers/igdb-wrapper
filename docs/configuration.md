# Configuration

`IGDBClient` accepts an `IGDBClientConfig` object. Only `clientId` and
`clientSecret` are required. HTTP execution is powered by
`@api-wrappers/api-core`.

The default configuration is intended to be production-safe for normal IGDB usage. Reach for these options when you need stricter timeouts, custom fetch behavior, additional api-core plugins, or different retry/rate-limit behavior.

```ts
interface IGDBClientConfig {
  clientId: string;
  clientSecret: string;
  retry?: Partial<RetryConfig>;
  rateLimit?: RateLimitPluginOptions;
  timeoutMs?: number;
  fetch?: typeof globalThis.fetch;
  transport?: Transport;
  plugins?: ApiPlugin[];
  logger?: LoggerInterface;
}
```

---

## Retry

The client retries transient failures with api-core's retry loop. Defaults are
`maxAttempts: 3` and `delayMs: 300`. Backoff is exponential, and api-core uses
jitter unless you set `jitter: false`.

```ts
interface RetryConfig {
  maxAttempts: number;
  delayMs?: number;
  jitter?: boolean;
  retriableStatusCodes?: number[];
}
```

**Example - more aggressive retries:**

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  retry: {
    maxAttempts: 5,
    delayMs: 500,
  },
});
```

**Example - disable retries:**

```ts
retry: { maxAttempts: 1 }
```

---

## Rate Limiting

The built-in rate limiter uses api-core's rate limit plugin. Defaults are
`maxConcurrent: 8`, `maxRequestsPerInterval: 4`, `intervalMs: 1000`, and
`minTimeMs: 250`, matching IGDB's documented 4 requests-per-second rate limit
and 8 open-request concurrency limit.

```ts
interface RateLimitPluginOptions {
  maxConcurrent?: number;
  minTimeMs?: number;
  maxRequestsPerInterval?: number;
  intervalMs?: number;
}
```

**Example - more conservative limits:**

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  rateLimit: {
    maxConcurrent: 2,
    minTimeMs: 500,
  },
});
```

**Example - higher throughput:**

```ts
rateLimit: {
  maxConcurrent: 8,
  maxRequestsPerInterval: 4,
  intervalMs: 1000,
}
```

---

## Core Options

The wrapper forwards these api-core options to the IGDB HTTP client:

- `timeoutMs` sets a request timeout.
- `fetch` swaps the fetch implementation and is also used for Twitch token
  requests.
- `transport` replaces the IGDB request transport.
- `plugins` appends additional api-core plugins after the built-in rate limit
  and auth plugins.
- `logger` controls api-core diagnostic logging.

### Custom fetch

Pass `fetch` when you need to run through a custom HTTP stack, add test doubles, or use a runtime-specific implementation. The same function is used for Twitch token requests and IGDB API requests.

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  fetch: async (input, init) => {
    console.log("IGDB request:", input);
    return fetch(input, init);
  },
});
```

### Timeouts

```ts
const client = new IGDBClient({
  clientId: "...",
  clientSecret: "...",
  timeoutMs: 10_000,
});
```

---

## Full Example

```ts
import { IGDBClient } from "@api-wrappers/igdb-wrapper";

const client = new IGDBClient({
  clientId: process.env.TWITCH_CLIENT_ID!,
  clientSecret: process.env.TWITCH_CLIENT_SECRET!,
  retry: {
    maxAttempts: 4,
    delayMs: 400,
  },
  rateLimit: {
    maxConcurrent: 3,
    minTimeMs: 350,
  },
  timeoutMs: 10_000,
});
```
