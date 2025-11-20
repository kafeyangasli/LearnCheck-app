import type { IframeParams } from '../types';

/**
 * Extract tutorial_id and user_id from URL parameters
 * Supports both query params and hash params for iframe compatibility
 */
export const getIframeParams = (): IframeParams | null => {
  // Try URL search params first (?tutorial_id=123&user_id=456)
  const searchParams = new URLSearchParams(window.location.search);
  const tutorialId = searchParams.get('tutorial_id');
  const userId = searchParams.get('user_id');

  if (tutorialId && userId) {
    return {
      tutorial_id: tutorialId,
      user_id: userId,
    };
  }

  // Try hash params (#tutorial_id=123&user_id=456)
  const hash = window.location.hash.substring(1);
  const hashParams = new URLSearchParams(hash);
  const hashTutorialId = hashParams.get('tutorial_id');
  const hashUserId = hashParams.get('user_id');

  if (hashTutorialId && hashUserId) {
    return {
      tutorial_id: hashTutorialId,
      user_id: hashUserId,
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
