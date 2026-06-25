import { AuthManager } from "../auth/AuthManager";
import { IGDBEndpoint } from "../endpoints/Endpoint";
import { IGDB_ENDPOINT_METADATA } from "../endpoints/registry";
import type { IGDBEndpointPath } from "../endpoints/registry";
import { HttpClient } from "../http/HttpClient";
import { MultiQueryBuilder } from "../query/MultiQueryBuilder";
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

export interface IGDBEndpointModelMap {
	ageRatings: Models.AgeRating;
	ageRatingCategories: Models.AgeRatingCategory;
	ageRatingContentDescriptions: Models.AgeRatingContentDescription;
	ageRatingContentDescriptionTypes: Models.AgeRatingContentDescriptionType;
	ageRatingContentDescriptionsV2: Models.AgeRatingContentDescriptionV2;
	ageRatingOrganizations: Models.AgeRatingOrganization;
	alternativeNames: Models.AlternativeName;
	artworks: Models.Artwork;
	artworkTypes: Models.ArtworkType;
	characters: Models.Character;
	characterGenders: Models.CharacterGender;
	characterMugShots: Models.CharacterMugShot;
	characterSpecies: Models.CharacterSpecie;
	collections: Models.Collection;
	collectionMemberships: Models.CollectionMembership;
	collectionMembershipTypes: Models.CollectionMembershipType;
	collectionRelations: Models.CollectionRelation;
	collectionRelationTypes: Models.CollectionRelationType;
	collectionTypes: Models.CollectionType;
	companies: Models.Company;
	companyLogos: Models.CompanyLogo;
	companySizes: Models.CompanySize;
	companyStatuses: Models.CompanyStatus;
	companyTypes: Models.CompanyType;
	companyTypeHistories: Models.CompanyTypeHistory;
	companyWebsites: Models.CompanyWebsite;
	covers: Models.Cover;
	dateFormats: Models.DateFormat;
	entityTypes: Models.EntityType;
	events: Models.Event;
	eventLogos: Models.EventLogo;
	eventNetworks: Models.EventNetwork;
	externalGames: Models.ExternalGame;
	externalGameSources: Models.ExternalGameSource;
	franchises: Models.Franchise;
	games: Models.Game;
	gameEngines: Models.GameEngine;
	gameEngineLogos: Models.GameEngineLogo;
	gameLocalizations: Models.GameLocalization;
	gameModes: Models.GameMode;
	gameReleaseFormats: Models.GameReleaseFormat;
	gameStatuses: Models.GameStatus;
	gameTimeToBeats: Models.GameTimeToBeat;
	gameTypes: Models.GameType;
	gameVersions: Models.GameVersion;
	gameVersionFeatures: Models.GameVersionFeature;
	gameVersionFeatureValues: Models.GameVersionFeatureValue;
	gameVideos: Models.GameVideo;
	genres: Models.Genre;
	involvedCompanies: Models.InvolvedCompany;
	keywords: Models.Keyword;
	languages: Models.Language;
	languageSupports: Models.LanguageSupport;
	languageSupportTypes: Models.LanguageSupportType;
	multiplayerModes: Models.MultiplayerMode;
	networkTypes: Models.NetworkType;
	platforms: Models.Platform;
	platformFamilies: Models.PlatformFamily;
	platformLogos: Models.PlatformLogo;
	platformTypes: Models.PlatformType;
	platformVersions: Models.PlatformVersion;
	platformVersionCompanies: Models.PlatformVersionCompany;
	platformVersionReleaseDates: Models.PlatformVersionReleaseDate;
	platformWebsites: Models.PlatformWebsite;
	playerPerspectives: Models.PlayerPerspective;
	popularityPrimitives: Models.PopularityPrimitive;
	popularityTypes: Models.PopularityType;
	regions: Models.Region;
	releaseDates: Models.ReleaseDate;
	releaseDateRegions: Models.ReleaseDateRegion;
	releaseDateStatuses: Models.ReleaseDateStatus;
	reports: Models.Report;
	reportTypes: Models.ReportType;
	screenshots: Models.Screenshot;
	search: Models.Search;
	themes: Models.Theme;
	websites: Models.Website;
	websiteTypes: Models.WebsiteType;
}

export type IGDBClientEndpoints = {
	readonly [TKey in keyof IGDBEndpointModelMap]: IGDBEndpoint<
		IGDBEndpointModelMap[TKey]
	>;
};

export interface IGDBClient extends IGDBClientEndpoints {}

export class IGDBClient {

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

		this.#auth = auth;
		this.#http = http;

		for (const { key, path } of IGDB_ENDPOINT_METADATA) {
			Object.defineProperty(this, key, {
				configurable: false,
				enumerable: true,
				value: new IGDBEndpoint(http, path),
				writable: false,
			});
		}
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
		query: MultiQueryBuilder,
	): Promise<Array<MultiQueryResult<T>>>;
	multiQuery<T = Models.IGDBAnyEntity>(
		query: string,
	): Promise<Array<MultiQueryResult<T>>>;
	multiQuery<T = Models.IGDBAnyEntity>(
		query: string | MultiQueryBuilder,
	): Promise<Array<MultiQueryResult<T>>> {
		return this.#http.post<Array<MultiQueryResult<T>>>(
			"multiquery",
			typeof query === "string" ? query : query.raw(),
		);
	}

	multiQueryBuilder(): MultiQueryBuilder {
		return new MultiQueryBuilder();
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
