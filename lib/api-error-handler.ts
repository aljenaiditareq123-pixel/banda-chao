/**
 * Enhanced API Error Handling Utilities
 * Provides consistent error handling across all API calls
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class ApiErrorHandler {
  /**
   * Handles fetch response errors consistently
   */
  static async handleResponse(response: Response): Promise<any> {
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails: any = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        errorDetails = errorData.details || errorData;
      } catch (parseError) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }

      const apiError: ApiError = {
        message: errorMessage,
        status: response.status,
        details: errorDetails,
      };

      // Log error for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('[API Error]', {
          url: response.url,
          status: response.status,
          message: errorMessage,
          details: errorDetails,
        });
      }

      throw apiError;
    }

    try {
      return await response.json();
    } catch (parseError) {
      // If response is not JSON, return empty object
      return {};
    }
  }

  /**
   * Handles network and other fetch errors
   */
  static handleNetworkError(error: any, url?: string): ApiError {
    let message = 'Network error occurred';
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.message) {
      message = error.message;
    }

    const apiError: ApiError = {
      message,
      code: 'NETWORK_ERROR',
      details: error,
    };

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('[Network Error]', {
        url,
        message,
        originalError: error,
      });
    }

    return apiError;
  }

  /**
   * Enhanced fetch with automatic error handling and retries
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<any> {
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        return await this.handleResponse(response);
      } catch (error: any) {
        if (error.status && error.status < 500) {
          // Don't retry client errors (4xx)
          throw error;
        }

        lastError = error.status 
          ? error 
          : this.handleNetworkError(error, url);

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          console.log(`[API] Retrying request to ${url} (attempt ${attempt + 2}/${maxRetries + 1})`);
        }
      }
    }

    throw lastError;
  }

  /**
   * Formats error message for user display
   */
  static formatUserMessage(error: ApiError): string {
    // Map common error codes to user-friendly messages
    const userMessages: Record<string, string> = {
      'NETWORK_ERROR': 'فشل في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.',
      'UNAUTHORIZED': 'يرجى تسجيل الدخول للمتابعة.',
      'FORBIDDEN': 'ليس لديك صلاحية للوصول إلى هذا المحتوى.',
      'NOT_FOUND': 'المحتوى المطلوب غير موجود.',
      'VALIDATION_ERROR': 'يرجى التحقق من البيانات المدخلة.',
      'SERVER_ERROR': 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.',
    };

    // Check for specific status codes
    if (error.status) {
      switch (error.status) {
        case 401:
          return userMessages.UNAUTHORIZED;
        case 403:
          return userMessages.FORBIDDEN;
        case 404:
          return userMessages.NOT_FOUND;
        case 422:
          return userMessages.VALIDATION_ERROR;
        case 500:
        case 502:
        case 503:
        case 504:
          return userMessages.SERVER_ERROR;
      }
    }

    // Check for specific error codes
    if (error.code && userMessages[error.code]) {
      return userMessages[error.code];
    }

    // Return original message if it's user-friendly, otherwise generic message
    if (error.message && error.message.length < 100 && !error.message.includes('fetch')) {
      return error.message;
    }

    return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
  }
}

/**
 * Convenience function for making API calls with error handling
 */
export async function apiCall(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<any> {
  return ApiErrorHandler.fetchWithRetry(url, options, maxRetries);
}

/**
 * Convenience function for handling API errors in components
 */
export function handleApiError(error: any): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return ApiErrorHandler.formatUserMessage(error as ApiError);
  }
  
  return ApiErrorHandler.formatUserMessage({
    message: error?.toString() || 'Unknown error',
    code: 'UNKNOWN_ERROR',
  });
}
