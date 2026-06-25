---
type: executor-prompt
title: Improve IGDB Wrapper Reliability and Ergonomics
slug: api-wrapper-improvements
created: 2026-06-25
status: ready
target: TypeScript IGDB wrapper reliability, ergonomics, endpoint metadata, docs, and release validation
related:
  - audit.html
---

# Task

Implement the following plan exactly. Do not redesign the approach unless you find a real blocker.

# Context

This repository is `@api-wrappers/igdb-wrapper`, a TypeScript package for IGDB v4. It uses Bun tests, tsdown, strict TypeScript, and `@api-wrappers/api-core` for HTTP transport, retry, rate limiting, auth plugin wiring, timeout, custom fetch, plugins, and logging.

The current baseline is healthy: `bun run typecheck`, `bun test`, and `bun run build` passed during the strategist audit. The package should be improved incrementally, with no broad rewrite and no removal of raw APICalypse escape hatches.

Relevant files:
- `src/auth/AuthManager.ts`
- `src/http/HttpClient.ts`
- `src/client/IGDBClient.ts`
- `src/client/config.ts`
- `src/endpoints/registry.ts`
- `src/endpoints/Endpoint.ts`
- `src/query/QueryBuilder.ts`
- `src/query/compiler.ts`
- `src/query/ast.ts`
- `src/query/helpers.ts`
- `src/query/operators.ts`
- `src/query/fieldProxy.ts`
- `src/types/models.ts`
- `src/types/query.types.ts`
- `src/types/response.types.ts`
- `src/__tests__/igdb-client.test.ts`
- `README.md`, `ROADMAP.md`, and `docs/`
- `package.json`, `tsdown.config.mjs`, and `tsconfig.json`

# Implementation Plan

1. Add single-flight token refresh.
   - In `AuthManager`, add a private in-flight refresh promise, for example `#refreshing: Promise<string> | null`.
   - Keep the current cache check.
   - When the cache is missing or stale, reuse the pending refresh promise if present.
   - When starting a new refresh, store the promise and clear it in `finally`.
   - Preserve current Twitch token request shape and current `IGDBAuthError` mapping.
   - Add a test that fires multiple concurrent IGDB requests against an empty cache and asserts exactly one Twitch token request.

2. Expand error and validation tests.
   - Add focused tests for 401 IGDB responses mapping to `IGDBAuthError`.
   - Add a failed Twitch token fetch test that maps to `IGDBAuthError`.
   - Add tests for non-JSON or string-ish error body formatting if api-core exposes it through `ApiError.responseBody`.
   - Add validation tests for invalid `limit()`, `offset()`, `paginate()`, empty `fields()`, and unsupported `count()` on a manually created `QueryBuilder`.
   - Add a not-found test for `findById()` or endpoint `firstOrThrow()`.

3. Create endpoint metadata as the single source of truth.
   - Introduce structured metadata that binds public key, endpoint path, model type name, and searchability.
   - Derive `IGDB_ENDPOINTS` and `IGDB_SEARCHABLE_ENDPOINTS` from that metadata.
   - Preserve the existing exported type names: `IGDBEndpointKey`, `IGDBEndpointPath`, and `IGDBSearchableEndpointPath`.
   - Preserve all existing endpoint paths and client property names.
   - If code generation is used, commit generated output and add a check that fails when generation output is stale.

4. Reduce manual endpoint-client drift.
   - Keep existing named `IGDBClient` properties for backward compatibility.
   - Either generate the property declarations/assignments from endpoint metadata or add a type-level/runtime drift test that verifies every metadata row has a client property and docs entry.
   - Do not replace the named properties with only a generic map.

5. Add a minimal typed multi-query builder.
   - Keep `client.multiQuery(rawString)` unchanged.
   - Add a small API that supports named list queries and named count queries.
   - Reuse existing `QueryBuilder.raw()` output for query bodies instead of reimplementing APICalypse compilation.
   - Ensure output matches IGDB multi-query syntax.
   - Add tests for compiled body and response typing.
   - Document the API in README/docs with one concise example.

6. Improve query introspection behavior.
   - Prefer non-printing introspection as the stable path. `raw()` already exists; add `inspect()` or `toJSON()` only if useful.
   - If `debug()` and `explain()` remain, document that they write to console and are debug-only.
   - Do not introduce unconditional extra console output elsewhere.

7. Add package smoke validation.
   - Add a script or test that runs after build, packs the package locally, verifies expected files, imports ESM, requires CJS, and typechecks a minimal consumer snippet.
   - Wire it into `verify` if it is fast and deterministic.
   - Avoid new dependencies unless the smoke test cannot be done cleanly with Bun/Node built-ins.

8. Update docs and roadmap.
   - Update README/docs for typed multi-query usage, debug guidance, and package verification.
   - Keep browser credential guidance server-side; do not encourage exposing Twitch client secrets.
   - Mark completed roadmap items rather than duplicating them.

# Constraints

- Follow existing project patterns.
- Keep the change focused.
- Do not perform unrelated refactors.
- Preserve existing behavior unless explicitly changed by the plan.
- Reuse existing types, schemas, utilities, services, and components before creating new ones.
- Avoid adding dependencies unless explicitly allowed.
- Do not remove raw APICalypse methods or raw `multiQuery(string)`.
- Do not replace `@api-wrappers/api-core`.
- Keep named endpoint properties source-compatible.

# TypeScript Rules

- Do not use `any`.
- Avoid weakening public types.
- Prefer clear exported types for new public APIs.
- Keep generic types understandable; do not over-engineer typed multi-query.
- Maintain strict TypeScript compatibility.

# Validation

Before finishing:

- Run `bun run typecheck`.
- Run `bun test`.
- Run `bun run build`.
- Run `npm pack --dry-run`.
- Run the new package smoke validation if added.
- Confirm README examples affected by public API changes still typecheck or are otherwise covered.

# Acceptance Criteria

- Concurrent cold-start requests share exactly one Twitch token refresh.
- Existing public API remains source-compatible for current README examples.
- Endpoint metadata has one clear source of truth and tests catch registry/client/searchability drift.
- Typed multi-query supports at least named list queries and named count queries while raw multi-query remains available.
- Error mapping and validation behavior are covered by focused tests.
- Package smoke validation proves ESM, CJS, and declarations work from the built package.
- `bun run typecheck`, `bun test`, `bun run build`, and package verification pass.

# Final Response

When done, respond with:

1. Summary of changes
2. Files changed
3. Commands run
4. Tests/checks completed
5. Any blockers, assumptions, or follow-up recommendations
