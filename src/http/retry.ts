export interface RetryOptions {
	maxAttempts: number;
	baseDelayMs: number;
}

export const DEFAULT_RETRY: RetryOptions = {
	maxAttempts: 3,
	baseDelayMs: 300,
};

function sleep(ms: number): Promise<void> {
	return new Promise((r) => setTimeout(r, ms));
}

export async function withRetry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = DEFAULT_RETRY,
): Promise<T> {
	let lastError: unknown;

	for (let attempt = 0; attempt < options.maxAttempts; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
			const delay = options.baseDelayMs * 2 ** attempt;
			await sleep(delay);
		}
	}

	throw lastError;
}
