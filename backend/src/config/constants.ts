export const API_CONFIG = {
  DICODING_BASE_URL: 'https://learncheck-dicoding-mock-666748076441.europe-west1.run.app/api',
  GEMINI_MODEL: 'gemini-2.0-flash-exp',
  REQUEST_TIMEOUT: 30000,
} as const;

export const ERROR_MESSAGES = {
  INVALID_TUTORIAL_ID: 'Missing or invalid tutorial_id',
  INVALID_USER_ID: 'Missing or invalid user_id',
  GEMINI_GENERATION_FAILED: 'Failed to generate assessment questions.',
  EMPTY_GEMINI_RESPONSE: 'Empty response from Gemini API',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  ACCEPTED: 202,
  BAD_REQUEST: 400,
  INTERNAL_SERVER_ERROR: 500,
} as const;
