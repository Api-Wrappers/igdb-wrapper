import { describe, expect, test } from "bun:test";
import { IGDBClient } from "../client/IGDBClient";
import type { IGDBSearchableEndpointPath } from "../endpoints/registry";
import { IGDBValidationError } from "../errors";

const testConfig = {
	clientId: "client-id",
	clientSecret: "client-secret",
	fetch: (async () => new Response()) as unknown as typeof fetch,
};

describe("endpoint search capabilities", () => {
	test("allows the high-level search helper only on searchable IGDB endpoints", async () => {
		const client = new IGDBClient(testConfig);

		expect(client.games.search("zelda").raw()).toContain('search "zelda";');
		expect(() => client.companies.search("Nintendo")).toThrow(
			IGDBValidationError,
		);

		await client.dispose();
	});

	test("narrows IGDBSearchableEndpointPath to documented searchable paths", () => {
		const path: IGDBSearchableEndpointPath = "games";
		expect(path).toBe("games");

		// @ts-expect-error genres is not a searchable IGDB endpoint
		const unsupported: IGDBSearchableEndpointPath = "genres";
		expect(unsupported).toBe("genres");
	});
});
