# Release Readiness

Use this checklist before publishing a package release or announcing a major
docs update. It is meant to make the repo easier to trust for users evaluating
the wrapper.

## Required Checks

- [ ] `bun install` completes with the checked-in lockfile.
- [ ] `bun run typecheck` passes.
- [ ] `bun run test` passes.
- [ ] `bun run build` passes and emits `dist/`.
- [ ] `bun run check` passes.
- [ ] `bun run verify` passes and includes a package dry-run.
- [ ] `bun run prepublishOnly` passes when the script exists.
- [ ] `npm pack --dry-run` or equivalent confirms the package contains `dist/`,
  `docs/`, `examples/`, `README.md`, `CHANGELOG.md`, and `LICENSE`.

## Documentation Checks

- [ ] README opening explains why raw APICalypse strings are brittle.
- [ ] README includes a before/after raw APICalypse and query-builder example.
- [ ] Docs do not show unsupported query-builder syntax.
- [ ] `docs/examples.md` covers search, ID lookup, field selection, filtering,
  sorting, pagination, image URLs, and multi-query.
- [ ] Raw-only features are described as raw-only.
- [ ] ROADMAP reflects any awkward API surface or missing typed helpers.

## Runtime Checks

- [ ] Auth behavior is documented for Twitch client credentials.
- [ ] Retry and rate-limit defaults are documented.
- [ ] Structured errors are documented with recovery guidance.
- [ ] Endpoint helpers and raw endpoint escape hatches are documented.

## Release Notes

- [ ] CHANGELOG or release notes explain user-visible changes.
- [ ] Breaking changes are called out explicitly.
- [ ] New examples or docs are linked from the README.
- [ ] Version, git tag, and package contents match the release intent.
