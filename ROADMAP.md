# Roadmap

This roadmap keeps future work focused on the package's main promise: a
type-safe IGDB client that avoids brittle APICalypse strings without blocking
raw IGDB access when needed.

## Current Strengths

- Typed query builder for field selection, filters, sorting, limits, offsets,
  counts, and async pagination.
- Endpoint helpers for registered IGDB v4 endpoints.
- Twitch credential auth with token caching.
- Retry, timeout, plugin, and rate-limit behavior through
  `@api-wrappers/api-core`.
- Structured errors for auth, rate limit, not found, and validation cases.
- Image URL, tag number, meta, protobuf, webhook, and raw multi-query helpers.

## Near Term

- Add more copyable examples for common product surfaces such as library pages,
  game detail pages, search results, and background syncs.
- Improve generated model docs so users can discover IGDB fields without
  opening source files.
- Add tests that assert README and docs snippets compile where practical.
- Add package-content smoke tests for the published tarball.
- Expand endpoint docs with the searchable endpoints and common field sets.

## Query Builder Ergonomics

- Explore a typed multi-query builder. `client.multiQuery()` currently accepts
  IGDB's raw multi-query body, which is accurate but still string-based.
- Improve relation-array result typing for `select()` examples that fetch nested
  arrays such as `platforms.name` or `genres.name`.
- Consider clearer helpers for IGDB array/set expressions so fewer examples need
  `whereRaw()`.
- Add date helper recipes for converting JavaScript `Date` values to IGDB Unix
  timestamps.
- Add optional query snippet tooling that prints the generated APICalypse for
  docs and debugging.

## Reliability and Trust

- Keep CI running typecheck, tests, build, and package smoke checks.
- Maintain a release-readiness checklist for every release.
- Add more structured error tests around HTTP status handling and retry
  exhaustion.
- Document supported runtimes and compatibility expectations.

## Not Planned Right Now

- Hiding APICalypse completely. IGDB adds syntax and endpoints over time, so raw
  escape hatches will remain part of the public API.
- Browser-only credentials flow. Twitch client secrets should stay server-side.
