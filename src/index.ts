export type { IGDBClientConfig } from "./client/config";
export { IGDBClient } from "./client/IGDBClient";
export {
	IGDBAuthError,
	IGDBError,
	IGDBNotFoundError,
	IGDBRateLimitError,
	IGDBValidationError,
} from "./errors";
export { QueryBuilder } from "./query/QueryBuilder";
export type { Company, Cover, Game, Genre, Platform } from "./types/models";
export type {
	Condition,
	ConditionBuilder,
	SelectProxy,
	WhereProxy,
} from "./types/query.types";
