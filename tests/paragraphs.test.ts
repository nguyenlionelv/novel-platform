import assert from "node:assert/strict";
import test from "node:test";
import { splitChapterParagraphs } from "../src/lib/reader/paragraphs";

test("each Enter creates a paragraph, CRLF is one break, blank lines do not add empty paragraphs", () => {
  const vietnamese = "Tiếng Việt: Đường, Nguyễn, Ước".normalize("NFD");
  const original = `  Đoạn đầu.\r\nĐoạn thứ hai.\n\n${vietnamese}\rĐoạn cuối.  \n`;
  assert.deepEqual(splitChapterParagraphs(original), ["Đoạn đầu.", "Đoạn thứ hai.", vietnamese, "Đoạn cuối."]);
  assert.deepEqual(splitChapterParagraphs(" \r\n\n\t"), []);
  assert.deepEqual(splitChapterParagraphs("<script>test</script>\nMột dòng tự xuống theo màn hình vẫn là một đoạn."), ["<script>test</script>", "Một dòng tự xuống theo màn hình vẫn là một đoạn."]);
  assert.ok(original.startsWith("  Đoạn đầu.\r\n"));
});
