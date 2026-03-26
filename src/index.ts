export type { IGDBClientConfig } from "./client/config.ts";
export { IGDBClient } from "./client/IGDBClient.ts";
export {
	IGDBAuthError,
	IGDBError,
	IGDBNotFoundError,
	IGDBRateLimitError,
	IGDBValidationError,
} from "./errors.ts";
export { QueryBuilder } from "./query/QueryBuilder.ts";
export type { Company, Cover, Game, Genre, Platform } from "./types/models.ts";
export type {
	Condition,
	ConditionBuilder,
	SelectProxy,
	WhereProxy,
} from "./types/query.types.ts";
