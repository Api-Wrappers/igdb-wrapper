export const IGDB_TAG_TYPE_IDS = {
	theme: 0,
	genre: 1,
	keyword: 2,
	game: 3,
	playerPerspective: 4,
} as const;

export type IGDBTagType = keyof typeof IGDB_TAG_TYPE_IDS;

export function createTagNumber(type: IGDBTagType, id: number): number {
	return (IGDB_TAG_TYPE_IDS[type] << 28) | id;
}
