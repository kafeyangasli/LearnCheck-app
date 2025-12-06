export interface IframeParams {
  tutorial_id: string;
  user_id: string;
}

export interface UserPreferences {
  layoutWidth: "fullWidth" | "mediumWidth";
  fontStyle: "default" | "serif" | "open-dyslexic";
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
}
