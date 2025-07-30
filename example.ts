import { IGDB } from "./src";
import type { Game, Genre, Screenshot, SimilarGame } from "./src/@types";
import {
	buildIGDBImageUrl,
	convertIGDBTimestamp,
	formatReleaseDate,
	getCoverImageUrl,
	getScreenshotImageUrls,
} from "./src/utils";

// Example usage of the IGDB wrapper with route classes
async function example() {
	// Initialize the IGDB client
	const igdb = new IGDB({
		clientId: Bun.env.TWITCH_CLIENT_ID as string,
		clientSecret: Bun.env.TWITCH_CLIENT_SECRET as string,
	});

	try {
		// Games examples
		console.log("=== Games Examples ===");

		// Search for games (with rich default data)
		console.log("Making request: Search for Zelda games...");
		let searchResults: Game[] = [];
		try {
			searchResults = await igdb.games.searchGames("Zelda", {
				limit: 3,
			});
			console.log("✅ Search request successful");
			console.log("Search results with full data:", searchResults);
		} catch (error) {
			console.error("❌ Search games request failed:", error);
			console.log("Continuing with other examples...\n");
			searchResults = [];
		}

		// Access nested data from default fields (with .* these return full objects)
		if (searchResults.length > 0) {
			const game = searchResults[0];
			if (!game) {
				console.log("No game found");
				return;
			}

			console.log("Game name:", game.name);

			// Cover object (not just ID because of cover.* in default fields)
			if (game.cover && typeof game.cover === "object") {
				console.log("Cover image ID:", game.cover.image_id);
				console.log(
					"Cover dimensions:",
					`${game.cover.width}x${game.cover.height}`,
				);

				// Use helper to get different image sizes
				const coverUrls = {
					small: getCoverImageUrl(game.cover, "cover_small"),
					medium: getCoverImageUrl(game.cover, "cover_med"),
					large: getCoverImageUrl(game.cover, "cover_big"),
				};
				console.log("Cover URLs:", coverUrls);
			}

			// Screenshots array (objects because of screenshots.* in default fields)
			if (game.screenshots && Array.isArray(game.screenshots)) {
				// Check if screenshots are objects with image_id (not just numbers)
				const screenshotObjects = game.screenshots.filter(
					(s: unknown): s is Screenshot =>
						typeof s === "object" && s !== null && "image_id" in s,
				);

				if (screenshotObjects.length > 0) {
					const screenshotUrls = getScreenshotImageUrls(
						screenshotObjects,
						"screenshot_big",
					);
					console.log(`Found ${screenshotUrls.length} screenshots`);
				}
			}

			// Genres array (objects because of genres.* in default fields)
			if (game.genres && Array.isArray(game.genres)) {
				const genreObjects = game.genres.filter(
					(g: unknown): g is Genre =>
						typeof g === "object" && g !== null && "name" in g,
				);
				const genreNames = genreObjects.map((g: Genre) => g.name);
				console.log("Genres:", genreNames);
			}

			// Release dates with formatting
			if (game.release_dates && Array.isArray(game.release_dates)) {
				const releaseDates = game.release_dates
					.map((rd: unknown) =>
						typeof rd === "object" ? formatReleaseDate(rd) : null,
					)
					.filter(Boolean);
				console.log("Release dates:", releaseDates);
			}

			// Similar games (full objects because of similar_games.* fields)
			if (game.similar_games && Array.isArray(game.similar_games)) {
				const similarGameObjects = game.similar_games.filter(
					(sg: unknown): sg is SimilarGame =>
						typeof sg === "object" && sg !== null && "name" in sg,
				);
				const similarGameNames = similarGameObjects
					.map((sg: SimilarGame) => sg.name)
					.slice(0, 3); // Show first 3
				console.log("Similar games:", similarGameNames);
			}
		}

		// Get popular games
		console.log("Making request: Get popular games...");
		try {
			const popularGames = await igdb.games.getPopularGames({
				limit: 5,
			});
			console.log("✅ Popular games request successful");
			console.log("Popular games:", popularGames);
		} catch (error) {
			console.error("❌ Get popular games request failed:", error);
		}

		// Get a specific game by ID
		console.log("Making request: Get specific game by ID (1942)...");
		try {
			const game = await igdb.games.getGame(1942); // Zelda game ID
			console.log("✅ Get game by ID request successful");
			console.log("Specific game:", game);
		} catch (error) {
			console.error("❌ Get game by ID request failed:", error);
		}

		// Get recent games
		console.log("Making request: Get recent games...");
		try {
			const recentGames = await igdb.games.getRecentGames({
				limit: 5,
			});
			console.log("✅ Recent games request successful");
			console.log("Recent games:", recentGames);
		} catch (error) {
			console.error("❌ Get recent games request failed:", error);
		}

		// Get upcoming games
		console.log("Making request: Get upcoming games...");
		try {
			const upcomingGames = await igdb.games.getUpcomingGames({
				limit: 5,
			});
			console.log("✅ Upcoming games request successful");
			console.log("Upcoming games:", upcomingGames);
		} catch (error) {
			console.error("❌ Get upcoming games request failed:", error);
		}

		// Genres examples
		console.log("\n=== Genres Examples ===");

		// Get all genres
		console.log("Making request: Get all genres sorted...");
		try {
			const allGenres = await igdb.genres.getAllGenresSorted({
				limit: 20,
			});
			console.log("✅ Get all genres request successful");
			console.log("All genres:", allGenres);
		} catch (error) {
			console.error("❌ Get all genres request failed:", error);
		}

		// Note: Genre search is not supported by IGDB API
		// Instead, get all genres and filter locally
		console.log("Making request: Filter genres locally for 'action'...");
		try {
			const allGenres = await igdb.genres.getGenres();
			const actionGenres = allGenres.filter((genre: Genre) =>
				genre.name.toLowerCase().includes("action"),
			);
			console.log("✅ Local genre filtering successful");
			console.log("Action-related genres:", actionGenres);
		} catch (error) {
			console.error("❌ Get genres for filtering failed:", error);
		}

		// Get genre by slug
		console.log("Making request: Get genre by slug 'role-playing-rpg'...");
		try {
			const rpgGenre = await igdb.genres.getGenreBySlug("role-playing-rpg");
			console.log("✅ Get genre by slug request successful");
			console.log("RPG genre:", rpgGenre);
		} catch (error) {
			console.error("❌ Get genre by slug request failed:", error);
		}

		// Companies examples
		console.log("\n=== Companies Examples ===");

		// Search for companies
		console.log("Making request: Search companies for 'Nintendo'...");
		try {
			const nintendoCompanies =
				await igdb.companies.searchCompanies("Nintendo");
			console.log("✅ Search companies request successful");
			console.log("Nintendo companies:", nintendoCompanies);
		} catch (error) {
			console.error("❌ Search companies request failed:", error);
		}

		// Get developer companies
		console.log("Making request: Get developer companies...");
		try {
			const developers = await igdb.companies.getDeveloperCompanies({
				limit: 10,
			});
			console.log("✅ Get developer companies request successful");
			console.log("Developer companies:", developers);
		} catch (error) {
			console.error("❌ Get developer companies request failed:", error);
		}

		// Get publisher companies
		console.log("Making request: Get publisher companies...");
		try {
			const publishers = await igdb.companies.getPublisherCompanies({
				limit: 10,
			});
			console.log("✅ Get publisher companies request successful");
			console.log("Publisher companies:", publishers);
		} catch (error) {
			console.error("❌ Get publisher companies request failed:", error);
		}

		// Advanced usage with custom fields
		console.log("\n=== Advanced Usage ===");

		// Get games with custom fields and no default fields
		const customGames = await igdb.games.getGames({
			fields: ["name", "summary", "rating", "genres.name", "platforms.name"],
			includeDefaultFields: false,
			limit: 5,
			sort: "rating desc",
			where: "rating > 80",
		});
		console.log("Custom games query:", customGames);

		// Get games with minimal fields for performance
		const minimalGames = await igdb.games.getGames({
			fields: ["id", "name", "rating"],
			includeDefaultFields: false,
			limit: 10,
		});
		console.log("Minimal games for performance:", minimalGames);

		// Example showing the power of default fields vs minimal
		console.log("\n=== Default Fields vs Minimal Fields Demo ===");

		console.log("Making request: Get game with default fields...");
		let gameWithDefaults: Game | null = null;
		try {
			gameWithDefaults = await igdb.games.getGame(1942); // Zelda
			console.log("✅ Game with defaults request successful");
			console.log("Game with default fields (full data):", {
				hasScreenshots: !!gameWithDefaults?.screenshots,
				hasCover: !!gameWithDefaults?.cover,
				hasPlatforms: !!gameWithDefaults?.platforms,
				hasGenres: !!gameWithDefaults?.genres,
				hasSimilarGames: !!gameWithDefaults?.similar_games,
				// Check if these are expanded objects vs just IDs
				coverIsObject: typeof gameWithDefaults?.cover === "object",
				genresAreObjects:
					Array.isArray(gameWithDefaults?.genres) &&
					gameWithDefaults?.genres.length > 0 &&
					typeof gameWithDefaults.genres[0] === "object",
			});
		} catch (error) {
			console.error("❌ Game with defaults request failed:", error);
		}

		console.log("Making request: Get game with minimal fields...");
		try {
			const gameMinimal = await igdb.games.getGame(1942, {
				fields: ["id", "name", "rating"],
				includeDefaultFields: false,
			});
			console.log("✅ Game with minimal fields request successful");
			console.log("Same game with minimal fields:", gameMinimal);
		} catch (error) {
			console.error("❌ Game with minimal fields request failed:", error);
		}

		// Demonstrate image URL building
		if (gameWithDefaults?.cover && typeof gameWithDefaults.cover === "object") {
			console.log("\n=== Image URL Examples ===");
			const imageId = gameWithDefaults.cover.image_id;

			const imageUrls = {
				thumb: buildIGDBImageUrl(imageId, "thumb"),
				coverSmall: buildIGDBImageUrl(imageId, "cover_small"),
				coverMed: buildIGDBImageUrl(imageId, "cover_med"),
				coverBig: buildIGDBImageUrl(imageId, "cover_big"),
				original: buildIGDBImageUrl(imageId, "original"),
			};

			console.log("Generated image URLs:", imageUrls);
		}

		// Demonstrate timestamp conversion
		if (gameWithDefaults?.first_release_date) {
			const releaseDate = convertIGDBTimestamp(
				gameWithDefaults.first_release_date,
			);
			console.log("Release date:", releaseDate?.toLocaleDateString());
		}

		// Low-level request using the request handler directly
		console.log("Making request: Low-level direct request...");
		try {
			const customResponse = await igdb
				.getRequestHandler()
				.post("games", "fields name, rating; where rating > 90; limit 5;");
			console.log("✅ Low-level request successful");
			console.log("Low-level request:", customResponse);
		} catch (error) {
			console.error("❌ Low-level request failed:", error);
		}
	} catch (error) {
		console.error("❌ Fatal error in example:", error);
		console.error(
			"Stack trace:",
			error instanceof Error ? error.stack : "No stack trace available",
		);
	}
}

// Uncomment to run the example
example();
