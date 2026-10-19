import assert from "node:assert/strict";
import test from "node:test";
import { chapterInput, imageExtension, novelInput, pageOffset, uuid } from "../src/lib/admin/validation";

test("chapter validation preserves paragraphs and rejects invalid order or oversized content", () => {
  const input = { position: 1, title: " Tên chương ", content: "Đoạn một.\n\nĐoạn hai.\n", intent: "draft" };
  assert.equal(chapterInput(input).content, input.content);
  assert.equal(chapterInput(input).title, "Tên chương");
  for (const position of [0, -1, 1.5, "1", 2147483648]) assert.throws(() => chapterInput({ ...input, position }));
  assert.throws(() => chapterInput({ ...input, content: " " }));
  assert.throws(() => chapterInput({ ...input, content: "x".repeat(200001) }));
  assert.throws(() => chapterInput({ ...input, intent: "delete" }));
  assert.throws(() => chapterInput({ ...input, id: "not-a-uuid" }));
});

test("novel fields and pagination reject malformed data", () => {
  assert.equal(novelInput({ title: "Tên truyện", author: "Tác giả", description: "", status: "ongoing" }).description, "");
  assert.throws(() => novelInput({ title: " ", author: "Tác giả", description: "", status: "ongoing" }));
  assert.throws(() => novelInput({ title: "Tên", author: "Tác giả", description: "", status: "draft" }));
  assert.equal(pageOffset(null), 0);
  for (const value of ["-1", "1.5", "99999999", "1;drop table"]) assert.throws(() => pageOffset(value));
  assert.throws(() => uuid("1' OR '1'='1"));
});

test("cover image validation checks content as well as claimed MIME", () => {
  const png = Uint8Array.from([137,80,78,71,13,10,26,10]);
  assert.equal(imageExtension(png, "image/png"), "png");
  assert.throws(() => imageExtension(new TextEncoder().encode("<script>alert(1)</script>"), "image/png"));
  assert.throws(() => imageExtension(png, "image/svg+xml"));
  assert.throws(() => imageExtension(png, "image/jpeg"));
});
