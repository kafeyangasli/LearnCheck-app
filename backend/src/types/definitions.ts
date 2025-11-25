export interface UserPreferences {
  theme: 'dark' | 'light';
  fontSize: 'small' | 'medium' | 'large';
  fontStyle: 'default' | 'serif' | 'mono';
  layoutWidth: 'fullWidth' | 'standard';
}

export interface UserPreference {
  difficulty?: string;
  language?: string;
  tone?: string;
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

export interface Question {
  question: string;
  options: string[];
  correctOptionId: number;
  explanation: string;
}

export interface Assessment {
  questions: QuizQuestion[];
  cachedAt?: string;
}

export interface AssessmentData {
  questions: Question[];
  generatedAt: string;
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
