export interface RateLimiterOptions {
	/** Max concurrent requests. */
	concurrency: number;
	/** Min ms between requests. */
	intervalMs: number;
}

export const DEFAULT_RATE_LIMITER: RateLimiterOptions = {
	concurrency: 4,
	intervalMs: 250,
};

export class RateLimiter {
	readonly #options: RateLimiterOptions;
	#active = 0;
	#queue: Array<() => void> = [];
	#lastCall = 0;

	constructor(options: RateLimiterOptions = DEFAULT_RATE_LIMITER) {
		this.#options = options;
	}

	async acquire(): Promise<void> {
		return new Promise((resolve) => {
			const attempt = () => {
				if (this.#active >= this.#options.concurrency) {
					this.#queue.push(attempt);
					return;
				}
				const now = Date.now();
				const wait = Math.max(
					0,
					this.#lastCall + this.#options.intervalMs - now,
				);
				setTimeout(() => {
					this.#active++;
					this.#lastCall = Date.now();
					resolve();
				}, wait);
			};
			attempt();
		});
	}

	release(): void {
		this.#active--;
		const next = this.#queue.shift();
		if (next) next();
	}
}
