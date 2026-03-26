# Error Handling

igdb-wrapper uses a structured error hierarchy so you can handle failures precisely without parsing error messages.

---

## Error types

All errors extend `IGDBError`, which itself extends the native `Error` class.

```
Error
└── IGDBError
    ├── IGDBAuthError
    ├── IGDBRateLimitError
    ├── IGDBNotFoundError
    └── IGDBValidationError
```

### IGDBError

Base class for all library errors. Catch this if you want to handle any IGDB-related failure in one place.

```ts
import { IGDBError } from "igdb-wrapper";

try {
  await client.games.findById(1);
} catch (err) {
  if (err instanceof IGDBError) {
    console.error("IGDB error:", err.message);
  }
}
```

---

### IGDBAuthError

Thrown when the API returns a `401 Unauthorized` response. This usually means your `clientId` or `clientSecret` is wrong, or your token has been revoked.

```ts
import { IGDBAuthError } from "igdb-wrapper";

if (err instanceof IGDBAuthError) {
  console.error("Authentication failed — check your credentials");
}
```

---

### IGDBRateLimitError

Thrown when the API returns a `429 Too Many Requests` response. The `retryAfterMs` property contains the number of milliseconds to wait before retrying.

The built-in rate limiter and retry logic will handle most transient rate limit hits automatically. This error is only surfaced when all retry attempts are exhausted.

```ts
import { IGDBRateLimitError } from "igdb-wrapper";

if (err instanceof IGDBRateLimitError) {
  console.warn(`Rate limited. Retry after ${err.retryAfterMs}ms`);
}
```

| Property | Type | Description |
|---|---|---|
| `retryAfterMs` | `number` | Milliseconds to wait before the next attempt |

---

### IGDBNotFoundError

Thrown by `.firstOrThrow()` and `findById()` when the query returns no results.

```ts
import { IGDBNotFoundError } from "igdb-wrapper";

if (err instanceof IGDBNotFoundError) {
  console.warn(`No results on endpoint: ${err.endpoint}`);
}
```

| Property | Type | Description |
|---|---|---|
| `endpoint` | `string` | The endpoint that returned no results |

---

### IGDBValidationError

Thrown when you pass invalid arguments to the query builder — for example, a `limit()` value outside `1–500`.

```ts
import { IGDBValidationError } from "igdb-wrapper";

if (err instanceof IGDBValidationError) {
  // Fix the query — this is a programming error, not a runtime one
  console.error("Invalid query:", err.message);
}
```

Common causes:
- `limit(n)` where `n < 1` or `n > 500`
- `offset(n)` where `n < 0`
- `paginate(n)` where `n < 1` or `n > 500`
- Calling `.count()` on an endpoint that doesn't support it

---

## Recommended pattern

```ts
import {
  IGDBAuthError,
  IGDBNotFoundError,
  IGDBRateLimitError,
  IGDBValidationError,
} from "igdb-wrapper";

try {
  const game = await client.games.findById(9999999);
} catch (err) {
  if (err instanceof IGDBNotFoundError) {
    // Expected — handle gracefully
    console.log("Game not found");
  } else if (err instanceof IGDBAuthError) {
    // Likely a misconfiguration
    console.error("Bad credentials — check environment variables");
    process.exit(1);
  } else if (err instanceof IGDBRateLimitError) {
    // Retries exhausted — back off at the application level
    console.warn(`Still rate limited after retries. Wait ${err.retryAfterMs}ms`);
  } else if (err instanceof IGDBValidationError) {
    // Programming error — fix the query
    throw err;
  } else {
    // Unknown error — re-throw
    throw err;
  }
}
```
