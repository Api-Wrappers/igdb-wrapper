import { buildImageUrl } from "@api-wrappers/igdb-wrapper";
import { createClient } from "./client";

const client = createClient();

try {
	const games = await client.games
		.search("zelda")
		.select((game) => ({
			id: game.id,
			name: game.name,
			slug: game.slug,
			rating: game.rating,
			cover: {
				imageId: game.cover.image_id,
			},
		}))
		.where((game) => game.rating.gte(70))
		.limit(10)
		.execute();

	for (const game of games) {
		const coverUrl = game.cover?.imageId
			? buildImageUrl(game.cover.imageId, {
					size: "cover_big",
					retina: true,
				})
			: "no cover";

		console.log(`${game.name} (${game.rating ?? "unrated"})`);
		console.log(`  ${coverUrl}`);
	}
} finally {
	await client.dispose();
}
