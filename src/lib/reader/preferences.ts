export const READING_KEY = "novel-reading-v1";
export const FONT_SIZES = [18, 20, 22, 24] as const;
export type ReadingPreferences = { fontSize: typeof FONT_SIZES[number]; theme: "light" | "dark" };
export const DEFAULT_READING: ReadingPreferences = { fontSize: 20, theme: "light" };

export function parseReadingPreferences(value: string | null): ReadingPreferences {
  try {
    const data: unknown = JSON.parse(value ?? "null");
    if (!data || typeof data !== "object") return DEFAULT_READING;
    const { fontSize, theme } = data as Record<string, unknown>;
    return {
      fontSize: FONT_SIZES.includes(fontSize as ReadingPreferences["fontSize"]) ? fontSize as ReadingPreferences["fontSize"] : 20,
      theme: theme === "dark" ? "dark" : "light",
    };
  } catch { return DEFAULT_READING; }
}
