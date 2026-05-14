import { createClient } from "./client";

const client = createClient();

try {
	const games = await client.games
		.query()
		.fields("name", "platforms.name", "genres.name", "cover.image_id")
		.where((game) => game.rating.gte(80))
		.whereRaw("platforms = {48,6}")
		.sort((game) => game.rating, "desc")
		.limit(10)
		.execute();

	console.log(games);
} finally {
	await client.dispose();
}
