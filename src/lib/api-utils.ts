/**
 * Centralized utilities for API requests
 * This file contains shared functions for making API requests
 */
import { isBrowser, isNetlify, createRequestTimeout, setAirtableConnectionIssue } from './airtable-utils';

/**
 * Generic fetch wrapper with error handling and timeout
 * @param url The URL to fetch from
 * @param options Request options
 * @param mockData Mock data to use as fallback
 * @returns The fetched data or mock data
 */
export async function fetchWithFallback<T>(
  url: string,
  options?: RequestInit,
  mockData?: T,
  timeoutMs: number = 15000
): Promise<T> {
  try {
    // Create a timeout controller
    const { signal, cleanup } = createRequestTimeout(timeoutMs);

    // Add the signal to the options
    const fetchOptions: RequestInit = {
      ...options,
      signal,
      // Add cache control to prevent caching issues
      cache: 'no-cache',
      // Add credentials to include cookies
      credentials: 'same-origin'
    };

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('Not in browser environment, using mock data');
      if (mockData) {
        return mockData as T;
      }
      throw new Error('Mock data not available in non-browser environment');
    }

    // Execute the fetch with retry logic
    let retries = 2;
    let lastError: any = null;

    while (retries >= 0) {
      try {
        console.log(`Fetching ${url}${retries < 2 ? ` (retry ${2 - retries})` : ''}`);
        const response = await fetch(url, fetchOptions);

        // Clean up the timeout
        cleanup();

        if (!response.ok) {
          // Try to get more detailed error information
          try {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(`API request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
          } catch (parseError) {
            // If we can't parse the error response, just throw the status
            throw new Error(`API request failed with status ${response.status}`);
          }
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error;

        // If it's a network error or 5xx error, retry
        const isNetworkError = error instanceof TypeError && error.message === 'Failed to fetch';
        const isServerError = error instanceof Error && error.message.includes('status 5');

        if ((isNetworkError || isServerError) && retries > 0) {
          console.warn(`Fetch error, retrying (${retries} retries left):`, error);
          retries--;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (2 - retries)));
          continue;
        }

        // If it's not a retryable error or we're out of retries, break the loop
        break;
      }
    }

    // If we get here, all retries failed
    console.error(`All fetch attempts failed for ${url}:`, lastError);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      setAirtableConnectionIssue();

      // Store the error in localStorage for debugging
      try {
        localStorage.setItem('last-fetch-error', JSON.stringify({
          url,
          error: lastError?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    // If fetch fails and we have mock data, use it as fallback
    if (mockData) {
      console.log(`Falling back to mock data for: ${url}`);
      return mockData as T;
    }

    // If it's an AbortError, provide a more helpful error message
    if (lastError instanceof DOMException && lastError.name === 'AbortError') {
      throw new Error(`Request to ${url} was aborted: ${lastError.message || 'Request timed out or was cancelled'}`);
    }

    // For network errors, provide a more helpful message
    if (lastError instanceof TypeError && lastError.message === 'Failed to fetch') {
      throw new Error(`Network error when fetching ${url}. Please check your internet connection.`);
    }

    throw lastError;
  } catch (error) {
    // This catch block handles errors from the retry logic
    console.error(`Error in fetchWithFallback for ${url}:`, error);

    // If fetch fails and we have mock data, use it as fallback
    if (mockData) {
      console.log(`Falling back to mock data for: ${url} due to error:`, error);
      return mockData as T;
    }

    throw error;
  }
}

/**
 * Get the appropriate API URL based on environment
 * @param endpoint The API endpoint
 * @param isNetlifyDeployment Whether we're on Netlify (deprecated, always use Next.js API routes on Vercel)
 * @returns The full API URL
 */
export function getApiUrl(endpoint: string, isNetlifyDeployment: boolean = false): string {
  // Always use Next.js API routes for Vercel deployment
  // This ensures consistent behavior across environments
  return `/api/${endpoint}`;
}

/**
 * Get user information from localStorage
 * @returns The current user or null
 */
export function getCurrentUser() {
  if (!isBrowser) return null;

  try {
    return JSON.parse(localStorage.getItem('scalerrs-user') || 'null');
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
}

/**
 * Prepare headers with user information
 * @param currentUser The current user
 * @returns Headers with user information
 */
export function prepareUserHeaders(currentUser: any = getCurrentUser()): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  };

  // Add user information to headers if available
  if (currentUser) {
    headers['x-user-id'] = currentUser.id;
    headers['x-user-role'] = currentUser.Role;

    // Convert client array to JSON string
    if (currentUser.Client) {
      // Ensure Client is an array
      const clientIds = Array.isArray(currentUser.Client) ? currentUser.Client : [currentUser.Client];
      headers['x-user-client'] = JSON.stringify(clientIds);
    } else {
      headers['x-user-client'] = JSON.stringify([]);
    }
  }

  return headers;
}

/**
 * Generic function to handle direct Airtable access in development
 * @param developmentFn Function to call in development
 * @param productionFn Function to call in production
 * @param mockFn Function to call for mock data
 * @returns The result of the appropriate function
 */
export async function handleEnvironmentSpecificApi<T>(
  developmentFn: () => Promise<T>,
  productionFn: () => Promise<T>,
  mockFn: () => T
): Promise<T> {
  // Check if we should use mock data
  if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
    console.log('Using mock data (explicitly enabled)');
    return mockFn();
  }

  try {
    // In development, use direct Airtable access
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Using direct Airtable access');
      return await developmentFn();
    }

    // In production, use the API routes
    console.log('Production mode: Using API routes');
    return await productionFn();
  } catch (error) {
    console.error('API error:', error);

    // Set a flag in localStorage to indicate Airtable connection issues
    if (isBrowser) {
      setAirtableConnectionIssue();
    }

    // Fall back to mock data
    console.log('Falling back to mock data due to error');
    return mockFn();
  }
}
