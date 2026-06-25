interface EndpointMetadata<TKey extends string, TPath extends string> {
	key: TKey;
	path: TPath;
	searchable?: boolean;
}

const endpoint = <TKey extends string, TPath extends string>(
	key: TKey,
	path: TPath,
	options: { searchable?: boolean } = {},
): EndpointMetadata<TKey, TPath> => ({ key, path, ...options });

export const IGDB_ENDPOINT_METADATA = [
	endpoint("ageRatings", "age_ratings"),
	endpoint("ageRatingCategories", "age_rating_categories"),
	endpoint("ageRatingContentDescriptions", "age_rating_content_descriptions"),
	endpoint(
		"ageRatingContentDescriptionTypes",
		"age_rating_content_description_types",
	),
	endpoint("ageRatingContentDescriptionsV2", "age_rating_content_descriptions_v2"),
	endpoint("ageRatingOrganizations", "age_rating_organizations"),
	endpoint("alternativeNames", "alternative_names"),
	endpoint("artworks", "artworks"),
	endpoint("artworkTypes", "artwork_types"),
	endpoint("characters", "characters", { searchable: true }),
	endpoint("characterGenders", "character_genders"),
	endpoint("characterMugShots", "character_mug_shots"),
	endpoint("characterSpecies", "character_species"),
	endpoint("collections", "collections", { searchable: true }),
	endpoint("collectionMemberships", "collection_memberships"),
	endpoint("collectionMembershipTypes", "collection_membership_types"),
	endpoint("collectionRelations", "collection_relations"),
	endpoint("collectionRelationTypes", "collection_relation_types"),
	endpoint("collectionTypes", "collection_types"),
	endpoint("companies", "companies"),
	endpoint("companyLogos", "company_logos"),
	endpoint("companySizes", "company_sizes"),
	endpoint("companyStatuses", "company_statuses"),
	endpoint("companyTypes", "company_types"),
	endpoint("companyTypeHistories", "company_type_histories"),
	endpoint("companyWebsites", "company_websites"),
	endpoint("covers", "covers"),
	endpoint("dateFormats", "date_formats"),
	endpoint("entityTypes", "entity_types"),
	endpoint("events", "events"),
	endpoint("eventLogos", "event_logos"),
	endpoint("eventNetworks", "event_networks"),
	endpoint("externalGames", "external_games"),
	endpoint("externalGameSources", "external_game_sources"),
	endpoint("franchises", "franchises"),
	endpoint("games", "games", { searchable: true }),
	endpoint("gameEngines", "game_engines"),
	endpoint("gameEngineLogos", "game_engine_logos"),
	endpoint("gameLocalizations", "game_localizations"),
	endpoint("gameModes", "game_modes"),
	endpoint("gameReleaseFormats", "game_release_formats"),
	endpoint("gameStatuses", "game_statuses"),
	endpoint("gameTimeToBeats", "game_time_to_beats"),
	endpoint("gameTypes", "game_types"),
	endpoint("gameVersions", "game_versions"),
	endpoint("gameVersionFeatures", "game_version_features"),
	endpoint("gameVersionFeatureValues", "game_version_feature_values"),
	endpoint("gameVideos", "game_videos"),
	endpoint("genres", "genres"),
	endpoint("involvedCompanies", "involved_companies"),
	endpoint("keywords", "keywords"),
	endpoint("languages", "languages"),
	endpoint("languageSupports", "language_supports"),
	endpoint("languageSupportTypes", "language_support_types"),
	endpoint("multiplayerModes", "multiplayer_modes"),
	endpoint("networkTypes", "network_types"),
	endpoint("platforms", "platforms", { searchable: true }),
	endpoint("platformFamilies", "platform_families"),
	endpoint("platformLogos", "platform_logos"),
	endpoint("platformTypes", "platform_types"),
	endpoint("platformVersions", "platform_versions"),
	endpoint("platformVersionCompanies", "platform_version_companies"),
	endpoint("platformVersionReleaseDates", "platform_version_release_dates"),
	endpoint("platformWebsites", "platform_websites"),
	endpoint("playerPerspectives", "player_perspectives"),
	endpoint("popularityPrimitives", "popularity_primitives"),
	endpoint("popularityTypes", "popularity_types"),
	endpoint("regions", "regions"),
	endpoint("releaseDates", "release_dates"),
	endpoint("releaseDateRegions", "release_date_regions"),
	endpoint("releaseDateStatuses", "release_date_statuses"),
	endpoint("reports", "reports"),
	endpoint("reportTypes", "report_types"),
	endpoint("screenshots", "screenshots"),
	endpoint("search", "search", { searchable: true }),
	endpoint("themes", "themes", { searchable: true }),
	endpoint("websites", "websites"),
	endpoint("websiteTypes", "website_types"),
] as const;

type EndpointMetadataEntry = (typeof IGDB_ENDPOINT_METADATA)[number];

export const IGDB_ENDPOINTS = Object.fromEntries(
	IGDB_ENDPOINT_METADATA.map(({ key, path }) => [key, path]),
) as {
	readonly [TEndpoint in EndpointMetadataEntry as TEndpoint["key"]]: TEndpoint["path"];
};

export type IGDBEndpointKey = keyof typeof IGDB_ENDPOINTS;
export type IGDBEndpointPath = (typeof IGDB_ENDPOINTS)[IGDBEndpointKey];

export const IGDB_SEARCHABLE_ENDPOINTS = IGDB_ENDPOINT_METADATA.filter(
	(endpoint) => endpoint.searchable === true,
).map((endpoint) => endpoint.path) as readonly IGDBEndpointPath[];

export type IGDBSearchableEndpointPath =
	(typeof IGDB_SEARCHABLE_ENDPOINTS)[number];
