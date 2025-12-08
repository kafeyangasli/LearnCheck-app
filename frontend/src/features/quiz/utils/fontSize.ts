import type { UserPreferences } from "../../../types";

export type FontSizePref = UserPreferences["fontSize"];

// Untuk teks paragraf utama (yang sebelumnya `text-base md:text-lg`)
export const bodyTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-sm md:text-base",
  medium: "text-base md:text-lg",
  large: "text-lg md:text-xl",
};

// Untuk teks kecil (yang sebelumnya `text-sm`)
export const smallTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-xs md:text-sm",
  medium: "text-sm md:text-base",
  large: "text-base md:text-lg",
};

// Untuk teks tombol (yang sebelumnya `text-base`)
export const buttonTextClassByFontSize: Record<FontSizePref, string> = {
  small: "text-sm",
  medium: "text-base",
  large: "text-lg",
};
