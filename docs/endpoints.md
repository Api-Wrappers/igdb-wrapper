# Endpoints

Every endpoint documented by the IGDB v4 API is available as a camel-cased
property on `IGDBClient`. Each property is an `IGDBEndpoint<T>` with:

```ts
endpoint.query();              // QueryBuilder<T>
endpoint.findMany();           // query().limit(50)
endpoint.findById(id);         // first result where id = id
endpoint.search("zelda");      // query().search("zelda").limit(50)
endpoint.request("fields *;"); // raw APICalypse body
endpoint.count("where id > 0;");
endpoint.meta();               // GET /{endpoint}/meta
endpoint.requestProtobuf("fields id;");
```

IGDB only supports `search` on selected endpoints. The wrapper exposes the
method uniformly so new searchable endpoints do not require a wrapper release;
the current documented searchable endpoints are exported as
`IGDB_SEARCHABLE_ENDPOINTS`.

Endpoint properties and path exports are derived from
`IGDB_ENDPOINT_METADATA`, which is exported for tooling that needs the wrapper's
registered endpoint list without constructing a client.

Use endpoint properties for known IGDB resources:

```ts
await client.games.query().limit(10).execute();
await client.platforms.findById(48);
await client.companies.search("Nintendo").execute();
```

Use `client.endpoint(path)` when IGDB adds a new endpoint before the wrapper publishes typed model support:

```ts
const experimental = client.endpoint("new_endpoint");
const rows = await experimental.request("fields *; limit 10;");
```

## Endpoint Properties

| Client property | IGDB path |
|---|---|
| `ageRatings` | `age_ratings` |
| `ageRatingCategories` | `age_rating_categories` |
| `ageRatingContentDescriptions` | `age_rating_content_descriptions` |
| `ageRatingContentDescriptionTypes` | `age_rating_content_description_types` |
| `ageRatingContentDescriptionsV2` | `age_rating_content_descriptions_v2` |
| `ageRatingOrganizations` | `age_rating_organizations` |
| `alternativeNames` | `alternative_names` |
| `artworks` | `artworks` |
| `artworkTypes` | `artwork_types` |
| `characters` | `characters` |
| `characterGenders` | `character_genders` |
| `characterMugShots` | `character_mug_shots` |
| `characterSpecies` | `character_species` |
| `collections` | `collections` |
| `collectionMemberships` | `collection_memberships` |
| `collectionMembershipTypes` | `collection_membership_types` |
| `collectionRelations` | `collection_relations` |
| `collectionRelationTypes` | `collection_relation_types` |
| `collectionTypes` | `collection_types` |
| `companies` | `companies` |
| `companyLogos` | `company_logos` |
| `companySizes` | `company_sizes` |
| `companyStatuses` | `company_statuses` |
| `companyTypes` | `company_types` |
| `companyTypeHistories` | `company_type_histories` |
| `companyWebsites` | `company_websites` |
| `covers` | `covers` |
| `dateFormats` | `date_formats` |
| `entityTypes` | `entity_types` |
| `events` | `events` |
| `eventLogos` | `event_logos` |
| `eventNetworks` | `event_networks` |
| `externalGames` | `external_games` |
| `externalGameSources` | `external_game_sources` |
| `franchises` | `franchises` |
| `games` | `games` |
| `gameEngines` | `game_engines` |
| `gameEngineLogos` | `game_engine_logos` |
| `gameLocalizations` | `game_localizations` |
| `gameModes` | `game_modes` |
| `gameReleaseFormats` | `game_release_formats` |
| `gameStatuses` | `game_statuses` |
| `gameTimeToBeats` | `game_time_to_beats` |
| `gameTypes` | `game_types` |
| `gameVersions` | `game_versions` |
| `gameVersionFeatures` | `game_version_features` |
| `gameVersionFeatureValues` | `game_version_feature_values` |
| `gameVideos` | `game_videos` |
| `genres` | `genres` |
| `involvedCompanies` | `involved_companies` |
| `keywords` | `keywords` |
| `languages` | `languages` |
| `languageSupports` | `language_supports` |
| `languageSupportTypes` | `language_support_types` |
| `multiplayerModes` | `multiplayer_modes` |
| `networkTypes` | `network_types` |
| `platforms` | `platforms` |
| `platformFamilies` | `platform_families` |
| `platformLogos` | `platform_logos` |
| `platformTypes` | `platform_types` |
| `platformVersions` | `platform_versions` |
| `platformVersionCompanies` | `platform_version_companies` |
| `platformVersionReleaseDates` | `platform_version_release_dates` |
| `platformWebsites` | `platform_websites` |
| `playerPerspectives` | `player_perspectives` |
| `popularityPrimitives` | `popularity_primitives` |
| `popularityTypes` | `popularity_types` |
| `regions` | `regions` |
| `releaseDates` | `release_dates` |
| `releaseDateRegions` | `release_date_regions` |
| `releaseDateStatuses` | `release_date_statuses` |
| `reports` | `reports` |
| `reportTypes` | `report_types` |
| `screenshots` | `screenshots` |
| `search` | `search` |
| `themes` | `themes` |
| `websites` | `websites` |
| `websiteTypes` | `website_types` |

## Raw Endpoint Access

For newly added IGDB endpoints or fields, use `client.endpoint(path)` or
`client.request(path, query)` without waiting for model updates:

```ts
const endpoint = client.endpoint("games");
const games = await endpoint.request("fields name,platforms.name; limit 10;");

const covers = await client.request("covers", "fields image_id,url; limit 10;");
const total = await client.count("platforms", "");
const fields = await client.meta("games");
const protobuf = await client.requestProtobuf("games", "fields id,name;");
```

`endpoint.request(query)` and `client.request(path, query)` expect a complete APICalypse body. Query-builder methods generate that body for you.

## Multi-Query

Multi-query sends one body to `/multiquery` and returns an array of named result blocks. Blocks can contain either `result` rows or a `count`.

```ts
const results = await client.multiQuery(`
query platforms/count "Count of Platforms" {
};

query games "Recent Games" {
  fields name,first_release_date;
  sort first_release_date desc;
  limit 5;
};
`);
```

## Webhooks

Webhook helpers wrap IGDB's webhook endpoints. Store webhook secrets outside your source code and validate incoming webhook payloads in your app.

```ts
await client.createWebhook("games", {
  method: "create",
  secret: "shared-secret",
  url: "https://example.com/igdb-webhook",
});

const hooks = await client.listWebhooks();
await client.testWebhook("games", hooks[0].id, 1942);
await client.deleteWebhook(hooks[0].id);
```
