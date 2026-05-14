import { IGDBClient } from "@api-wrappers/igdb-wrapper";

export function createClient(): IGDBClient {
	const clientId = process.env.TWITCH_CLIENT_ID;
	const clientSecret = process.env.TWITCH_CLIENT_SECRET;

	if (!clientId || !clientSecret) {
		throw new Error(
			"Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET before running examples.",
		);
	}

	return new IGDBClient({
		clientId,
		clientSecret,
	});
}
