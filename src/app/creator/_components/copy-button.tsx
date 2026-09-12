"use client";

import { useState } from "react";

export function CopyButton({
  label,
  value,
  className = "rounded-full border border-neutral-200 px-3 py-1.5 text-xs hover:bg-neutral-50",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" onClick={onCopy} className={className}>
      {copied ? "Copied" : label}
    </button>
  );
}
