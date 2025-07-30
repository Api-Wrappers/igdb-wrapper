import type { IGDBImageSize } from "@/@types";

/**
 * Construct an IGDB image URL from an image_id and size
 * @param imageId The image_id from IGDB (e.g., from cover.image_id)
 * @param size The desired image size
 * @returns The complete image URL
 */
export function buildIGDBImageUrl(
	imageId: string,
	size: IGDBImageSize = "original",
): string {
	if (!imageId) {
		throw new Error("Image ID is required to build IGDB image URL");
	}

	const baseUrl = "https://images.igdb.com/igdb/image/upload";

	// Handle different size formats
	let sizeParam: string;
	switch (size) {
		case "original":
			sizeParam = "t_original";
			break;
		case "cover_small":
			sizeParam = "t_cover_small";
			break;
		case "cover_med":
			sizeParam = "t_cover_med";
			break;
		case "cover_big":
			sizeParam = "t_cover_big";
			break;
		case "screenshot_med":
			sizeParam = "t_screenshot_med";
			break;
		case "screenshot_big":
			sizeParam = "t_screenshot_big";
			break;
		case "screenshot_huge":
			sizeParam = "t_screenshot_huge";
			break;
		case "logo_med":
			sizeParam = "t_logo_med";
			break;
		case "thumb":
			sizeParam = "t_thumb";
			break;
		case "micro":
			sizeParam = "t_micro";
			break;
		case "720p":
			sizeParam = "t_720p";
			break;
		case "1080p":
			sizeParam = "t_1080p";
			break;
		default:
			sizeParam = "t_original";
	}

	return `${baseUrl}/${sizeParam}/${imageId}.jpg`;
}

/**
 * Extract image URLs from IGDB cover object
 * @param cover The cover object from IGDB
 * @param size The desired image size
 * @returns Image URL or null if no cover
 */
export function getCoverImageUrl(
	cover: { image_id: string } | null | undefined,
	size: IGDBImageSize = "cover_big",
): string | null {
	if (!cover?.image_id) return null;
	return buildIGDBImageUrl(cover.image_id, size);
}

/**
 * Extract image URLs from IGDB screenshot objects
 * @param screenshots Array of screenshot objects from IGDB
 * @param size The desired image size
 * @returns Array of image URLs
 */
export function getScreenshotImageUrls(
	screenshots: { image_id: string }[] | null | undefined,
	size: IGDBImageSize = "screenshot_big",
): string[] {
	if (!screenshots || !Array.isArray(screenshots)) return [];

	return screenshots
		.filter((screenshot) => screenshot.image_id)
		.map((screenshot) => buildIGDBImageUrl(screenshot.image_id, size));
}

/**
 * Extract image URLs from IGDB artwork objects
 * @param artworks Array of artwork objects from IGDB
 * @param size The desired image size
 * @returns Array of image URLs
 */
export function getArtworkImageUrls(
	artworks: { image_id: string }[] | null | undefined,
	size: IGDBImageSize = "1080p",
): string[] {
	if (!artworks || !Array.isArray(artworks)) return [];

	return artworks
		.filter((artwork) => artwork.image_id)
		.map((artwork) => buildIGDBImageUrl(artwork.image_id, size));
}

/**
 * Convert Unix timestamp to Date object
 * @param timestamp Unix timestamp from IGDB
 * @returns Date object or null if invalid
 */
export function convertIGDBTimestamp(
	timestamp: number | null | undefined,
): Date | null {
	if (!timestamp || timestamp <= 0) return null;
	return new Date(timestamp * 1000);
}

/**
 * Format IGDB release date for display
 * @param releaseDate Release date object from IGDB
 * @returns Formatted date string or null
 */
export function formatReleaseDate(
	releaseDate: { date?: number; human?: string } | null | undefined,
): string | null {
	if (!releaseDate) return null;

	// Prefer human-readable format if available
	if (releaseDate.human) {
		return releaseDate.human;
	}

	// Fall back to converting timestamp
	if (releaseDate.date) {
		const date = convertIGDBTimestamp(releaseDate.date);
		return date ? date.toLocaleDateString() : null;
	}

	return null;
}

/**
 * Check if a field returns expanded objects vs just IDs
 * @param fieldName The field name to check
 * @returns true if field uses .* syntax (returns objects)
 */
export function isExpandedField(fieldName: string): boolean {
	return fieldName.includes(".*") || fieldName.endsWith(".*");
}

/**
 * Get the base field name without .* expansion
 * @param fieldName The field name (e.g., "genres.*")
 * @returns Base field name (e.g., "genres")
 */
export function getBaseFieldName(fieldName: string): string {
	return fieldName.replace(/\.\*$/, "");
}
