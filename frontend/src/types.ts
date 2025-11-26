
export interface UserPreferences {
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
    layoutWidth: 'standard' | 'fullWidth';
    fontStyle: 'default' | 'serif' | 'mono';
}
  
export interface Option {
    id: string;
    text: string;
}

export interface Question {
    id: string;
    questionText: string;
    options: Option[];
    correctOptionId: string;
    explanation: string;
}
  
export interface AssessmentData {
    assessment: {
      questions: Question[];
    };
    userPreferences: UserPreferences;
}
