"use client";

import { useState } from "react";
import { useToast } from "./Toast";

export function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label} copied`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  }

  return (
    <div className="field">
      <span className="field-label">{label}</span>
      <div className="flex items-center gap-2">
        <code
          className="flex-1"
          style={{
            padding: "0.625rem 0.875rem",
            borderRadius: "var(--input-radius)",
            border: "var(--border-width) solid var(--line)",
            background: "var(--background)",
            fontSize: "0.875rem",
            color: "var(--foreground)",
          }}
        >
          {value}
        </code>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCopy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
