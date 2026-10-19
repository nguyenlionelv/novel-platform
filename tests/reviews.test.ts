import assert from "node:assert/strict";
import test from "node:test";
import { reviewInput, reviewCursor } from "../src/lib/reviews/validation";

test("review input trims names, requires integer stars, preserves safe plain text and rejects spam", () => {
  assert.deepEqual(reviewInput({ displayName: " Bạn đọc ", rating: 5, comment: " <script>x</script>\nDòng hai " }), { displayName: "Bạn đọc", rating: 5, comment: "<script>x</script>\nDòng hai" });
  assert.equal(reviewInput({ displayName: "A", rating: 1 }).comment, "");
  for (const input of [{ displayName: "  ", rating: 5 }, { displayName: "x".repeat(51), rating: 5 }, { displayName: "A", rating: "5" }, { displayName: "A", rating: 1.5 }, { displayName: "A", rating: 6 }, { displayName: "A", rating: 0 }, { displayName: "A", rating: 5, comment: "x".repeat(1001) }, { displayName: "A", rating: 5, website: "bot" }]) assert.throws(() => reviewInput(input));
});

test("review cursor validates exact timestamps and retains microseconds for stable pagination", () => {
  const id = "24fb4567-e89b-12d3-a456-426614174000";
  assert.deepEqual(reviewCursor(`2026-10-19T08:30:20.123456Z|${id}`), { createdAt: "2026-10-19T08:30:20.123456Z", id });
  assert.equal(reviewCursor(null), undefined);
  for (const value of ["", "bad", `2026-02-30T08:30:20.123Z|${id}`, `2026-10-19T08:30:20.123Z|invalid`, `2026-10-19T08:30:20.123Z|${id}|extra`]) assert.throws(() => reviewCursor(value));
});
