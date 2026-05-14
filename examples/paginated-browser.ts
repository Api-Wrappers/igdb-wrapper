import { createClient } from "./client";

const client = createClient();

try {
	const pageSize = 20;
	const pageIndex = 0;

	const baseQuery = client.games
		.query()
		.select((game) => ({
			id: game.id,
			name: game.name,
			rating: game.rating,
			ratingCount: game.rating_count,
		}))
		.where((game) => game.rating_count.gte(100))
		.sort((game) => game.rating, "desc");

	const [items, total] = await Promise.all([
		baseQuery.limit(pageSize).offset(pageIndex * pageSize).execute(),
		baseQuery.count(),
	]);

	console.log(`Showing ${items.length} of ${total} games`);
	for (const game of items) {
		console.log(`${game.name}: ${game.rating ?? "unrated"}`);
	}
} finally {
	await client.dispose();
}
