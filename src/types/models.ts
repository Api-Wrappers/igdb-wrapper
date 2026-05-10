export interface IGDBEntity {
	id: number;
	checksum?: string;
	created_at?: number;
	updated_at?: number;
}

export interface NamedEntity extends IGDBEntity {
	name?: string;
	slug?: string;
	url?: string;
}

export interface ImageEntity extends IGDBEntity {
	alpha_channel?: boolean;
	animated?: boolean;
	height?: number;
	image_id?: string;
	url?: string;
	width?: number;
}

export type IGDBAnyEntity = IGDBEntity & Record<string, unknown>;

export interface AgeRating extends IGDBEntity {
	category?: number;
	content_descriptions?: AgeRatingContentDescription[];
	organization?: AgeRatingOrganization;
	rating?: number;
	rating_category?: AgeRatingCategory;
	rating_content_descriptions?: AgeRatingContentDescriptionV2[];
	rating_cover_url?: string;
	synopsis?: string;
}

export interface AgeRatingCategory extends IGDBEntity {
	organization?: AgeRatingOrganization;
	rating?: string;
}

export interface AgeRatingContentDescription extends IGDBEntity {
	category?: number;
	description?: string;
}

export interface AgeRatingContentDescriptionType extends NamedEntity {}

export interface AgeRatingContentDescriptionV2 extends IGDBEntity {
	description?: string;
	description_type?: AgeRatingContentDescriptionType;
	organization?: AgeRatingOrganization;
}

export interface AgeRatingOrganization extends NamedEntity {}

export interface AlternativeName extends IGDBEntity {
	comment?: string;
	game?: Game;
	name?: string;
}

export interface Artwork extends ImageEntity {
	artwork_type?: ArtworkType;
	game?: Game;
}

export interface ArtworkType extends NamedEntity {}

export interface Character extends NamedEntity {
	akas?: string[];
	character_gender?: CharacterGender;
	character_species?: CharacterSpecie;
	country_name?: string;
	description?: string;
	games?: Game[];
	gender?: number;
	mug_shot?: CharacterMugShot;
	species?: number;
}

export interface CharacterGender extends IGDBEntity {
	name?: string;
}

export interface CharacterMugShot extends ImageEntity {}

export interface CharacterSpecie extends IGDBEntity {
	name?: string;
}

export interface Collection extends NamedEntity {
	as_child_relations?: CollectionRelation[];
	as_parent_relations?: CollectionRelation[];
	games?: Game[];
	type?: CollectionType;
}

export interface CollectionMembership extends IGDBEntity {
	collection?: Collection;
	game?: Game;
	type?: CollectionMembershipType;
}

export interface CollectionMembershipType extends NamedEntity {
	description?: string;
	allowed_collection_type?: CollectionType;
}

export interface CollectionRelation extends IGDBEntity {
	child_collection?: Collection;
	parent_collection?: Collection;
	type?: CollectionRelationType;
}

export interface CollectionRelationType extends NamedEntity {
	description?: string;
	allowed_child_type?: CollectionType;
	allowed_parent_type?: CollectionType;
}

export interface CollectionType extends NamedEntity {
	description?: string;
}

export interface Company extends NamedEntity {
	change_date?: number;
	change_date_category?: number;
	change_date_format?: DateFormat;
	changed_company_id?: Company;
	country?: number;
	description?: string;
	developed?: Game[];
	logo?: CompanyLogo;
	parent?: Company;
	published?: Game[];
	start_date?: number;
	start_date_category?: number;
	start_date_format?: DateFormat;
	status?: CompanyStatus;
	type?: CompanyType;
	websites?: CompanyWebsite[];
}

export interface CompanyLogo extends ImageEntity {}
export interface CompanySize extends IGDBEntity {
	size?: string;
}
export interface CompanyStatus extends IGDBEntity {
	name?: string;
}
export interface CompanyType extends IGDBEntity {
	name?: string;
}
export interface CompanyTypeHistory extends IGDBEntity {
	company?: Company;
	company_type?: CompanyType;
	parent_company?: Company;
}
export interface CompanyWebsite extends IGDBEntity {
	category?: number;
	trusted?: boolean;
	type?: WebsiteType;
	url?: string;
}

export interface Cover extends ImageEntity {
	game?: Game;
}

export interface DateFormat extends IGDBEntity {
	format?: string;
}

export interface EntityType extends IGDBEntity {
	description?: string;
	name?: string;
}

export interface Event extends NamedEntity {
	description?: string;
	end_time?: number;
	event_logo?: EventLogo;
	event_networks?: EventNetwork[];
	games?: Game[];
	live_stream_url?: string;
	start_time?: number;
	time_zone?: string;
	videos?: GameVideo[];
}

export interface EventLogo extends ImageEntity {
	event?: Event;
}

export interface EventNetwork extends IGDBEntity {
	event?: Event;
	network_type?: NetworkType;
	url?: string;
}

export interface ExternalGame extends IGDBEntity {
	category?: number;
	countries?: number[];
	external_game_source?: ExternalGameSource;
	game?: Game;
	game_release_format?: GameReleaseFormat;
	media?: number;
	name?: string;
	platform?: Platform;
	uid?: string;
	url?: string;
	year?: number;
}

export interface ExternalGameSource extends IGDBEntity {
	name?: string;
}

export interface Franchise extends NamedEntity {
	games?: Game[];
}

export interface Game extends NamedEntity {
	age_ratings?: AgeRating[];
	aggregated_rating?: number;
	aggregated_rating_count?: number;
	alternative_names?: AlternativeName[];
	artworks?: Artwork[];
	bundles?: Game[];
	category?: number;
	collection?: Collection;
	collections?: Collection[];
	cover?: Cover;
	dlcs?: Game[];
	expanded_games?: Game[];
	expansions?: Game[];
	external_games?: ExternalGame[];
	first_release_date?: number;
	follows?: number;
	forks?: Game[];
	franchise?: Franchise;
	franchises?: Franchise[];
	game_engines?: GameEngine[];
	game_localizations?: GameLocalization[];
	game_modes?: GameMode[];
	game_status?: GameStatus;
	game_type?: GameType;
	genres?: Genre[];
	hypes?: number;
	involved_companies?: InvolvedCompany[];
	keywords?: Keyword[];
	language_supports?: LanguageSupport[];
	multiplayer_modes?: MultiplayerMode[];
	name: string;
	parent_game?: Game;
	platforms?: Platform[];
	player_perspectives?: PlayerPerspective[];
	ports?: Game[];
	rating?: number;
	rating_count?: number;
	release_dates?: ReleaseDate[];
	remakes?: Game[];
	remasters?: Game[];
	screenshots?: Screenshot[];
	similar_games?: Game[];
	slug: string;
	standalone_expansions?: Game[];
	status?: number;
	storyline?: string;
	summary?: string;
	tags?: number[];
	themes?: Theme[];
	total_rating?: number;
	total_rating_count?: number;
	version_parent?: Game;
	version_title?: string;
	videos?: GameVideo[];
	websites?: Website[];
}

export interface GameEngine extends NamedEntity {
	companies?: Company[];
	description?: string;
	logo?: GameEngineLogo;
	platforms?: Platform[];
}

export interface GameEngineLogo extends ImageEntity {}

export interface GameLocalization extends IGDBEntity {
	cover?: Cover;
	game?: Game;
	name?: string;
	region?: Region;
}

export interface GameMode extends NamedEntity {}

export interface GameReleaseFormat extends IGDBEntity {
	format?: string;
}

export interface GameStatus extends IGDBEntity {
	status?: string;
}

export interface GameTimeToBeat extends IGDBEntity {
	completely?: number;
	count?: number;
	game_id?: Game;
	hastily?: number;
	normally?: number;
}

export interface GameType extends IGDBEntity {
	type?: string;
}

export interface GameVersion extends IGDBEntity {
	features?: GameVersionFeature[];
	game?: Game;
	games?: Game[];
	url?: string;
}

export interface GameVersionFeature extends IGDBEntity {
	category?: number;
	description?: string;
	position?: number;
	title?: string;
	values?: GameVersionFeatureValue[];
}

export interface GameVersionFeatureValue extends IGDBEntity {
	game?: Game;
	game_feature?: GameVersionFeature;
	included_feature?: number;
	note?: string;
}

export interface GameVideo extends IGDBEntity {
	game?: Game;
	name?: string;
	video_id?: string;
}

export interface Genre extends NamedEntity {
	name: string;
	slug: string;
}

export interface InvolvedCompany extends IGDBEntity {
	company?: Company;
	developer?: boolean;
	game?: Game;
	porting?: boolean;
	publisher?: boolean;
	supporting?: boolean;
}

export interface Keyword extends NamedEntity {
	name?: string;
}

export interface Language extends NamedEntity {
	locale?: string;
	native_name?: string;
}

export interface LanguageSupport extends IGDBEntity {
	game?: Game;
	language?: Language;
	language_support_type?: LanguageSupportType;
}

export interface LanguageSupportType extends IGDBEntity {
	name?: string;
}

export interface MultiplayerMode extends IGDBEntity {
	campaigncoop?: boolean;
	dropin?: boolean;
	game?: Game;
	lancoop?: boolean;
	offlinecoop?: boolean;
	offlinecoopmax?: number;
	offlinemax?: number;
	onlinecoop?: boolean;
	onlinecoopmax?: number;
	onlinemax?: number;
	platform?: Platform;
	splitscreen?: boolean;
	splitscreenonline?: boolean;
}

export interface NetworkType extends IGDBEntity {
	name?: string;
}

export interface Platform extends NamedEntity {
	abbreviation?: string;
	alternative_name?: string;
	category?: number;
	generation?: number;
	platform_family?: PlatformFamily;
	platform_logo?: PlatformLogo;
	platform_type?: PlatformType;
	summary?: string;
	versions?: PlatformVersion[];
	websites?: PlatformWebsite[];
}

export interface PlatformFamily extends NamedEntity {}
export interface PlatformLogo extends ImageEntity {}
export interface PlatformType extends IGDBEntity {
	name?: string;
}

export interface PlatformVersion extends NamedEntity {
	companies?: PlatformVersionCompany[];
	connectivity?: string;
	cpu?: string;
	graphics?: string;
	main_manufacturer?: PlatformVersionCompany;
	media?: string;
	memory?: string;
	os?: string;
	output?: string;
	platform_logo?: PlatformLogo;
	platform_version_release_dates?: PlatformVersionReleaseDate[];
	resolutions?: string;
	sound?: string;
	storage?: string;
	summary?: string;
}

export interface PlatformVersionCompany extends IGDBEntity {
	comment?: string;
	company?: Company;
	developer?: boolean;
	manufacturer?: boolean;
}

export interface PlatformVersionReleaseDate extends IGDBEntity {
	category?: number;
	date?: number;
	date_format?: DateFormat;
	human?: string;
	m?: number;
	platform_version?: PlatformVersion;
	region?: ReleaseDateRegion;
	y?: number;
}

export interface PlatformWebsite extends IGDBEntity {
	category?: number;
	trusted?: boolean;
	type?: WebsiteType;
	url?: string;
}

export interface PlayerPerspective extends NamedEntity {}

export interface PopularityPrimitive extends IGDBEntity {
	calculated_at?: number;
	external_popularity_source?: number;
	game_id?: Game;
	popularity_source?: PopularityType;
	value?: number;
}

export interface PopularityType extends IGDBEntity {
	name?: string;
	popularity_source?: number;
}

export interface Region extends IGDBEntity {
	category?: string;
	identifier?: string;
}

export interface ReleaseDate extends IGDBEntity {
	category?: number;
	date?: number;
	date_format?: DateFormat;
	game?: Game;
	human?: string;
	m?: number;
	platform?: Platform;
	region?: ReleaseDateRegion;
	status?: ReleaseDateStatus;
	y?: number;
}

export interface ReleaseDateRegion extends IGDBEntity {
	region?: string;
}

export interface ReleaseDateStatus extends IGDBEntity {
	description?: string;
	name?: string;
}

export interface Report extends IGDBEntity {
	entity_type?: EntityType;
	report_type?: ReportType;
	source_item_id?: number;
	target_item_id?: number;
}

export interface ReportType extends IGDBEntity {
	description?: string;
	name?: string;
}

export interface Screenshot extends ImageEntity {
	game?: Game;
}

export interface Search extends NamedEntity {
	alternative_name?: string;
	character?: Character;
	collection?: Collection;
	company?: Company;
	description?: string;
	game?: Game;
	platform?: Platform;
	published_at?: number;
	test_dummy?: string;
	theme?: Theme;
}

export interface Theme extends NamedEntity {
	name?: string;
}

export interface Website extends IGDBEntity {
	category?: number;
	game?: Game;
	trusted?: boolean;
	type?: WebsiteType;
	url?: string;
}

export interface WebsiteType extends IGDBEntity {
	type?: string;
}

export interface Webhook extends IGDBEntity {
	active?: boolean;
	api_key?: string;
	category?: number;
	secret?: string;
	sub_category?: number;
	url?: string;
}

export interface MetaField {
	name: string;
	type: string;
}
