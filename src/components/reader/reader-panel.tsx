"use client";

import type { ReactNode, RefObject } from "react";

export function ReaderPanel({ dialogRef, id, title, side, onClose, children }: { dialogRef: RefObject<HTMLDialogElement | null>; id: string; title: string; side: "left" | "right"; onClose: () => void; children: ReactNode }) {
  return <dialog ref={dialogRef} id={id} aria-labelledby={`${id}-title`} className={`reader-panel ${side}`} onClose={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return;
    const box = event.currentTarget.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) event.currentTarget.close();
  }}>
    <div className="reader-panel-header"><h2 id={`${id}-title`}>{title}</h2><button type="button" className="reader-control" aria-label={`Đóng ${title.toLocaleLowerCase("vi-VN")}`} onClick={() => dialogRef.current?.close()}>×</button></div>
    <div className="reader-panel-body">{children}</div>
  </dialog>;
}
