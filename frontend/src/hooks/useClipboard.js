// src/hooks/useClipboard.js
import { useState } from "react";

/**
 * Simple clipboard hook:
 * const { copy, copied } = useClipboard();
 * await copy("text");
 */
export default function useClipboard(timeoutMs = 1200) {
  const [copied, setCopied] = useState(false);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), timeoutMs);
      return true;
    } catch (err) {
      // Fallback attempt (older browsers / blocked permissions)
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);

        if (ok) {
          setCopied(true);
          window.setTimeout(() => setCopied(false), timeoutMs);
          return true;
        }
      } catch (e) {
        // ignore
      }
      return false;
    }
  };

  return { copy, copied };
}