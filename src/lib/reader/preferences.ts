export const READING_KEY = "novel-reading-v1";
export const FONT_SIZES = [18, 20, 22, 24] as const;
export const LINE_HEIGHTS = [1.5, 1.7, 1.9, 2.1, 2.3] as const;
export const PARAGRAPH_GAPS = [0.5, 0.8, 1.2, 1.6] as const;
export const READING_WIDTHS = { narrow: 600, standard: 720, wide: 900 } as const;
export type ReadingPreferences = { fontSize: typeof FONT_SIZES[number]; theme: "light" | "dark"; font: "dejavu" | "times"; lineHeight: typeof LINE_HEIGHTS[number]; paragraphGap: typeof PARAGRAPH_GAPS[number]; width: keyof typeof READING_WIDTHS };
export const DEFAULT_READING: ReadingPreferences = { fontSize: 20, theme: "light", font: "dejavu", lineHeight: 1.9, paragraphGap: 0.8, width: "standard" };

export function parseReadingPreferences(value: string | null): ReadingPreferences {
  try {
    const data: unknown = JSON.parse(value ?? "null");
    if (!data || typeof data !== "object") return DEFAULT_READING;
    const { fontSize, theme, font, lineHeight, paragraphGap, width } = data as Record<string, unknown>;
    return {
      fontSize: FONT_SIZES.includes(fontSize as ReadingPreferences["fontSize"]) ? fontSize as ReadingPreferences["fontSize"] : 20,
      theme: theme === "dark" ? "dark" : "light",
      font: font === "times" ? "times" : "dejavu",
      lineHeight: LINE_HEIGHTS.includes(lineHeight as ReadingPreferences["lineHeight"]) ? lineHeight as ReadingPreferences["lineHeight"] : 1.9,
      paragraphGap: PARAGRAPH_GAPS.includes(paragraphGap as ReadingPreferences["paragraphGap"]) ? paragraphGap as ReadingPreferences["paragraphGap"] : 0.8,
      width: width === "narrow" || width === "wide" ? width : "standard",
    };
  } catch { return DEFAULT_READING; }
}
