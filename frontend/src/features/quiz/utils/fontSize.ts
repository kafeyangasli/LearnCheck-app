import type { UserPreferences } from "../../../types";

export type FontSizePref = UserPreferences["fontSize"];

export const bodyTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-sm md:text-base",
  medium: "text-base md:text-lg",
  large: "text-lg md:text-xl",
};

export const smallTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-xs md:text-sm",
  medium: "text-sm md:text-base",
  large: "text-base md:text-lg",
};

export const buttonTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};
