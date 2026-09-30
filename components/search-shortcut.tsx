"use client";

import { useEffect } from "react";

export function SearchShortcut() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const input = document.getElementById("word");
      if (!(input instanceof HTMLInputElement)) return;
      if (document.activeElement === input) return;

      event.preventDefault();
      input.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
