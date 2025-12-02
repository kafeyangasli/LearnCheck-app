export interface UserPreferences {
  theme: "dark" | "light";
  fontSize: "small" | "medium" | "large";
  fontStyle: "default" | "serif" | "mono";
  layoutWidth: "fullWidth" | "standard";
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

export interface AssessmentJobData {
  tutorialId: string;
  userId: string;
  skipCache: boolean;
}

export type JobStatus = "pending" | "processing" | "completed" | "failed";

export interface JobResultBase {
  status: JobStatus;
}

export interface JobResultPending extends JobResultBase {
  status: "pending" | "processing";
  message: string;
  jobId: string;
}

export interface JobResultCompleted extends JobResultBase {
  status: "completed";
  data: AssessmentResponse;
  completedAt: string;
}

export interface JobResultFailed extends JobResultBase {
  status: "failed";
  error: string;
  failedAt: string;
}

export type JobResult = JobResultPending | JobResultCompleted | JobResultFailed;

export interface AcceptedResponse {
  status: "accepted";
  message: string;
  jobId: string;
  tutorialId: string;
  userId: string;
}
