import { createClient } from "./client";

const client = createClient();

try {
	const query = client
		.multiQueryBuilder()
		.query(client.games, "Top Games", (games) =>
			games.fields("name", "rating").sort((game) => game.rating, "desc").limit(5),
		)
		.count(client.platforms, "Platform Count");

	const response = await client.multiQuery(query);

	for (const entry of response) {
		if (entry.count !== undefined) {
			console.log(`${entry.name}: ${entry.count}`);
		} else {
			console.log(`${entry.name}:`, entry.result);
		}
	}
} finally {
	await client.dispose();
}
