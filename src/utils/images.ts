export const IGDB_IMAGE_SIZES = [
	"cover_small",
	"screenshot_med",
	"cover_big",
	"logo_med",
	"screenshot_big",
	"screenshot_huge",
	"thumb",
	"micro",
	"720p",
	"1080p",
] as const;

export type IGDBImageSize = (typeof IGDB_IMAGE_SIZES)[number];

export interface IGDBImageUrlOptions {
	size?: IGDBImageSize;
	retina?: boolean;
	extension?: "jpg" | "png" | "webp";
}

export function buildImageUrl(
	imageId: string,
	options: IGDBImageUrlOptions = {},
): string {
	const size = options.size ?? "thumb";
	const suffix = options.retina ? "_2x" : "";
	const extension = options.extension ?? "jpg";
	return `https://images.igdb.com/igdb/image/upload/t_${size}${suffix}/${imageId}.${extension}`;
}
