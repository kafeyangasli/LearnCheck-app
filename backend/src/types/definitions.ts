/**
 * Shared type definitions for the backend
 */

export interface UserPreferences {
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
  fontStyle: 'default' | 'serif' | 'mono';
  layoutWidth: 'fullWidth' | 'standard';
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface Assessment {
  questions: QuizQuestion[];
  cachedAt?: string;
}

export interface AssessmentResponse {
  assessment: Assessment;
  userPreferences: UserPreferences;
  fromCache: boolean;
}

export interface PreferencesResponse {
  userPreferences: UserPreferences;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
