"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Contrast = "normal" | "high";

interface ThemeContextType {
  theme: Theme;
  contrast: Contrast;
  direction: "ltr" | "rtl";
  setTheme: (theme: Theme) => void;
  setContrast: (contrast: Contrast) => void;
  setDirection: (direction: "ltr" | "rtl") => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [contrast, setContrast] = useState<Contrast>("normal");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    // Load preferences from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    const savedContrast = localStorage.getItem("contrast") as Contrast | null;
    const savedDirection = localStorage.getItem("direction") as "ltr" | "rtl" | null;

    if (savedTheme) setTheme(savedTheme);
    if (savedContrast) setContrast(savedContrast);
    if (savedDirection) setDirection(savedDirection);

    // Check system preference
    if (!savedTheme && window.matchMedia("(prefers-color-scheme: light)").matches) {
      setTheme("light");
    }
    if (!savedContrast && window.matchMedia("(prefers-contrast: more)").matches) {
      setContrast("high");
    }
  }, []);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-contrast", contrast);
    document.documentElement.setAttribute("dir", direction);
    localStorage.setItem("theme", theme);
    localStorage.setItem("contrast", contrast);
    localStorage.setItem("direction", direction);
  }, [theme, contrast, direction]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, contrast, direction, setTheme, setContrast, setDirection, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
