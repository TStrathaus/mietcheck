// src/lib/toast.ts
import toast from 'react-hot-toast';

/**
 * Toast notification helpers for consistent user feedback
 */

// Success messages
export const showSuccess = (message: string) => {
  toast.success(message);
};

// Error messages
export const showError = (message: string) => {
  toast.error(message);
};

// Loading toast with promise
export const showLoading = (message: string) => {
  return toast.loading(message);
};

// Dismiss a specific toast
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// Promise-based toast (shows loading, then success/error)
export const showPromise = <T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string | ((err: Error) => string);
  }
) => {
  return toast.promise(promise, messages);
};

// Predefined messages for common scenarios
export const toastMessages = {
  // Upload
  uploadStart: 'Dokument wird hochgeladen...',
  uploadSuccess: 'Dokument erfolgreich hochgeladen',
  uploadError: 'Fehler beim Hochladen. Bitte erneut versuchen.',
  uploadTooLarge: 'Datei ist zu gross. Maximum: 10 MB',
  uploadInvalidType: 'Ungültiges Dateiformat. Erlaubt: PDF, JPG, PNG',

  // Analysis
  analysisStart: 'Vertrag wird analysiert...',
  analysisSuccess: 'Analyse abgeschlossen',
  analysisError: 'Analyse fehlgeschlagen. Bitte erneut versuchen.',
  analysisTimeout: 'Analyse dauert zu lange. Bitte erneut versuchen.',

  // PDF Generation
  generateStart: 'PDF wird erstellt...',
  generateSuccess: 'PDF erfolgreich erstellt',
  generateError: 'PDF-Erstellung fehlgeschlagen',

  // Payment
  paymentStart: 'Weiterleitung zur Zahlung...',
  paymentSuccess: 'Zahlung erfolgreich',
  paymentError: 'Zahlung fehlgeschlagen',
  paymentCanceled: 'Zahlung abgebrochen',

  // Network
  networkError: 'Netzwerkfehler. Bitte Internetverbindung prüfen.',
  serverError: 'Serverfehler. Bitte später erneut versuchen.',

  // Validation
  validationError: 'Bitte alle Pflichtfelder ausfüllen',
  invalidData: 'Die eingegebenen Daten sind ungültig',

  // Generic
  genericError: 'Ein Fehler ist aufgetreten. Bitte erneut versuchen.',
  genericSuccess: 'Erfolgreich gespeichert',
};

// Helper function to get user-friendly error message
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return toastMessages.networkError;
    }
    if (error.message.includes('timeout')) {
      return toastMessages.analysisTimeout;
    }
    if (error.message.includes('500') || error.message.includes('server')) {
      return toastMessages.serverError;
    }
    // Return the error message if it's user-friendly
    if (error.message.length < 100 && !error.message.includes('Error:')) {
      return error.message;
    }
  }
  return toastMessages.genericError;
}

// Retry helper with toast feedback
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    onRetry?: (attempt: number) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        onRetry?.(attempt);
        toast.loading(`Versuch ${attempt + 1} von ${maxRetries}...`, {
          duration: delay,
        });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
