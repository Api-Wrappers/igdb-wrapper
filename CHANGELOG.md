# @api-wrappers/igdb-wrapper

## 1.1.1

### Patch Changes

- 5d8f413: Align endpoint registration and model types with the current IGDB v4 schema, including the image types endpoint and recent company, image, popularity, region, and release-date fields.
- 047ff0d: Reject typed multi-query builders that exceed IGDB's maximum of 10 query blocks per request.
- 372e263: Reject the high-level search helper on endpoints that IGDB does not document as searchable, and narrow the exported searchable endpoint path type accordingly.

## 1.0.1

### Patch Changes

- Update the shared runtime dependency to `@api-wrappers/api-core@^1.0.1`.
- Broaden the TypeScript peer dependency range to support TypeScript 6.
- Add clearer repository discovery guidance to the README.

## 1.0.0

### Major Changes

- Promote the IGDB wrapper to V1 with the full current IGDB v4 endpoint surface, typed APICalypse query building, multi-query, webhooks, metadata, protobuf, retry, rate-limit, image URL, and tag-number support.

## 0.6.1

### Patch Changes

- Route protobuf requests through api-core so plugins, retries, timeouts, and shared transport behaviour apply consistently.

## 0.6.0

### Minor Changes

- 6061069: Align the wrapper with the current IGDB v4 API surface by adding all documented endpoints, broader APICalypse query support, multi-query, webhooks, metadata, protobuf, image URL, and tag-number helpers.

## 0.5.0

### Minor Changes

- e6e8006: Migrate IGDB HTTP, auth, retry, and rate limiting onto api-core.
