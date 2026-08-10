import { describe, expect, test } from "bun:test";
import { IGDBValidationError } from "../errors";
import { MultiQueryBuilder } from "../query/MultiQueryBuilder";

describe("MultiQueryBuilder limits", () => {
	test("allows at most the 10 queries supported by IGDB", () => {
		let builder = new MultiQueryBuilder();

		for (let index = 0; index < 10; index++) {
			builder = builder.query("games", `query-${index}`, (query) =>
				query.limit(1),
			);
		}

		expect(builder.inspect().blocks).toHaveLength(10);
		expect(() =>
			builder.query("games", "query-10", (query) => query.limit(1)),
		).toThrow(IGDBValidationError);
	});
});
