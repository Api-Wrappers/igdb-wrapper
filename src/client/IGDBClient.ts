import { AuthManager } from "../auth/AuthManager";
import { CompaniesEndpoint } from "../endpoints/companies";
import { GamesEndpoint } from "../endpoints/games";
import { GenresEndpoint } from "../endpoints/genres";
import { PlatformsEndpoint } from "../endpoints/platforms";
import { HttpClient } from "../http/HttpClient";
import type { IGDBClientConfig } from "./config";

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
