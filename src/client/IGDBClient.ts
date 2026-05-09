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
		this.games = new GamesEndpoint(http);
		this.genres = new GenresEndpoint(http);
		this.platforms = new PlatformsEndpoint(http);
		this.companies = new CompaniesEndpoint(http);
	}

	async dispose(): Promise<void> {
		await Promise.all([this.#http.dispose(), this.#auth.dispose()]);
	}
}
