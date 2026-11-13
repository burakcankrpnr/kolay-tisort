"use client";

import { Moon, Sun } from "lucide-react";

/** Açık/koyu tema anahtarı. Tercih localStorage'da; ilk boyamada boot betiği uygular. */
export function ThemeToggle({ className }: { className?: string }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      // gizli pencere: yalnızca bu oturumda geçerli
    }
  }
  return (
    <button type="button" onClick={toggle} aria-label="Açık / koyu tema" className={className}>
      <Sun size={18} className="hidden dark:block" />
      <Moon size={18} className="dark:hidden" />
    </button>
  );
}
