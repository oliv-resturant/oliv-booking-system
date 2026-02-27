/**
 * Base API client with fetch wrapper for the restaurant admin UI.
 * Provides structured error handling and supports custom headers.
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

/**
 * Custom API Error class that includes HTTP status and response data.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic API request wrapper using fetch.
 * Handles JSON serialization, error responses, and custom headers.
 *
 * @param endpoint - API endpoint path (e.g., '/kitchen-pdf/send')
 * @param options - RequestInit options for fetch
 * @returns Promise<T> - Parsed JSON response
 * @throws ApiError - On non-OK responses
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }

    throw new ApiError(
      response.status,
      errorData,
      `API request failed: ${response.statusText}`
    );
  }

  return response.json();
}

/**
 * Utility to create an AbortController with timeout.
 * Useful for request timeout handling.
 *
 * @param ms - Timeout in milliseconds
 * @returns AbortController
 */
export function createTimeoutController(ms: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller;
}
