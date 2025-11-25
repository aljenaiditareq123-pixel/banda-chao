/**
 * Fetch with retry logic for 429 (Too Many Requests) errors
 * Also handles 503 (Service Unavailable) and 504 (Gateway Timeout)
 */

interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  retryOn?: number[]; // HTTP status codes to retry on
}

/**
 * Fetches a resource with retry logic for rate limiting errors
 * @param url - The URL to fetch
 * @param options - Fetch options including retry configuration
 * @returns Promise<Response>
 */
export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<Response> {
  const {
    maxRetries = 3,
    retryDelay = 1000, // Start with 1 second
    retryOn = [429, 503, 504], // Default retry on these status codes
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If successful or not a retryable error, return immediately
      if (response.ok || !retryOn.includes(response.status)) {
        return response;
      }

      // If it's the last attempt, return the error response
      if (attempt === maxRetries) {
        return response;
      }

      // Calculate exponential backoff delay
      const currentDelay = retryDelay * Math.pow(2, attempt);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} failed with status ${response.status}. Retrying in ${currentDelay}ms...`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const currentDelay = retryDelay * Math.pow(2, attempt);

      // Log retry attempt (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} failed with network error. Retrying in ${currentDelay}ms...`
        );
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Failed to fetch after retries');
}

/**
 * Fetches JSON with retry logic for rate limiting errors
 * @param url - The URL to fetch
 * @param options - Fetch options including retry configuration
 * @returns Promise<any> - Parsed JSON response
 */
export async function fetchJsonWithRetry(
  url: string,
  options: FetchWithRetryOptions = {}
): Promise<any> {
  const response = await fetchWithRetry(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 429 with HTML response (common on Render)
  if (response.status === 429) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[fetchJsonWithRetry] Got HTML response for 429. Returning empty data.`);
      }
      return { data: [], products: [], makers: [], videos: [] };
    }
  }

  // Handle other HTML responses
  if (!response.ok) {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[fetchJsonWithRetry] Got HTML response for ${response.status}. Returning empty data.`);
      }
      return { data: [], products: [], makers: [], videos: [] };
    }
  }

  // Try to parse as JSON
  try {
    const text = await response.text();
    
    // Check if response is HTML (common error on Render)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`[fetchJsonWithRetry] Got HTML response instead of JSON for ${url}. Returning empty data.`);
      }
      return { data: [], products: [], makers: [], videos: [] };
    }

    // Try to parse JSON
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // Check content-type header as fallback
      const contentType = response.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[fetchJsonWithRetry] Content-Type is "${contentType}", not JSON. Attempting to parse anyway.`);
        }
      }
      throw parseError;
    }
  } catch (error) {
    console.error('[fetchJsonWithRetry] Failed to parse JSON response:', error);
    throw new Error(`Failed to parse JSON response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

