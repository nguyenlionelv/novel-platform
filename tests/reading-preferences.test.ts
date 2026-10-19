import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_READING, parseReadingPreferences } from "../src/lib/reader/preferences";

test("reading preferences accept only supported sizes/themes and tolerate broken storage", () => {
  assert.deepEqual(parseReadingPreferences('{"fontSize":24,"theme":"dark"}'), { ...DEFAULT_READING, fontSize: 24, theme: "dark" });
  assert.deepEqual(parseReadingPreferences('{"fontSize":22,"theme":"light","font":"times"}'), { ...DEFAULT_READING, fontSize: 22, font: "times" });
  assert.deepEqual(parseReadingPreferences('{"lineHeight":2.3,"width":"wide"}'), { ...DEFAULT_READING, lineHeight: 2.3, width: "wide" });
  assert.deepEqual(parseReadingPreferences('{"lineHeight":"2.3","width":"100vw"}'), DEFAULT_READING);
  assert.deepEqual(parseReadingPreferences('{"lineHeight":100,"width":"narrow"}'), { ...DEFAULT_READING, width: "narrow" });
  assert.deepEqual(parseReadingPreferences('{"font":"url(evil)"}'), DEFAULT_READING);
  for (const value of [null, "undefined", "{", "null", "[]", '{"fontSize":-1,"theme":"url(bad)"}', '{"fontSize":"24","theme":"light"}']) assert.deepEqual(parseReadingPreferences(value), DEFAULT_READING);
});
