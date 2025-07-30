import type { IGDBClientOptions } from "../@types";

export const checkClientProperties = (options: IGDBClientOptions) => {
	if (!options.clientId || !options.clientSecret) {
		const unsetProperties = [options.clientId, options.clientSecret].filter(
			Boolean,
		);
		if (unsetProperties?.length) {
			throw new Error(
				`[IGDB Client] Missing required properties: ${unsetProperties.join(", ")}`,
			);
		}
	}
};
