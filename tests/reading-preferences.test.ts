import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_READING, parseReadingPreferences } from "../src/lib/reader/preferences";

test("reading preferences accept only supported sizes/themes and tolerate broken storage", () => {
  assert.deepEqual(parseReadingPreferences('{"fontSize":24,"theme":"dark"}'), { fontSize: 24, theme: "dark" });
  for (const value of [null, "undefined", "{", "null", "[]", '{"fontSize":-1,"theme":"url(bad)"}', '{"fontSize":"24","theme":"light"}']) assert.deepEqual(parseReadingPreferences(value), DEFAULT_READING);
});
