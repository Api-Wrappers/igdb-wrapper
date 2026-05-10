import { describe, expect, test } from "bun:test";
import { IGDBClient } from "../client/IGDBClient";
import { IGDBRateLimitError } from "../errors";
import { buildImageUrl, createTagNumber } from "../index";

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

	test("exposes documented IGDB endpoints through the generic endpoint wrapper", async () => {
		const calls: Array<{ url: string; body: BodyInit | null | undefined }> = [];
		const fetchMock = (async (input, init) => {
			const url = String(input);
			calls.push({ url, body: init?.body });

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/artworks") {
				return Response.json([{ id: 1, image_id: "abc123" }]);
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await expect(
			client.artworks.query().fields("image_id", "game.name").limit(2).execute(),
		).resolves.toEqual([{ id: 1, image_id: "abc123" }]);
		await client.dispose();

		expect(calls.at(-1)).toEqual({
			url: "https://api.igdb.com/v4/artworks",
			body: "fields image_id,game.name;\nlimit 2;",
		});
	});

	test("compiles documented APICalypse features", () => {
		const client = new IGDBClient({
			...testConfig,
			fetch: (async () => new Response()) as unknown as typeof fetch,
		});

		const query = client.games
			.query()
			.fields("*")
			.exclude("screenshots")
			.where((game) => [
				game.name.containsText("Smash", { caseSensitive: false }),
				game.platforms.containsAll([48, 6]),
			])
			.where((game) => game.version_parent.isNull())
			.raw();

		expect(query).toBe(
			[
				"fields *;",
				"exclude screenshots;",
				'where name ~ *"Smash"* & platforms = [48,6] & version_parent = null;',
			].join("\n"),
		);
	});

	test("sends multi-query bodies to the IGDB multiquery endpoint", async () => {
		const fetchMock = (async (input, init) => {
			const url = String(input);

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/multiquery") {
				expect(init?.body).toBe(
					'query platforms/count "Count of Platforms" {\n};',
				);
				return Response.json([{ name: "Count of Platforms", count: 155 }]);
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await expect(
			client.multiQuery('query platforms/count "Count of Platforms" {\n};'),
		).resolves.toEqual([{ name: "Count of Platforms", count: 155 }]);
		await client.dispose();
	});

	test("supports meta and protobuf requests", async () => {
		const protobufBytes = new Uint8Array([8, 1, 18, 4]);
		const coreRequestUrls: string[] = [];
		const fetchMock = (async (input, init) => {
			const url = String(input);

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/games/meta") {
				expect(init?.method).toBe("GET");
				return Response.json([{ name: "name", type: "String" }]);
			}

			if (url === "https://api.igdb.com/v4/games.pb") {
				const headers = new Headers(init?.headers);
				expect(init?.method).toBe("POST");
				expect(headers.get("accept")).toBe("application/octet-stream");
				expect(headers.get("authorization")).toBe("Bearer access-token");
				expect(headers.get("x-core-request")).toBe("yes");
				expect(init?.body).toBe("fields id,name; limit 1;");
				return new Response(protobufBytes, {
					headers: { "content-type": "application/octet-stream" },
				});
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({
			...testConfig,
			fetch: fetchMock,
			plugins: [
				{
					name: "protobuf-core-probe",
					beforeRequest(ctx) {
						if (ctx.url.endsWith(".pb")) {
							coreRequestUrls.push(ctx.url);
							return {
								...ctx,
								headers: { ...ctx.headers, "x-core-request": "yes" },
							};
						}
						return ctx;
					},
				},
			],
		});

		await expect(client.games.meta()).resolves.toEqual([
			{ name: "name", type: "String" },
		]);
		const bytes = new Uint8Array(
			await client.requestProtobuf("games", "fields id,name; limit 1;"),
		);
		await client.dispose();

		expect([...bytes]).toEqual([...protobufBytes]);
		expect(coreRequestUrls).toEqual(["https://api.igdb.com/v4/games.pb"]);
	});

	test("builds IGDB image URLs and tag numbers from documented formulas", () => {
		expect(
			buildImageUrl("abc123", { retina: true, size: "cover_big" }),
		).toBe(
			"https://images.igdb.com/igdb/image/upload/t_cover_big_2x/abc123.jpg",
		);
		expect(createTagNumber("genre", 5)).toBe(268435461);
		expect(createTagNumber("keyword", 148)).toBe(536871060);
	});

	test("supports webhook registration, listing, lookup, testing, and deletion", async () => {
		const calls: Array<{ url: string; init?: RequestInit }> = [];
		const fetchMock = (async (input, init) => {
			const url = String(input);
			calls.push({ url, init });

			if (url.startsWith("https://id.twitch.tv/oauth2/token")) {
				return Response.json({
					access_token: "access-token",
					expires_in: 3600,
					token_type: "bearer",
				});
			}

			if (url === "https://api.igdb.com/v4/games/webhooks") {
				const headers = new Headers(init?.headers);
				expect(init?.method).toBe("POST");
				expect(headers.get("content-type")).toBe(
					"application/x-www-form-urlencoded",
				);
				expect(String(init?.body)).toBe(
					"method=create&secret=s3cr3t&url=https%3A%2F%2Fexample.com%2Figdb",
				);
				return Response.json({ id: 42, active: true });
			}

			if (url === "https://api.igdb.com/v4/webhooks") {
				expect(init?.method).toBe("GET");
				return Response.json([{ id: 42, active: true }]);
			}

			if (url === "https://api.igdb.com/v4/webhooks/42") {
				if (init?.method === "GET") return Response.json({ id: 42 });
				if (init?.method === "DELETE") return Response.json({ id: 42 });
			}

			if (
				url ===
				"https://api.igdb.com/v4/games/webhooks/test/42?entityId=1942"
			) {
				expect(init?.method).toBe("POST");
				return Response.json({ ok: true });
			}

			throw new Error(`Unexpected request: ${url}`);
		}) as typeof fetch;

		const client = new IGDBClient({ ...testConfig, fetch: fetchMock });

		await expect(
			client.createWebhook("games", {
				method: "create",
				secret: "s3cr3t",
				url: "https://example.com/igdb",
			}),
		).resolves.toEqual({ id: 42, active: true });
		await expect(client.listWebhooks()).resolves.toEqual([
			{ id: 42, active: true },
		]);
		await expect(client.getWebhook(42)).resolves.toEqual({ id: 42 });
		await expect(client.testWebhook("games", 42, 1942)).resolves.toEqual({
			ok: true,
		});
		await expect(client.deleteWebhook(42)).resolves.toEqual({ id: 42 });
		await client.dispose();

		expect(calls.map((call) => call.url)).toContain(
			"https://api.igdb.com/v4/games/webhooks/test/42?entityId=1942",
		);
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
