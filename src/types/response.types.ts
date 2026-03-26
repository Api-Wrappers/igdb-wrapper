export interface IGDBErrorResponse {
	title: string;
	status: number;
	cause?: string;
}

export interface PaginatedResult<T> {
	data: T[];
	hasMore: boolean;
	nextOffset: number;
}
