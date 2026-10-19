"use client";

import { DEFAULT_READING, FONT_SIZES, LINE_HEIGHTS, type ReadingPreferences } from "@/lib/reader/preferences";

export function ReadingOptions({ value, onChange }: { value: ReadingPreferences; onChange: (value: ReadingPreferences) => void }) {
  const index = FONT_SIZES.indexOf(value.fontSize);
  return <div className="reading-options">
    <fieldset><legend>Cỡ chữ</legend><div className="flex items-center gap-3"><button type="button" className="reader-control" aria-label="Giảm cỡ chữ" disabled={index === 0} onClick={() => onChange({ ...value, fontSize: FONT_SIZES[index - 1] })}>A−</button><span className="min-w-14 text-center tabular-nums" aria-live="polite">{value.fontSize} px</span><button type="button" className="reader-control" aria-label="Tăng cỡ chữ" disabled={index === FONT_SIZES.length - 1} onClick={() => onChange({ ...value, fontSize: FONT_SIZES[index + 1] })}>A+</button></div></fieldset>
    <div><label htmlFor="reading-font">Kiểu chữ</label><select id="reading-font" className="reader-control" value={value.font} onChange={event => onChange({ ...value, font: event.target.value === "times" ? "times" : "dejavu" })}><option value="dejavu">DejaVu Serif</option><option value="times">Times New Roman</option></select>{value.font === "times" && <p className="reading-hint">Times New Roman dùng font trên thiết bị; nếu thiếu sẽ dùng DejaVu Serif.</p>}</div>
    <div><label htmlFor="reading-line-height">Giãn dòng</label><select id="reading-line-height" className="reader-control" value={value.lineHeight} onChange={event => onChange({ ...value, lineHeight: Number(event.target.value) as ReadingPreferences["lineHeight"] })}>{LINE_HEIGHTS.map(height => <option key={height} value={height}>{height.toFixed(1).replace(".", ",")}{height === 1.9 ? " · Mặc định" : ""}</option>)}</select></div>
    <div><label htmlFor="reading-width">Độ rộng khung</label><select id="reading-width" className="reader-control" value={value.width} onChange={event => onChange({ ...value, width: event.target.value as ReadingPreferences["width"] })}><option value="narrow">Hẹp · 600 px</option><option value="standard">Vừa · 720 px</option><option value="wide">Rộng · 900 px</option></select><p className="reading-hint">Khung tự vừa màn hình trên điện thoại.</p></div>
    <fieldset><legend>Màu nền</legend><button type="button" className="reader-control w-full" aria-label={value.theme === "light" ? "Chuyển sang nền tối" : "Chuyển sang nền sáng"} aria-pressed={value.theme === "dark"} onClick={() => onChange({ ...value, theme: value.theme === "light" ? "dark" : "light" })}>{value.theme === "light" ? "☾ Nền tối" : "☀ Nền sáng"}</button></fieldset>
    <button type="button" className="reader-control w-full" onClick={() => onChange(DEFAULT_READING)}>Khôi phục mặc định</button>
  </div>;
}
