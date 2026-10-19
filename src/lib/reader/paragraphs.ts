// Enter starts a paragraph. Blank lines separate paragraphs without adding empty ones.
// Formatting the display never changes the original chapter text in the database.
export function splitChapterParagraphs(content: string): string[] {
  return content.split(/\r\n|[\r\n]/).map(line => line.trim()).filter(Boolean);
}
