import { AuthManager } from "../auth/AuthManager.ts";
import { CompaniesEndpoint } from "../endpoints/companies.ts";
import { GamesEndpoint } from "../endpoints/games.ts";
import { GenresEndpoint } from "../endpoints/genres.ts";
import { PlatformsEndpoint } from "../endpoints/platforms.ts";
import { HttpClient } from "../http/HttpClient.ts";
import type { IGDBClientConfig } from "./config.ts";

export class IGDBClient {
	readonly games: GamesEndpoint;
	readonly genres: GenresEndpoint;
	readonly platforms: PlatformsEndpoint;
	readonly companies: CompaniesEndpoint;

	constructor(config: IGDBClientConfig) {
		const auth = new AuthManager({
			clientId: config.clientId,
			clientSecret: config.clientSecret,
		});

		const http = new HttpClient({
			clientId: config.clientId,
			auth,
			retry: config.retry,
			rateLimit: config.rateLimit,
		});

		this.games = new GamesEndpoint(http);
		this.genres = new GenresEndpoint(http);
		this.platforms = new PlatformsEndpoint(http);
		this.companies = new CompaniesEndpoint(http);
	}
}
