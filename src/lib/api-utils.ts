// src/lib/api-utils.ts
// API utilities with retry logic and error handling

import toast from 'react-hot-toast';

interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
}

interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Fetch with automatic retry for transient failures
 */
export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { retries = 2, retryDelay = 1000, ...fetchOptions } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response;
      }

      // Retry server errors (5xx)
      if (response.status >= 500 && attempt < retries) {
        console.warn(`Server error ${response.status}, retrying... (${attempt + 1}/${retries})`);
        await sleep(retryDelay * (attempt + 1)); // Exponential backoff
        continue;
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Network errors - retry
      if (attempt < retries) {
        console.warn(`Network error, retrying... (${attempt + 1}/${retries}):`, error);
        await sleep(retryDelay * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError || new Error('Request failed after retries');
}

/**
 * Parse API error response into user-friendly message
 */
export function parseApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return {
        message: 'Netzwerkfehler. Bitte prüfen Sie Ihre Internetverbindung.',
        code: 'NETWORK_ERROR',
      };
    }

    // Timeout
    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return {
        message: 'Die Anfrage hat zu lange gedauert. Bitte versuchen Sie es erneut.',
        code: 'TIMEOUT',
      };
    }

    return {
      message: error.message,
    };
  }

  return {
    message: 'Ein unbekannter Fehler ist aufgetreten.',
    code: 'UNKNOWN',
  };
}

/**
 * User-friendly error messages for common API errors
 */
export function getErrorMessage(status: number, serverMessage?: string): string {
  switch (status) {
    case 400:
      return serverMessage || 'Ungültige Anfrage. Bitte prüfen Sie Ihre Eingaben.';
    case 401:
      return 'Nicht autorisiert. Bitte melden Sie sich an.';
    case 403:
      return 'Zugriff verweigert.';
    case 404:
      return 'Nicht gefunden.';
    case 413:
      return 'Die Datei ist zu gross. Maximum: 10 MB.';
    case 429:
      return 'Zu viele Anfragen. Bitte warten Sie einen Moment.';
    case 500:
      return 'Serverfehler. Bitte versuchen Sie es später erneut.';
    case 502:
    case 503:
    case 504:
      return 'Service vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.';
    default:
      return serverMessage || 'Ein Fehler ist aufgetreten.';
  }
}

/**
 * File validation helpers
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const { maxSize = 10 * 1024 * 1024, allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'] } = options;

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `Die Datei ist zu gross (${fileSizeMB} MB). Maximum: ${maxSizeMB} MB.`,
    };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Nur PDF, JPG und PNG Dateien werden unterstützt.',
    };
  }

  // Check for empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Die Datei ist leer.',
    };
  }

  return { valid: true };
}

/**
 * Show toast notification based on error type
 */
export function showErrorToast(error: unknown, customMessage?: string) {
  const parsedError = parseApiError(error);
  toast.error(customMessage || parsedError.message);
}

/**
 * Show success toast
 */
export function showSuccessToast(message: string) {
  toast.success(message);
}

/**
 * Show loading toast that can be dismissed
 */
export function showLoadingToast(message: string): string {
  return toast.loading(message);
}

/**
 * Dismiss a specific toast
 */
export function dismissToast(toastId: string) {
  toast.dismiss(toastId);
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Gemini-specific error handling
 */
export function parseGeminiError(error: string): string {
  if (error.includes('429') || error.includes('RESOURCE_EXHAUSTED')) {
    return 'Der KI-Service ist überlastet. Bitte versuchen Sie es in einer Minute erneut.';
  }
  if (error.includes('503') || error.includes('UNAVAILABLE')) {
    return 'Der KI-Service ist vorübergehend nicht verfügbar. Bitte versuchen Sie es später erneut.';
  }
  if (error.includes('400') || error.includes('INVALID_ARGUMENT')) {
    return 'Die Datei konnte nicht verarbeitet werden. Bitte versuchen Sie es mit einer anderen Datei.';
  }
  return error;
}
