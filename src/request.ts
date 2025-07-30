import type {
	IGDBClientOptions,
	IGDBRequestOptions,
	IGDBResponse,
} from "@/@types";
import type { IGDBTokenManager } from "@/token-manager";
import { CONSTANTS } from "@/utils";

export class IGDBRequestHandler {
	constructor(
		private readonly tokenManager: IGDBTokenManager,
		private readonly options: IGDBClientOptions,
	) {}

	/**
	 * Make an authenticated request to the IGDB API
	 */
	async request(requestOptions: IGDBRequestOptions): Promise<Response> {
		const { endpoint, body, method = "POST", headers = {} } = requestOptions;

		// Get a valid token
		const token = await this.tokenManager.getValidToken();

		// Prepare the full URL
		const url = `${CONSTANTS.IGDB_API_URL}/${endpoint}`;

		// Prepare headers with authentication
		const requestHeaders = {
			"Client-ID": this.options.clientId,
			Authorization: `Bearer ${token}`,
			Accept: "application/json",
			...headers,
		};

		// Debug logging
		console.log(`🔍 Making request to: ${url}`);
		console.log(`🔍 Method: ${method}`);
		console.log(`🔍 Request body: ${body || "(no body)"}`);

		// Make the request
		const response = await fetch(url, {
			method,
			headers: requestHeaders,
			body: body || undefined,
		});

		if (!response.ok) {
			// Get error details from response
			let errorDetails = "";
			try {
				const errorText = await response.text();
				errorDetails = errorText ? ` - ${errorText}` : "";
			} catch {
				// If we can't read the error text, that's fine
			}

			throw new Error(
				`IGDB API request failed: ${response.status} ${response.statusText}${errorDetails}`,
			);
		}

		return response;
	}

	/**
	 * Make an authenticated POST request with a query body
	 */
	async post<T = unknown>(
		endpoint: string,
		query: string,
	): Promise<IGDBResponse<T>> {
		const response = await this.request({
			endpoint,
			method: "POST",
			body: query,
		});

		return response.json() as Promise<IGDBResponse<T>>;
	}

	/**
	 * Make an authenticated GET request (for endpoints that support it)
	 */
	async get<T = unknown>(
		endpoint: string,
		params?: Record<string, string>,
	): Promise<IGDBResponse<T>> {
		let finalEndpoint = endpoint;

		if (params) {
			const searchParams = new URLSearchParams(params);
			finalEndpoint = `${endpoint}?${searchParams.toString()}`;
		}

		const response = await this.request({
			endpoint: finalEndpoint,
			method: "GET",
		});

		return response.json() as Promise<IGDBResponse<T>>;
	}
}
