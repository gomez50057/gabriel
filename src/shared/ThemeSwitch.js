"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/shared/ThemeSwitch.module.css";

export default function ThemeSwitch() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <button
      className={styles.switch}
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      <span><i className="fas fa-moon" /></span>
      <span><i className="fas fa-sun" /></span>
    </button>
  );
}
