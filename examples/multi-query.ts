import { createClient } from "./client";

const client = createClient();

try {
	const response = await client.multiQuery(`
query games "Top Games" {
  fields name,rating;
  sort rating desc;
  limit 5;
};

query platforms/count "Platform Count" {
};
`);

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
