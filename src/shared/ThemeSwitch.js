"use client";

import { useEffect, useState, useRef } from "react";
import styles from "@/styles/shared/ThemeSwitch.module.css";

function MoonIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12.74 2.02a1 1 0 0 0-1.08 1.25 8.5 8.5 0 0 1-10.4 10.4 1 1 0 0 0-1.25 1.08A10 10 0 1 0 12.74 2.02zM12 20a8 8 0 0 1-7.74-6.08 10.5 10.5 0 0 0 9.66-9.66A8 8 0 1 1 12 20z"
      />
    </svg>
  );
}

function SunIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0-10a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"
      />
      <path
        fill="currentColor"
        d="M11 1h2v3h-2V1zm0 19h2v3h-2v-3zM1 11h3v2H1v-2zm19 0h3v2h-3v-2zM4.22 4.22l2.12 2.12-1.41 1.41-2.12-2.12 1.41-1.41zm13.85 13.85l2.12 2.12-1.41 1.41-2.12-2.12 1.41-1.41zM18.36 4.22l1.41 1.41-2.12 2.12-1.41-1.41 2.12-2.12zM4.22 19.78l1.41 1.41 2.12-2.12-1.41-1.41-2.12 2.12z"
      />
    </svg>
  );
}

export default function ThemeSwitch({ className = "" }) {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    const initial =
      saved ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
    setMounted(true);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      className={`${styles.switch} ${isDark ? styles.dark : ""} ${className}`}
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      title="Cambiar tema"
    >
      {/* Íconos fijos en el track */}
      <span className={styles.iconSlot} aria-hidden="true">
        <SunIcon
          className={`${styles.icon} ${!isDark ? styles.iconActive : styles.iconInactive
            }`}
        />
      </span>

      <span className={styles.iconSlot} aria-hidden="true">
        <MoonIcon
          className={`${styles.icon} ${isDark ? styles.iconActive : styles.iconInactive
            }`}
        />
      </span>

      {/* Perilla */}
      <span className={styles.circle} aria-hidden="true" />
    </button>
  );
}
