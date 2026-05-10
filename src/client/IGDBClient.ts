import { AuthManager } from "../auth/AuthManager";
import { IGDBEndpoint } from "../endpoints/Endpoint";
import { IGDB_ENDPOINTS } from "../endpoints/registry";
import type { IGDBEndpointPath } from "../endpoints/registry";
import { HttpClient } from "../http/HttpClient";
import type * as Models from "../types/models";
import type { IGDBClientConfig } from "./config";

export interface MultiQueryResult<T = Models.IGDBAnyEntity> {
	name: string;
	result?: T[];
	count?: number;
}

export type WebhookMethod = "create" | "update" | "delete";

export interface CreateWebhookOptions {
	url: string;
	secret: string;
	method: WebhookMethod;
}

export class IGDBClient {
	readonly ageRatings: IGDBEndpoint<Models.AgeRating>;
	readonly ageRatingCategories: IGDBEndpoint<Models.AgeRatingCategory>;
	readonly ageRatingContentDescriptions: IGDBEndpoint<Models.AgeRatingContentDescription>;
	readonly ageRatingContentDescriptionTypes: IGDBEndpoint<Models.AgeRatingContentDescriptionType>;
	readonly ageRatingContentDescriptionsV2: IGDBEndpoint<Models.AgeRatingContentDescriptionV2>;
	readonly ageRatingOrganizations: IGDBEndpoint<Models.AgeRatingOrganization>;
	readonly alternativeNames: IGDBEndpoint<Models.AlternativeName>;
	readonly artworks: IGDBEndpoint<Models.Artwork>;
	readonly artworkTypes: IGDBEndpoint<Models.ArtworkType>;
	readonly characters: IGDBEndpoint<Models.Character>;
	readonly characterGenders: IGDBEndpoint<Models.CharacterGender>;
	readonly characterMugShots: IGDBEndpoint<Models.CharacterMugShot>;
	readonly characterSpecies: IGDBEndpoint<Models.CharacterSpecie>;
	readonly collections: IGDBEndpoint<Models.Collection>;
	readonly collectionMemberships: IGDBEndpoint<Models.CollectionMembership>;
	readonly collectionMembershipTypes: IGDBEndpoint<Models.CollectionMembershipType>;
	readonly collectionRelations: IGDBEndpoint<Models.CollectionRelation>;
	readonly collectionRelationTypes: IGDBEndpoint<Models.CollectionRelationType>;
	readonly collectionTypes: IGDBEndpoint<Models.CollectionType>;
	readonly companies: IGDBEndpoint<Models.Company>;
	readonly companyLogos: IGDBEndpoint<Models.CompanyLogo>;
	readonly companySizes: IGDBEndpoint<Models.CompanySize>;
	readonly companyStatuses: IGDBEndpoint<Models.CompanyStatus>;
	readonly companyTypes: IGDBEndpoint<Models.CompanyType>;
	readonly companyTypeHistories: IGDBEndpoint<Models.CompanyTypeHistory>;
	readonly companyWebsites: IGDBEndpoint<Models.CompanyWebsite>;
	readonly covers: IGDBEndpoint<Models.Cover>;
	readonly dateFormats: IGDBEndpoint<Models.DateFormat>;
	readonly entityTypes: IGDBEndpoint<Models.EntityType>;
	readonly events: IGDBEndpoint<Models.Event>;
	readonly eventLogos: IGDBEndpoint<Models.EventLogo>;
	readonly eventNetworks: IGDBEndpoint<Models.EventNetwork>;
	readonly externalGames: IGDBEndpoint<Models.ExternalGame>;
	readonly externalGameSources: IGDBEndpoint<Models.ExternalGameSource>;
	readonly franchises: IGDBEndpoint<Models.Franchise>;
	readonly games: IGDBEndpoint<Models.Game>;
	readonly gameEngines: IGDBEndpoint<Models.GameEngine>;
	readonly gameEngineLogos: IGDBEndpoint<Models.GameEngineLogo>;
	readonly gameLocalizations: IGDBEndpoint<Models.GameLocalization>;
	readonly gameModes: IGDBEndpoint<Models.GameMode>;
	readonly gameReleaseFormats: IGDBEndpoint<Models.GameReleaseFormat>;
	readonly gameStatuses: IGDBEndpoint<Models.GameStatus>;
	readonly gameTimeToBeats: IGDBEndpoint<Models.GameTimeToBeat>;
	readonly gameTypes: IGDBEndpoint<Models.GameType>;
	readonly gameVersions: IGDBEndpoint<Models.GameVersion>;
	readonly gameVersionFeatures: IGDBEndpoint<Models.GameVersionFeature>;
	readonly gameVersionFeatureValues: IGDBEndpoint<Models.GameVersionFeatureValue>;
	readonly gameVideos: IGDBEndpoint<Models.GameVideo>;
	readonly genres: IGDBEndpoint<Models.Genre>;
	readonly involvedCompanies: IGDBEndpoint<Models.InvolvedCompany>;
	readonly keywords: IGDBEndpoint<Models.Keyword>;
	readonly languages: IGDBEndpoint<Models.Language>;
	readonly languageSupports: IGDBEndpoint<Models.LanguageSupport>;
	readonly languageSupportTypes: IGDBEndpoint<Models.LanguageSupportType>;
	readonly multiplayerModes: IGDBEndpoint<Models.MultiplayerMode>;
	readonly networkTypes: IGDBEndpoint<Models.NetworkType>;
	readonly platforms: IGDBEndpoint<Models.Platform>;
	readonly platformFamilies: IGDBEndpoint<Models.PlatformFamily>;
	readonly platformLogos: IGDBEndpoint<Models.PlatformLogo>;
	readonly platformTypes: IGDBEndpoint<Models.PlatformType>;
	readonly platformVersions: IGDBEndpoint<Models.PlatformVersion>;
	readonly platformVersionCompanies: IGDBEndpoint<Models.PlatformVersionCompany>;
	readonly platformVersionReleaseDates: IGDBEndpoint<Models.PlatformVersionReleaseDate>;
	readonly platformWebsites: IGDBEndpoint<Models.PlatformWebsite>;
	readonly playerPerspectives: IGDBEndpoint<Models.PlayerPerspective>;
	readonly popularityPrimitives: IGDBEndpoint<Models.PopularityPrimitive>;
	readonly popularityTypes: IGDBEndpoint<Models.PopularityType>;
	readonly regions: IGDBEndpoint<Models.Region>;
	readonly releaseDates: IGDBEndpoint<Models.ReleaseDate>;
	readonly releaseDateRegions: IGDBEndpoint<Models.ReleaseDateRegion>;
	readonly releaseDateStatuses: IGDBEndpoint<Models.ReleaseDateStatus>;
	readonly reports: IGDBEndpoint<Models.Report>;
	readonly reportTypes: IGDBEndpoint<Models.ReportType>;
	readonly screenshots: IGDBEndpoint<Models.Screenshot>;
	readonly search: IGDBEndpoint<Models.Search>;
	readonly themes: IGDBEndpoint<Models.Theme>;
	readonly websites: IGDBEndpoint<Models.Website>;
	readonly websiteTypes: IGDBEndpoint<Models.WebsiteType>;

	readonly #auth: AuthManager;
	readonly #http: HttpClient;

	constructor(config: IGDBClientConfig) {
		const auth = new AuthManager({
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			fetch: config.fetch,
			logger: config.logger,
			timeoutMs: config.timeoutMs,
		});

		const http = new HttpClient({
			clientId: config.clientId,
			auth,
			fetch: config.fetch,
			logger: config.logger,
			plugins: config.plugins,
			retry: config.retry,
			rateLimit: config.rateLimit,
			timeoutMs: config.timeoutMs,
			transport: config.transport,
		});

		const endpoint = <TModel extends Models.IGDBEntity>(
			key: keyof typeof IGDB_ENDPOINTS,
		) => new IGDBEndpoint<TModel>(http, IGDB_ENDPOINTS[key]);

		this.#auth = auth;
		this.#http = http;
		this.ageRatings = endpoint<Models.AgeRating>("ageRatings");
		this.ageRatingCategories = endpoint<Models.AgeRatingCategory>(
			"ageRatingCategories",
		);
		this.ageRatingContentDescriptions =
			endpoint<Models.AgeRatingContentDescription>(
				"ageRatingContentDescriptions",
			);
		this.ageRatingContentDescriptionTypes =
			endpoint<Models.AgeRatingContentDescriptionType>(
				"ageRatingContentDescriptionTypes",
			);
		this.ageRatingContentDescriptionsV2 =
			endpoint<Models.AgeRatingContentDescriptionV2>(
				"ageRatingContentDescriptionsV2",
			);
		this.ageRatingOrganizations =
			endpoint<Models.AgeRatingOrganization>("ageRatingOrganizations");
		this.alternativeNames = endpoint<Models.AlternativeName>("alternativeNames");
		this.artworks = endpoint<Models.Artwork>("artworks");
		this.artworkTypes = endpoint<Models.ArtworkType>("artworkTypes");
		this.characters = endpoint<Models.Character>("characters");
		this.characterGenders =
			endpoint<Models.CharacterGender>("characterGenders");
		this.characterMugShots =
			endpoint<Models.CharacterMugShot>("characterMugShots");
		this.characterSpecies =
			endpoint<Models.CharacterSpecie>("characterSpecies");
		this.collections = endpoint<Models.Collection>("collections");
		this.collectionMemberships =
			endpoint<Models.CollectionMembership>("collectionMemberships");
		this.collectionMembershipTypes =
			endpoint<Models.CollectionMembershipType>(
				"collectionMembershipTypes",
			);
		this.collectionRelations =
			endpoint<Models.CollectionRelation>("collectionRelations");
		this.collectionRelationTypes =
			endpoint<Models.CollectionRelationType>("collectionRelationTypes");
		this.collectionTypes =
			endpoint<Models.CollectionType>("collectionTypes");
		this.companies = endpoint<Models.Company>("companies");
		this.companyLogos = endpoint<Models.CompanyLogo>("companyLogos");
		this.companySizes = endpoint<Models.CompanySize>("companySizes");
		this.companyStatuses =
			endpoint<Models.CompanyStatus>("companyStatuses");
		this.companyTypes = endpoint<Models.CompanyType>("companyTypes");
		this.companyTypeHistories =
			endpoint<Models.CompanyTypeHistory>("companyTypeHistories");
		this.companyWebsites =
			endpoint<Models.CompanyWebsite>("companyWebsites");
		this.covers = endpoint<Models.Cover>("covers");
		this.dateFormats = endpoint<Models.DateFormat>("dateFormats");
		this.entityTypes = endpoint<Models.EntityType>("entityTypes");
		this.events = endpoint<Models.Event>("events");
		this.eventLogos = endpoint<Models.EventLogo>("eventLogos");
		this.eventNetworks = endpoint<Models.EventNetwork>("eventNetworks");
		this.externalGames = endpoint<Models.ExternalGame>("externalGames");
		this.externalGameSources =
			endpoint<Models.ExternalGameSource>("externalGameSources");
		this.franchises = endpoint<Models.Franchise>("franchises");
		this.games = endpoint<Models.Game>("games");
		this.gameEngines = endpoint<Models.GameEngine>("gameEngines");
		this.gameEngineLogos =
			endpoint<Models.GameEngineLogo>("gameEngineLogos");
		this.gameLocalizations =
			endpoint<Models.GameLocalization>("gameLocalizations");
		this.gameModes = endpoint<Models.GameMode>("gameModes");
		this.gameReleaseFormats =
			endpoint<Models.GameReleaseFormat>("gameReleaseFormats");
		this.gameStatuses = endpoint<Models.GameStatus>("gameStatuses");
		this.gameTimeToBeats =
			endpoint<Models.GameTimeToBeat>("gameTimeToBeats");
		this.gameTypes = endpoint<Models.GameType>("gameTypes");
		this.gameVersions = endpoint<Models.GameVersion>("gameVersions");
		this.gameVersionFeatures =
			endpoint<Models.GameVersionFeature>("gameVersionFeatures");
		this.gameVersionFeatureValues =
			endpoint<Models.GameVersionFeatureValue>(
				"gameVersionFeatureValues",
			);
		this.gameVideos = endpoint<Models.GameVideo>("gameVideos");
		this.genres = endpoint<Models.Genre>("genres");
		this.involvedCompanies =
			endpoint<Models.InvolvedCompany>("involvedCompanies");
		this.keywords = endpoint<Models.Keyword>("keywords");
		this.languages = endpoint<Models.Language>("languages");
		this.languageSupports =
			endpoint<Models.LanguageSupport>("languageSupports");
		this.languageSupportTypes =
			endpoint<Models.LanguageSupportType>("languageSupportTypes");
		this.multiplayerModes =
			endpoint<Models.MultiplayerMode>("multiplayerModes");
		this.networkTypes = endpoint<Models.NetworkType>("networkTypes");
		this.platforms = endpoint<Models.Platform>("platforms");
		this.platformFamilies =
			endpoint<Models.PlatformFamily>("platformFamilies");
		this.platformLogos = endpoint<Models.PlatformLogo>("platformLogos");
		this.platformTypes = endpoint<Models.PlatformType>("platformTypes");
		this.platformVersions =
			endpoint<Models.PlatformVersion>("platformVersions");
		this.platformVersionCompanies =
			endpoint<Models.PlatformVersionCompany>(
				"platformVersionCompanies",
			);
		this.platformVersionReleaseDates =
			endpoint<Models.PlatformVersionReleaseDate>(
				"platformVersionReleaseDates",
			);
		this.platformWebsites =
			endpoint<Models.PlatformWebsite>("platformWebsites");
		this.playerPerspectives =
			endpoint<Models.PlayerPerspective>("playerPerspectives");
		this.popularityPrimitives =
			endpoint<Models.PopularityPrimitive>("popularityPrimitives");
		this.popularityTypes =
			endpoint<Models.PopularityType>("popularityTypes");
		this.regions = endpoint<Models.Region>("regions");
		this.releaseDates = endpoint<Models.ReleaseDate>("releaseDates");
		this.releaseDateRegions =
			endpoint<Models.ReleaseDateRegion>("releaseDateRegions");
		this.releaseDateStatuses =
			endpoint<Models.ReleaseDateStatus>("releaseDateStatuses");
		this.reports = endpoint<Models.Report>("reports");
		this.reportTypes = endpoint<Models.ReportType>("reportTypes");
		this.screenshots = endpoint<Models.Screenshot>("screenshots");
		this.search = endpoint<Models.Search>("search");
		this.themes = endpoint<Models.Theme>("themes");
		this.websites = endpoint<Models.Website>("websites");
		this.websiteTypes = endpoint<Models.WebsiteType>("websiteTypes");
	}

	endpoint<TModel extends Models.IGDBEntity = Models.IGDBAnyEntity>(
		path: IGDBEndpointPath | string,
	): IGDBEndpoint<TModel> {
		return new IGDBEndpoint<TModel>(this.#http, path);
	}

	request<T = Models.IGDBAnyEntity>(
		endpoint: IGDBEndpointPath | string,
		query: string,
	): Promise<T[]> {
		return this.#http.request<T>(endpoint, query);
	}

	count(endpoint: IGDBEndpointPath | string, query = ""): Promise<number> {
		return this.#http.requestCount(endpoint, query);
	}

	meta(endpoint: IGDBEndpointPath | string): Promise<Models.MetaField[]> {
		return this.#http.get<Models.MetaField[]>(`${endpoint}/meta`);
	}

	requestProtobuf(
		endpoint: IGDBEndpointPath | string,
		query: string,
	): Promise<ArrayBuffer> {
		return this.#http.requestProtobuf(endpoint, query);
	}

	multiQuery<T = Models.IGDBAnyEntity>(
		query: string,
	): Promise<Array<MultiQueryResult<T>>> {
		return this.#http.post<Array<MultiQueryResult<T>>>("multiquery", query);
	}

	createWebhook(
		endpoint: IGDBEndpointPath | string,
		options: CreateWebhookOptions,
	): Promise<Models.Webhook> {
		const body = new URLSearchParams({
			method: options.method,
			secret: options.secret,
			url: options.url,
		});
		return this.#http.postForm<Models.Webhook>(
			`${endpoint}/webhooks`,
			body,
		);
	}

	listWebhooks(): Promise<Models.Webhook[]> {
		return this.#http.get<Models.Webhook[]>("webhooks");
	}

	getWebhook(id: number | string): Promise<Models.Webhook> {
		return this.#http.get<Models.Webhook>(`webhooks/${id}`);
	}

	deleteWebhook(id: number | string): Promise<Models.Webhook> {
		return this.#http.delete<Models.Webhook>(`webhooks/${id}`);
	}

	testWebhook(
		endpoint: IGDBEndpointPath | string,
		webhookId: number | string,
		entityId: number | string,
	): Promise<unknown> {
		return this.#http.postForm(
			`${endpoint}/webhooks/test/${webhookId}`,
			new URLSearchParams(),
			{ entityId },
		);
	}

	async dispose(): Promise<void> {
		await Promise.all([this.#http.dispose(), this.#auth.dispose()]);
	}
}
