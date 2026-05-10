export type { IGDBClientConfig } from "./client/config";
export { IGDBClient } from "./client/IGDBClient";
export type {
	CreateWebhookOptions,
	MultiQueryResult,
	WebhookMethod,
} from "./client/IGDBClient";
export { IGDBEndpoint } from "./endpoints/Endpoint";
export {
	IGDB_ENDPOINTS,
	IGDB_SEARCHABLE_ENDPOINTS,
} from "./endpoints/registry";
export type {
	IGDBEndpointKey,
	IGDBEndpointPath,
	IGDBSearchableEndpointPath,
} from "./endpoints/registry";
export {
	IGDBAuthError,
	IGDBError,
	IGDBNotFoundError,
	IGDBRateLimitError,
	IGDBValidationError,
} from "./errors";
export { QueryBuilder } from "./query/QueryBuilder";
export type * from "./types/models";
export type {
	Condition,
	ConditionBuilder,
	ConditionValue,
	SelectProxy,
	TextMatchOptions,
	WhereProxy,
} from "./types/query.types";
export { buildImageUrl, IGDB_IMAGE_SIZES } from "./utils/images";
export type { IGDBImageSize, IGDBImageUrlOptions } from "./utils/images";
export { createTagNumber, IGDB_TAG_TYPE_IDS } from "./utils/tags";
export type { IGDBTagType } from "./utils/tags";
