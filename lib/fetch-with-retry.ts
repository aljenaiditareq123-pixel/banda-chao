/**
 * Fetch with retry logic for 429 (Too Many Requests) errors
 * Handles Render Free tier rate limiting by retrying with exponential backoff
 */

interface FetchWithRetryOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  retryOnStatus?: number[];
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
    retryOnStatus = [429, 503, 504], // Rate limit and service unavailable
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;
  let currentDelay = retryDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // If successful or not a retryable status, return immediately
      if (response.ok || !retryOnStatus.includes(response.status)) {
        return response;
      }

      // If it's the last attempt, return the error response
      if (attempt === maxRetries) {
        return response;
      }

      // Log retry attempt (only in development or when logging is enabled)
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} failed with status ${response.status}. Retrying in ${currentDelay}ms...`
        );
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= 2; // Exponential backoff: 1s, 2s, 4s, etc.

      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error: any) {
      lastError = error;

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Network errors: wait and retry
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[fetchWithRetry] Attempt ${attempt + 1}/${maxRetries + 1} failed with network error. Retrying in ${currentDelay}ms...`
        );
      }

      await new Promise((resolve) => setTimeout(resolve, currentDelay));
      currentDelay *= 2;
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

  // Handle 429 specifically
  if (response.status === 429) {
    const text = await response.text().catch(() => 'Too Many Requests');
    
    // If response is HTML (Render rate limit page), return empty data structure
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.warn(`[fetchJsonWithRetry] Got HTML response for 429. Returning empty data.`);
      return { data: [], error: 'Rate limited by Render Free tier' };
    }

    // Try to parse as JSON if it's not HTML
    try {
      return JSON.parse(text);
    } catch {
      return { data: [], error: 'Rate limited by Render Free tier' };
    }
  }

  // Handle other non-OK responses
  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    
    // If response is HTML, return empty data structure
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      console.warn(`[fetchJsonWithRetry] Got HTML response for ${response.status}. Returning empty data.`);
      return { data: [], error: `HTTP ${response.status}: ${response.statusText}` };
    }

    // Try to parse as JSON if it's not HTML
    try {
      return JSON.parse(text);
    } catch {
      return { data: [], error: text || `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  // Parse JSON for successful responses
  try {
    return await response.json();
  } catch (error) {
    console.error('[fetchJsonWithRetry] Failed to parse JSON:', error);
    return { data: [], error: 'Invalid JSON response' };
  }
}

