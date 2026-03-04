"use client";

import { useEffect, useRef, useState } from "react";

type ThemeMode = "light" | "dark";

const THEME_KEY = "bk-theme-mode";

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", mode);
}

function animateThemeSwitch(next: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("theme-switching", "theme-switch-light", "theme-switch-dark");
  root.classList.add("theme-switching", next === "dark" ? "theme-switch-dark" : "theme-switch-light");
}

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());
  const clearTimerRef = useRef<number | null>(null);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (clearTimerRef.current) {
        window.clearTimeout(clearTimerRef.current);
      }
    };
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    animateThemeSwitch(next);
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
    if (clearTimerRef.current) {
      window.clearTimeout(clearTimerRef.current);
    }
    clearTimerRef.current = window.setTimeout(() => {
      const root = document.documentElement;
      root.classList.remove("theme-switching", "theme-switch-light", "theme-switch-dark");
      clearTimerRef.current = null;
    }, 440);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label="Ganti mode tampilan"
      title="Ganti mode tampilan"
    >
      {theme === "light" ? "Dark Mode" : "Day Mode"}
    </button>
  );
}
