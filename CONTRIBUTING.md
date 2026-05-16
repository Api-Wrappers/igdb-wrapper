# Contributing

Thanks for helping improve `@api-wrappers/igdb-wrapper`. The best changes keep
the package focused on its core value: a typed, fluent IGDB client that reduces
raw APICalypse string handling without removing escape hatches.

## Setup

```bash
bun install
```

Use Node.js 18+ or Bun with the repo's checked-in lockfile. Keep dependency
changes small and explain why they are needed.

## Development Commands

```bash
bun run typecheck
bun run test
bun run build
bun run check
```

Before opening a release-oriented PR, also run:

```bash
bun run verify
```

## Code Style

- Keep TypeScript strict.
- Do not use `any`; prefer `unknown`, generics, or narrower types.
- Prefer `Array<Type>` over `Type[]` when adding or changing type annotations.
- Prefer const functions for new helpers unless a class method or declaration is
  required by the surrounding API.
- Keep public API changes minimal and documented.
- Keep raw APICalypse examples accurate when a typed builder feature does not
  exist yet.

## Documentation Expectations

Docs are part of the product. If a change affects user-facing behavior, update
the relevant docs in `README.md`, `docs/`, or `examples/`.

When documenting query-builder examples:

- Inspect the source before writing new syntax.
- Use actual methods exported by the package.
- Mention raw escape hatches when the current API is string-based.
- Add a roadmap item instead of implying unsupported typed behavior exists.

## Pull Requests

Small PRs are easier to review. A good PR includes:

- A clear summary of the user problem.
- The exact behavior change.
- Tests or a note explaining why tests were not added.
- Validation output for typecheck, tests, build, and prepublish checks when
  relevant.

## Releases

See [docs/release-readiness.md](./docs/release-readiness.md) before publishing.
