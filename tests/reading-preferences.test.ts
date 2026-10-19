import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_READING, parseReadingPreferences } from "../src/lib/reader/preferences";

test("reading preferences accept only supported sizes/themes and tolerate broken storage", () => {
  assert.deepEqual(parseReadingPreferences('{"fontSize":24,"theme":"dark"}'), { fontSize: 24, theme: "dark", font: "dejavu" });
  assert.deepEqual(parseReadingPreferences('{"fontSize":22,"theme":"light","font":"times"}'), { fontSize: 22, theme: "light", font: "times" });
  assert.deepEqual(parseReadingPreferences('{"font":"url(evil)"}'), DEFAULT_READING);
  for (const value of [null, "undefined", "{", "null", "[]", '{"fontSize":-1,"theme":"url(bad)"}', '{"fontSize":"24","theme":"light"}']) assert.deepEqual(parseReadingPreferences(value), DEFAULT_READING);
});
