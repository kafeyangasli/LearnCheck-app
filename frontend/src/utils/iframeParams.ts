import type { IframeParams } from "../types";

/**
 * Extract tutorial_id and user_id from URL parameters
 * Supports both query params and hash params for iframe compatibility
 */
export const getIframeParams = (): IframeParams | null => {
  // Helper function to sanitize parameter values
  const sanitizeParam = (value: string | null): string | null => {
    if (!value) return null;

    // Trim whitespace
    let sanitized = value.trim();

    // Remove any trailing HTML/iframe attributes that might have leaked in
    // e.g., "123 width=" or "123+width%3D"
    sanitized = sanitized.split(/[\s+]/)[0];

    // Decode any URL encoding
    try {
      sanitized = decodeURIComponent(sanitized);
    } catch (e) {
      // If decoding fails, use original
    }

    // Remove any non-alphanumeric characters except underscore, dash, and period
    sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.]/g, "");

    return sanitized || null;
  };

  // Try URL search params first (?tutorial_id=123&user_id=456)
  const searchParams = new URLSearchParams(window.location.search);
  const tutorialId = sanitizeParam(searchParams.get("tutorial_id"));
  const userId = sanitizeParam(searchParams.get("user_id"));

  if (tutorialId && userId) {
    return {
      tutorial_id: tutorialId,
      user_id: userId,
    };
  }

  // Try hash params (#tutorial_id=123&user_id=456)
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  const hashTutorialId = sanitizeParam(hashParams.get("tutorial_id"));
  const hashUserId = sanitizeParam(hashParams.get("user_id"));

  if (hashTutorialId && hashUserId) {
    return {
      tutorial_id: hashTutorialId,
      user_id: hashUserId,
    };
  }

  // Development mode: provide default values if no params found
  if (import.meta.env.DEV) {
    console.warn(
      "No URL parameters found. Using development defaults. Add ?tutorial_id=X&user_id=Y to URL for real data.",
    );
    return {
      tutorial_id: "dev-tutorial-123",
      user_id: "dev-user-456",
    };
  }

  return null;
};

/**
 * Generate iframe embed code
 */
export const generateIframeCode = (baseUrl: string): string => {
  return `<iframe src="${baseUrl}?tutorial_id={tutorial_id}&user_id={user_id}" width="100%" height="600"></iframe>`;
};

/**
 * Check if running inside iframe
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
