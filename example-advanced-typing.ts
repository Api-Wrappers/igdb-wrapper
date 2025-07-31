// Advanced Typing Example for IGDB Wrapper
// This example demonstrates the new query builder and improved typing features

import { IGDB, IGDBQueryFactory } from "./src";

async function advancedTypingExample() {
	console.log("=== Advanced Typing Examples ===\n");

	// Check if credentials are available
	const hasCredentials =
		process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET;

	if (!hasCredentials) {
		console.log(
			"⚠️  No IGDB credentials found. Running in demo mode without API calls.",
		);
		console.log(
			"Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET environment variables to make actual API calls.\n",
		);
	}

	// Initialize the IGDB client (will only be used if credentials are available)
	let igdb: IGDB | null = null;
	if (hasCredentials) {
		igdb = new IGDB({
			clientId: process.env.TWITCH_CLIENT_ID as string,
			clientSecret: process.env.TWITCH_CLIENT_SECRET as string,
		});
	}

	// ============================================================================
	// QUERY BUILDER EXAMPLES
	// ============================================================================

	console.log("1. Query Builder Examples:");

	// Example 1: Using the query builder for games
	const gameQuery = IGDBQueryFactory.games()
		.select("id", "name", "rating", "cover.*", "genres.*")
		.excludeDefaults()
		.byGenre(12) // Action genre
		.byRating(80)
		.sortBy("rating", "desc")
		.limit(10);

	const queryString = gameQuery.build();
	console.log("Generated query string:", queryString);

	// Example 2: Using the query builder with the route (if credentials available)
	if (igdb) {
		const popularActionGames = igdb.games
			.query()
			.select("id", "name", "rating", "cover.*")
			.excludeDefaults()
			.byGenre(12)
			.popular()
			.limit(5);

		try {
			const popularGames = await igdb.games.getGames({
				fields: popularActionGames.getOptions().fields as string[],
				where: popularActionGames.getOptions().where,
				sort: popularActionGames.getOptions().sort as string,
				limit: popularActionGames.getOptions().limit,
				includeDefaultFields: false,
			});

			console.log(
				"Popular action games:",
				popularGames.map((game) => ({
					id: game.id,
					name: game.name,
					rating: game.rating,
					hasCover: !!game.cover,
				})),
			);
		} catch (error) {
			console.log(
				"❌ API call failed (expected without valid credentials):",
				error instanceof Error ? error.message : error,
			);
		}
	} else {
		console.log(
			"📝 Query builder created (no API call made due to missing credentials)",
		);
	}

	// Example 3: Complex query with multiple conditions
	const recentRPGs = igdb?.games
		.query()
		.select("id", "name", "first_release_date", "genres.*", "platforms.*")
		.excludeDefaults()
		.byGenre(12) // RPG genre
		.recent(90) // Last 90 days
		.sortBy("first_release_date", "desc")
		.limit(5);

	console.log(
		"Recent RPGs query:",
		recentRPGs?.build() ?? "Query builder created",
	);

	// ============================================================================
	// SPECIALIZED QUERY METHODS
	// ============================================================================

	console.log("\n2. Specialized Query Methods:");

	// Games with specialized methods
	const gameQuery2 = IGDBQueryFactory.games()
		.byGenre(12)
		.byPlatform(48)
		.byRating(80, 95)
		.byReleaseDate(1640995200) // After 2022-01-01
		.byCompany(123, "developer")
		.popular()
		.recent(30) // Last 30 days
		.upcoming();

	console.log("Complex game query:", gameQuery2.build());

	// Companies with specialized methods
	const companyQuery = IGDBQueryFactory.companies()
		.byCountry(840) // US
		.developers()
		.publishers()
		.searchByName("Nintendo");

	console.log("Company query:", companyQuery.build());

	// Genres with specialized methods
	const genreQuery = IGDBQueryFactory.genres()
		.byName("Action")
		.searchByName("RPG");

	console.log("Genre query:", genreQuery.build());

	// Platforms with specialized methods
	const platformQuery = IGDBQueryFactory.platforms()
		.byCategory(1) // Console
		.byGeneration(8) // 8th generation
		.searchByName("PlayStation");

	console.log("Platform query:", platformQuery.build());

	// ============================================================================
	// CHAINING QUERY METHODS
	// ============================================================================

	console.log("\n3. Chaining Query Methods:");

	const chainedQuery = IGDBQueryFactory.games()
		.select("id", "name", "rating", "cover.*")
		.excludeDefaults()
		.whereAnd(
			"rating >= 80",
			"first_release_date >= 1640995200", // After 2022-01-01
			"genres = 12", // RPG genre
		)
		.whereOr(
			"platforms = 48", // PlayStation 5
			"platforms = 49", // Xbox Series X
		)
		.sortByMultiple(
			{ field: "rating", direction: "desc" },
			{ field: "first_release_date", direction: "desc" },
		)
		.limit(10)
		.offset(20);

	console.log("Chained query:", chainedQuery.build());

	// ============================================================================
	// PERFORMANCE OPTIMIZATION EXAMPLES
	// ============================================================================

	console.log("\n4. Performance Optimization Examples:");

	if (igdb) {
		try {
			// Example 1: Minimal fields for list views
			const gameList = await igdb.games.getGames({
				fields: ["id", "name", "cover.image_id"],
				includeDefaultFields: false,
				limit: 20,
			});

			console.log("Game list (minimal data):", gameList.length, "games loaded");

			// Example 2: Detailed fields for single item views
			const gameDetail = await igdb.games.getGame(1942, {
				fields: [
					"id",
					"name",
					"summary",
					"storyline",
					"rating",
					"first_release_date",
					"cover.*",
					"screenshots.*",
					"genres.*",
					"platforms.*",
					"involved_companies.*",
				],
				includeDefaultFields: false,
			});

			if (gameDetail) {
				console.log("Game detail (full data):", {
					name: gameDetail.name,
					hasCover: !!gameDetail.cover,
					hasScreenshots: !!gameDetail.screenshots,
					genreCount: gameDetail.genres?.length || 0,
					platformCount: gameDetail.platforms?.length || 0,
				});
			}
		} catch (error) {
			console.log(
				"❌ API calls failed (expected without valid credentials):",
				error instanceof Error ? error.message : error,
			);
		}
	} else {
		console.log("📝 Performance optimization examples (no API calls made)");
		console.log(
			"  - Minimal fields for list views: ['id', 'name', 'cover.image_id']",
		);
		console.log(
			"  - Detailed fields for single item views: full object with expanded relations",
		);
	}

	// ============================================================================
	// ADVANCED USAGE PATTERNS
	// ============================================================================

	console.log("\n5. Advanced Usage Patterns:");

	// Pattern 1: Building queries dynamically
	const buildDynamicQuery = (minRating: number) => {
		return IGDBQueryFactory.games()
			.select("id", "name", "rating", "cover.*")
			.excludeDefaults()
			.byRating(minRating)
			.limit(20);
	};

	const dynamicQuery = buildDynamicQuery(80);
	console.log("Dynamic query:", dynamicQuery.build());

	// Pattern 2: Reusing query builders
	const baseQuery = IGDBQueryFactory.games()
		.select("id", "name", "rating")
		.excludeDefaults()
		.sortBy("rating", "desc");

	const popularGamesQuery = baseQuery.popular().limit(10);
	const recentGamesQuery = baseQuery.recent(30).limit(10);

	console.log("Popular games query:", popularGamesQuery.build());
	console.log("Recent games query:", recentGamesQuery.build());

	console.log("\n=== Advanced Typing Examples Complete ===");

	if (!hasCredentials) {
		console.log("\n💡 To run with actual API calls:");
		console.log("1. Get IGDB API credentials from https://api.igdb.com/");
		console.log("2. Set environment variables:");
		console.log("   export IGDB_CLIENT_ID='your-client-id'");
		console.log("   export IGDB_CLIENT_SECRET='your-client-secret'");
		console.log("3. Run: bun run example-advanced-typing.ts");
	}
}

// Run the example
if (require.main === module) {
	advancedTypingExample().catch(console.error);
}

export { advancedTypingExample };
