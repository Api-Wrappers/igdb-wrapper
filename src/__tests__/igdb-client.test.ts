import { describe, expect, test } from "bun:test";
import { IGDBClient } from "../client/IGDBClient";
import { IGDBRateLimitError } from "../errors";

const testConfig = {
	clientId: "client-id",
	clientSecret: "client-secret",
	rateLimit: { maxConcurrent: 4, minTimeMs: 0 },
	retry: { maxAttempts: 1 },
};

describe("IGDBClient", () => {
	test("requests a Twitch token and sends IGDB queries through api-core", async () => {
		const calls: Array<{ url: string; init?: RequestInit }> = [];
		const fetchMock = (async (input, init) => {
			const url = String(input);
			calls.push({ url, init });

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				const parsed = new URL(url);
				expect(init?.method).toBe("POST");
				expect(parsed.searchParams.get("client_id")).toBe("client-id");
				expect(parsed.searchParams.get("client_secret")).toBe("client-secret");
				expect(parsed.searchParams.get("grant_type")).toBe(
					"client_credentials",
				);
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/games") {
				const headers = new Headers(init?.headers);
				expect(init?.method).toBe("POST");
				expect(headers.get("accept")).toBe("application/json");
				expect(headers.get("authorization")).toBe("Bearer access-token");
				expect(headers.get("client-id")).toBe("client-id");
				expect(headers.get("content-type")).toBe("text/plain");
				expect(init?.body).toBe("fields id,name;\nlimit 1;");
				return Response.json([{ id: 1, name: "Elden Ring" }]);
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await expect(
			client.games
				.query()
				.select((game) => ({ id: game.id, name: game.name }))
				.limit(1)
				.execute(),
		).resolves.toEqual([{ id: 1, name: "Elden Ring" }]);
		await client.dispose();

		expect(calls.map((call) => call.url)).toEqual([
			expect.stringContaining("https://id.twitch.tv/oauth2/token"),
			"https://api.igdb.com/v4/games",
		]);
	});

	test("uses the cached token for count requests", async () => {
		let tokenRequests = 0;
		const fetchMock = (async (input) => {
			const url = String(input);

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				tokenRequests++;
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/games") {
				return Response.json([{ id: 1, name: "Elden Ring" }]);
			}

			if (url === "https://api.igdb.com/v4/games/count") {
				return Response.json({ count: 12 });
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await client.games.query().limit(1).execute();
		await expect(client.games.query().count()).resolves.toBe(12);
		await client.dispose();

		expect(tokenRequests).toBe(1);
	});

	test("maps api-core rate limit errors to IGDBRateLimitError", async () => {
		const fetchMock = (async (input) => {
			const url = String(input);

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			return Response.json(
				{ message: "Too Many Requests" },
				{ status: 429, headers: { "retry-after": "2" } },
			);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await expect(client.games.query().limit(1).execute()).rejects.toThrow(
			IGDBRateLimitError,
		);

		try {
			await client.games.query().limit(1).execute();
		} catch (error) {
			expect(error).toBeInstanceOf(IGDBRateLimitError);
			expect((error as IGDBRateLimitError).retryAfterMs).toBe(2000);
		} finally {
			await client.dispose();
		}
	});
});
