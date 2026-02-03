import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = "timeless" | "lotus-pond" | "olive-petal";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: ThemeName[] = ["timeless", "lotus-pond", "olive-petal"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("app-color-theme");
    return (saved as ThemeName) || "timeless";
  });

  useEffect(() => {
    localStorage.setItem("app-color-theme", theme);
    
    // Remove all theme classes and add current one
    document.documentElement.classList.remove(...themes);
    document.documentElement.classList.add(theme);
  }, [theme]);

  const cycleTheme = () => {
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const themeLabels: Record<ThemeName, string> = {
  "timeless": "Timeless",
  "lotus-pond": "Lotus Pond",
  "olive-petal": "Olive Petal",
};
