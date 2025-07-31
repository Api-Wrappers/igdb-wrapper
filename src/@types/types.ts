export type IGDBClientOptions = {
	clientId: string;
	clientSecret: string;
	autoRefreshToken?: boolean;
};

export interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
}

export interface IGDBRequestOptions {
	endpoint: string;
	body?: string;
	method?: "GET" | "POST";
	headers?: Record<string, string>;
}

export type IGDBResponse<T = unknown> = T;

// IGDB Image sizes for constructing image URLs
export type IGDBImageSize =
	| "original"
	| "cover_small"
	| "screenshot_med"
	| "cover_big"
	| "cover_med"
	| "logo_med"
	| "screenshot_big"
	| "screenshot_huge"
	| "thumb"
	| "micro"
	| "720p"
	| "1080p";

// IGDB Endpoint types
export type IGDBEndpoint =
	| "games"
	| "genres"
	| "themes"
	| "game_modes"
	| "companies"
	| "platforms"
	| "characters"
	| "collections"
	| "franchises"
	| "artworks"
	| "covers"
	| "screenshots";

// IGDB Request options for route classes
export interface IGDBRouteRequestOptions {
	fields?: string[];
	/**
	 * Include default fields for the specific endpoint
	 * @default true
	 */
	includeDefaultFields?: boolean;
	where?: string;
	search?: string;
	sort?: string;
	limit?: number;
	offset?: number;
}

// Enhanced request options with field-based typing
export interface IGDBTypedRequestOptions<T> {
	fields?: Array<keyof T | `${string & keyof T}.*`>;
	/**
	 * Include default fields for the specific endpoint
	 * @default true
	 */
	includeDefaultFields?: boolean;
	where?: string;
	search?: string;
	sort?: string | `${string & keyof T} asc` | `${string & keyof T} desc`;
	limit?: number;
	offset?: number;
}

// Main Game interface (based on actual IGDB return data)
export interface Game {
	id: number;
	name: string;
	slug: string;
	checksum: string;
	created_at: number;
	updated_at: number;
	url: string;

	// Core game info
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

	// Media - when using .* fields, these return full objects, otherwise just IDs
	cover?: Cover | number;
	screenshots?: Screenshot[] | number[];
	artworks?: Artwork[] | number[];
	videos?: GameVideo[] | number[];

	// Related entities - with .* returns objects, without returns IDs
	genres?: Genre[] | number[];
	themes?: Theme[] | number[];
	platforms?: Platform[] | number[];
	game_modes?: GameMode[] | number[];
	player_perspectives?: number[];
	keywords?: number[];

	// Release and company info
	release_dates?: ReleaseDate[] | number[];
	involved_companies?: InvolvedCompany[] | number[];

	// Related games
	similar_games?: SimilarGame[] | number[];
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
	game_engines?: GameEngine[] | number[];
	websites?: Website[] | number[];
	external_games?: number[];
	multiplayer_modes?: number[];
	language_supports?: number[];
	game_localizations?: number[];

	// Other
	tags?: number[];
	age_ratings?: number[];
	alternative_names?: number[];
	parent_game?: number;
}

// Media interfaces (returned when using .* fields)
export interface Cover {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
}

export interface Screenshot {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
}

export interface Artwork {
	id: number;
	image_id: string;
	url: string;
	width: number;
	height: number;
	checksum: string;
	alpha_channel?: boolean;
	animated?: boolean;
	game?: number;
}

export interface ReleaseDate {
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
}

export interface InvolvedCompany {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	company: Company; // When using .* this returns the full company object
	developer: boolean;
	publisher: boolean;
	porting: boolean;
	supporting: boolean;
	game: number;
}

export interface GameVideo {
	id: number;
	checksum: string;
	name: string;
	video_id: string;
	game: number;
}

export interface GameEngine {
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
}

export interface Website {
	id: number;
	checksum: string;
	category: number;
	url: string;
	trusted: boolean;
	game?: number;
}

export interface Theme {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
}

export interface GameMode {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
}

export interface Platform {
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
	platform_logo?: PlatformLogo | number;
	websites?: Website[] | number[];
	versions?: number[];
}

// Similar games interface (for the similar_games.* field)
export interface SimilarGame {
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

	// Media (these are included in similar_games.* default fields)
	cover?: Cover;
	screenshots?: Screenshot[];

	// Related entities
	genres?: Genre[];
	platforms?: Platform[];
	release_dates?: ReleaseDate[];

	// Other fields that might be IDs
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
}

export interface PlatformLogo {
	id: number;
	image_id: string;
	url?: string;
	width?: number;
	height?: number;
}

// Genre interface
export interface Genre {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
}

// Company interface (returned in involved_companies.company.* field)
export interface Company {
	id: number;
	checksum: string;
	created_at: number;
	updated_at: number;
	name: string;
	slug: string;
	url: string;
	description: string;
	country: number;
	logo?: number;
	parent?: number;
	websites?: number[];
	published?: number[];
	developed?: number[];
	change_date_category?: number;
	start_date?: number;
	start_date_category?: number;
}
