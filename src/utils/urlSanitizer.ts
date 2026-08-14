/**
 * DataBeta Authentication & URL Security Utility
 * Ensures tokens are never leaked into browser history, URLs, logs, or UI state.
 */

const SENSITIVE_PARAM_KEYS = [
  'access_token',
  'refresh_token',
  'provider_token',
  'code',
  'token_type',
  'expires_in',
  'expires_at',
  'id_token',
  'error_description',
];

/**
 * Returns the canonical OAuth callback URL based on environment.
 */
export function getOAuthCallbackUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:5173/auth/callback';
  }

  const origin = window.location.origin;
  // If hosted on production or staging
  if (origin.includes('databeta.vercel.app')) {
    return 'https://databeta.vercel.app/auth/callback';
  }

  return `${origin}/auth/callback`;
}

/**
 * Immediately scrubs all OAuth tokens, authorization codes, and fragments from the URL.
 * Replaces the browser history state so back/forward navigation does not re-expose credentials.
 */
export function cleanAuthTokensFromUrl(targetPath: string = '/dashboard.html'): void {
  if (typeof window === 'undefined') return;

  try {
    const url = new URL(window.location.href);
    let modified = false;

    // Check query params
    for (const key of SENSITIVE_PARAM_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        modified = true;
      }
    }

    // Check hash fragments (#access_token=... or #error=...)
    if (url.hash) {
      for (const key of SENSITIVE_PARAM_KEYS) {
        if (url.hash.includes(key)) {
          url.hash = '';
          modified = true;
          break;
        }
      }
    }

    if (modified) {
      const cleanUrl = targetPath || url.pathname || '/dashboard.html';
      window.history.replaceState({}, document.title, cleanUrl);
    }
  } catch (err) {
    // Fallback safe replace
    try {
      window.history.replaceState({}, document.title, targetPath);
    } catch {}
  }
}

/**
 * Generates an opaque diagnostic reference ID for error screens.
 * Ex: "REF-AUTH-9E3B"
 */
export function generateSupportReferenceId(): string {
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  const time = Date.now().toString(36).slice(-2).toUpperCase();
  return `REF-AUTH-${rand}${time}`;
}

/**
 * Strips secret tokens and passwords from error messages before logging or rendering.
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'An unexpected authentication error occurred.';
  const message = typeof error === 'string' ? error : error?.message || String(error);

  // Redact any token-like or secret-like strings (32+ character hex or base64)
  return message
    .replace(/[a-zA-Z0-9_-]{32,}/g, '[REDACTED_CREDENTIAL]')
    .replace(/access_token=[^&]+/gi, 'access_token=[REDACTED]')
    .replace(/refresh_token=[^&]+/gi, 'refresh_token=[REDACTED]');
}
