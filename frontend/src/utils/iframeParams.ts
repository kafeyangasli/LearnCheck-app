import type { IframeParams } from "../types";

export const getIframeParams = (): IframeParams | null => {
  const sanitizeParam = (value: string | null): string | null => {
    if (!value) return null;

    let sanitized = value.trim();

    sanitized = sanitized.split(/[\s+]/)[0];

    try {
      sanitized = decodeURIComponent(sanitized);
    } catch (e) {
    }

    sanitized = sanitized.replace(/[^a-zA-Z0-9_\-\.]/g, "");

    return sanitized || null;
  };

  const searchParams = new URLSearchParams(window.location.search);
  const tutorialId = sanitizeParam(searchParams.get("tutorial_id"));
  const userId = sanitizeParam(searchParams.get("user_id"));

  if (tutorialId && userId) {
    return {
      tutorial_id: tutorialId,
      user_id: userId,
    };
  }

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

  if (import.meta.env.DEV) {
    return {
      tutorial_id: "dev-tutorial-123",
      user_id: "dev-user-456",
    };
  }

  return null;
};

export const generateIframeCode = (baseUrl: string): string => {
  return `<iframe src="${baseUrl}?tutorial_id={tutorial_id}&user_id={user_id}" width="100%" height="600"></iframe>`;
};

export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
};
