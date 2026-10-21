"use client";

import { useRef, useState } from "react";
import { Icon } from "./Icon";

/**
 * 点击或拖拽上传单个文件。accept 例如 ".xlsx,.xls,.csv"。
 * onFile(file) 在选中文件后调用；disabled 时不可操作。
 */
export function FileDropzone({ accept, onFile, disabled = false, hint, fileName }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  function handleFiles(files) {
    const file = files?.[0];
    if (file && !disabled) onFile(file);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(event) => {
        if ((event.key === "Enter" || event.key === " ") && !disabled) inputRef.current?.click();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        handleFiles(event.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        dragging ? "border-primary bg-primary/5" : "border-line/60 bg-accent hover:border-primary/60"
      } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
    >
      <Icon name="upload_file" className="text-4xl text-primary" />
      <span className="text-sm font-semibold text-scene-content">{fileName || hint}</span>
      <span className="text-xs text-subtle">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
