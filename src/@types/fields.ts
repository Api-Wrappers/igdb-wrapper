// IGDB Field Definitions and Field-Based Typing
// This file provides type-safe field definitions and conditional typing based on requested fields

// ============================================================================
// FIELD DEFINITIONS
// ============================================================================

// Base field types for different IGDB entities
export type GameFields = {
	// Core fields
	id: number;
	name: string;
	slug: string;
	checksum: string;
	created_at: number;
	updated_at: number;
	url: string;
	category: number;
	status?: number;
	summary?: string;
	storyline?: string;

	// Ratings
	rating?: number;
	rating_count?: number;
	total_rating?: number;
	total_rating_count?: number;
	aggregated_rating?: number;
	aggregated_rating_count?: number;
	hypes?: number;
	follows?: number;

	// Dates
	first_release_date?: number;

	// Media fields (can be expanded with .*)
	cover?: number | CoverFields;
	screenshots?: number[] | ScreenshotFields[];
	artworks?: number[] | ArtworkFields[];
	videos?: number[] | GameVideoFields[];

	// Related entities (can be expanded with .*)
	genres?: number[] | GenreFields[];
	themes?: number[] | ThemeFields[];
	platforms?: number[] | PlatformFields[];
	game_modes?: number[] | GameModeFields[];
	player_perspectives?: number[];
	keywords?: number[];

	// Release and company info
	release_dates?: number[] | ReleaseDateFields[];
	involved_companies?: number[] | InvolvedCompanyFields[];

	// Related games
	similar_games?: number[] | SimilarGameFields[];
	bundles?: number[];
	dlcs?: number[];
	expansions?: number[];
	standalone_expansions?: number[];
	expanded_games?: number[];
	ports?: number[];
	remakes?: number[];
	remasters?: number[];

	// Collections and franchises
	collection?: number;
	collections?: number[];
	franchise?: number;
	franchises?: number[];

	// Technical
	game_engines?: number[] | GameEngineFields[];
	websites?: number[] | WebsiteFields[];
	external_games?: number[];
	multiplayer_modes?: number[];
	language_supports?: number[];
	game_localizations?: number[];

	// Other
	tags?: number[];
	age_ratings?: number[];
	alternative_names?: number[];
	parent_game?: number;
};

export type GenreFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
};

export type CompanyFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
	description: string;
	country: number;
	logo?: number | PlatformLogoFields;
	parent?: number;
	websites?: number[] | WebsiteFields[];
	published?: number[] | GameFields[];
	developed?: number[] | GameFields[];
	change_date_category?: number;
	start_date?: number;
	start_date_category?: number;
};

export type PlatformFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
	abbreviation: string;
	alternative_name?: string;
	category: number;
	generation?: number;
	platform_family?: number;
	summary?: string;
	platform_logo?: number | PlatformLogoFields;
	websites?: number[] | WebsiteFields[];
	versions?: number[];
};

export type CoverFields = {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
};

export type ScreenshotFields = {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
};

export type ArtworkFields = {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
};

export type GameVideoFields = {
	id: number;
	checksum: string;
	name: string;
	video_id: string;
	game: number;
};

export type GameEngineFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
	companies?: number[];
	logo?: number;
	platforms?: number[];
};

export type WebsiteFields = {
	id: number;
	checksum: string;
	category: number;
	url: string;
	trusted: boolean;
	game?: number;
};

export type ThemeFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
};

export type GameModeFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
};

export type PlatformLogoFields = {
	id: number;
	image_id: string;
	url?: string;
	width?: number;
	height?: number;
};

export type ReleaseDateFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	category: number;
	date?: number;
	human: string;
	region: number;
	platform: number;
	game: number;
	m?: number;
	y?: number;
	status?: number;
};

export type InvolvedCompanyFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	company: CompanyFields;
	developer: boolean;
	publisher: boolean;
	porting: boolean;
	supporting: boolean;
	game: number;
};

export type SimilarGameFields = {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	url: string;
	name: string;
	slug: string;
	summary: string;
	storyline?: string;
	category: number;
	status?: number;
	rating?: number;
	rating_count?: number;
	total_rating?: number;
	total_rating_count?: number;
	aggregated_rating?: number;
	aggregated_rating_count?: number;
	hypes?: number;
	follows?: number;
	first_release_date?: number;
	cover?: CoverFields;
	screenshots?: ScreenshotFields[];
	genres?: GenreFields[];
	platforms?: PlatformFields[];
	release_dates?: ReleaseDateFields[];
	themes?: number[];
	tags?: number[];
	game_modes?: number[];
	player_perspectives?: number[];
	keywords?: number[];
	age_ratings?: number[];
	alternative_names?: number[];
	artworks?: number[];
	bundles?: number[];
	dlcs?: number[];
	expansions?: number[];
	franchises?: number[];
	game_engines?: number[];
	external_games?: number[];
	involved_companies?: number[];
	multiplayer_modes?: number[];
	similar_games?: number[];
	videos?: number[];
	websites?: number[];
	language_supports?: number[];
	game_localizations?: number[];
	collections?: number[];
	collection?: number;
	franchise?: number;
	expanded_games?: number[];
	standalone_expansions?: number[];
	remasters?: number[];
	ports?: number[];
	remakes?: number[];
	parent_game?: number;
};

// ============================================================================
// FIELD PATH TYPES
// ============================================================================

// Type for field paths (e.g., "genres.name", "cover.*")
export type FieldPath<T> = {
	[K in keyof T]: T[K] extends object
		? `${string & K}` | `${string & K}.*` | `${string & K}.${FieldPath<T[K]>}`
		: `${string & K}`;
}[keyof T];

// Type for valid field names including expanded fields
export type ValidFields<T> = keyof T | `${string & keyof T}.*`;

// ============================================================================
// CONDITIONAL FIELD TYPES
// ============================================================================

// Type that determines if a field should be expanded or just an ID
export type ExpandableField<T, K extends keyof T> = T[K] extends
	| number
	| number[]
	? number | number[]
	: T[K] extends (infer U)[]
		? U extends object
			? number[] | U[]
			: U[]
		: T[K] extends object
			? number | T[K]
			: T[K];

// ============================================================================
// FIELD-BASED RESPONSE TYPES
// ============================================================================

// Type that creates a response type based on requested fields
export type FieldBasedResponse<T, F extends readonly string[]> = {
	[K in F[number] as K extends keyof T ? K : never]: K extends keyof T
		? T[K]
		: never;
} & {
	// Always include id if not explicitly excluded
	id: number;
};

// ============================================================================
// FIELD VALIDATION TYPES
// ============================================================================

// Type that validates field names for a given entity
// Note: ValidFields is now defined above as keyof T | `${string & keyof T}.*`

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

// Type for field selection
export type FieldSelection<T> = {
	fields?: ValidFields<T>[];
	includeDefaultFields?: boolean;
};

// Type for filtering conditions
export type WhereCondition = string;

// Type for sorting
export type SortOption<T> = {
	field: ValidFields<T>;
	direction: "asc" | "desc";
};

// Type for pagination
export type PaginationOptions = {
	limit?: number;
	offset?: number;
};

// Type for search
export type SearchOptions = {
	search?: string;
};

// Complete query options
export type QueryOptions<T> = FieldSelection<T> &
	PaginationOptions &
	SearchOptions & {
		where?: WhereCondition;
		sort?: string | SortOption<T>;
	};

// ============================================================================
// ENDPOINT-SPECIFIC FIELD TYPES
// ============================================================================

export type GameFieldPaths = FieldPath<GameFields>;
export type GenreFieldPaths = FieldPath<GenreFields>;
export type CompanyFieldPaths = FieldPath<CompanyFields>;
export type PlatformFieldPaths = FieldPath<PlatformFields>;

// ============================================================================
// UTILITY TYPES
// ============================================================================

// Type that extracts the base type from an expanded field
export type ExtractBaseType<T> = T extends number | number[]
	? number | number[]
	: T extends (infer U)[]
		? U extends object
			? number[] | U[]
			: U[]
		: T extends object
			? number | T
			: T;

// Type that determines if a field path is expanded
export type IsExpandedField<F extends string> = F extends `${string}.*`
	? true
	: false;

// Type that gets the base field name from an expanded field
export type BaseFieldName<F extends string> = F extends `${infer Base}.*`
	? Base
	: F;
