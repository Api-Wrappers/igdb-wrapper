export class IGDBError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "IGDBError";
	}
}

export class IGDBAuthError extends IGDBError {
	constructor(message: string) {
		super(message);
		this.name = "IGDBAuthError";
	}
}

export class IGDBRateLimitError extends IGDBError {
	readonly retryAfterMs: number;
	constructor(retryAfterMs: number) {
		super(`Rate limit exceeded. Retry after ${retryAfterMs}ms`);
		this.name = "IGDBRateLimitError";
		this.retryAfterMs = retryAfterMs;
	}
}

export class IGDBNotFoundError extends IGDBError {
	readonly endpoint: string;
	constructor(endpoint: string) {
		super(`No results found on endpoint: ${endpoint}`);
		this.name = "IGDBNotFoundError";
		this.endpoint = endpoint;
	}
}

export class IGDBValidationError extends IGDBError {
	constructor(message: string) {
		super(message);
		this.name = "IGDBValidationError";
	}
}
