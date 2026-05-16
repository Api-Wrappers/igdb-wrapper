# Contributing Ideas

These are beginner-friendly issues that improve trust, examples, and day-to-day
developer experience without requiring deep IGDB knowledge. Each one should be
small enough for a first or second contribution.

## Good First Issues

1. Add a README snippet test that checks the before/after query-builder example
   compiles.
2. Add a docs example for a game detail page with cover art and release date.
3. Add a docs example for a game library search screen with `limit()` and
   `offset()`.
4. Add a docs example for a background sync that uses `.paginate()`.
5. Add a table of common IGDB platform IDs used in examples.
6. Add a short guide for converting JavaScript `Date` values to IGDB Unix
   timestamps.
7. Add package smoke-test instructions that inspect the files included by
   `npm pack`.
8. Add tests for `buildImageUrl()` covering every supported image extension.
9. Add tests for `where()` text matching with case-sensitive and
   case-insensitive options.
10. Add docs for choosing between `.select()`, `.fields()`, `.whereRaw()`, and
    `.request()` in common cases.
11. Add a docs recipe for handling `IGDBRateLimitError` in a background worker.
12. Add a docs recipe for using `client.endpoint(path)` when IGDB adds a new
    endpoint before the wrapper has typed model support.

## Slightly Larger Issues

1. Add compile checks for TypeScript snippets in `docs/examples.md`.
2. Improve endpoint docs with a generated searchable-endpoints section.
3. Add package tarball verification to CI.
4. Explore a typed multi-query builder design and document the proposed API
   before implementation.
5. Improve relation-array result typing for selected nested fields.
