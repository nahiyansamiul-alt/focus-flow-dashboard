import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ThemeName = 
  | "timeless" 
  | "lotus-pond" 
  | "olive-petal"
  | "sage-garden"
  | "forest-canopy"
  | "retro-blaze"
  | "outer-space"
  | "tobacco-dusk"
  | "elegance"
  | "midnight-rose"
  | "retro-reggae"
  | "smoky-noir";

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  cycleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes: ThemeName[] = [
  "timeless",
  "lotus-pond",
  "olive-petal",
  "sage-garden",
  "forest-canopy",
  "retro-blaze",
  "outer-space",
  "tobacco-dusk",
  "elegance",
  "midnight-rose",
  "retro-reggae",
  "smoky-noir",
];

export const themeLabels: Record<ThemeName, string> = {
  "timeless": "Timeless",
  "lotus-pond": "Lotus Pond",
  "olive-petal": "Olive Petal",
  "sage-garden": "Sage Garden",
  "forest-canopy": "Forest Canopy",
  "retro-blaze": "Retro Blaze",
  "outer-space": "Outer Space",
  "tobacco-dusk": "Tobacco Dusk",
  "elegance": "Elegance",
  "midnight-rose": "Midnight Rose",
  "retro-reggae": "Retro Reggae",
  "smoky-noir": "Smoky Noir",
};

// Preview colors for each theme [background, primary, accent]
export const themeSwatches: Record<ThemeName, [string, string, string]> = {
  "timeless": ["hsl(43,30%,94%)", "hsl(0,0%,8%)", "hsl(50,10%,92%)"],
  "lotus-pond": ["hsl(50,40%,92%)", "hsl(152,55%,12%)", "hsl(8,40%,69%)"],
  "olive-petal": ["hsl(50,40%,87%)", "hsl(60,14%,37%)", "hsl(24,45%,56%)"],
  "sage-garden": ["hsl(158,18%,90%)", "hsl(270,22%,19%)", "hsl(170,24%,61%)"],
  "forest-canopy": ["hsl(40,8%,92%)", "hsl(110,66%,13%)", "hsl(195,33%,58%)"],
  "retro-blaze": ["hsl(40,65%,89%)", "hsl(25,97%,48%)", "hsl(195,65%,48%)"],
  "outer-space": ["hsl(80,25%,88%)", "hsl(190,10%,21%)", "hsl(160,12%,55%)"],
  "tobacco-dusk": ["hsl(30,20%,88%)", "hsl(340,10%,29%)", "hsl(33,33%,54%)"],
  "elegance": ["hsl(30,25%,88%)", "hsl(10,40%,30%)", "hsl(40,14%,48%)"],
  "midnight-rose": ["hsl(280,15%,8%)", "hsl(335,50%,35%)", "hsl(275,20%,45%)"],
  "retro-reggae": ["hsl(30,10%,8%)", "hsl(30,70%,55%)", "hsl(115,16%,46%)"],
  "smoky-noir": ["hsl(40,100%,97%)", "hsl(70,17%,6%)", "hsl(40,25%,79%)"],
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("app-color-theme");
    return (saved as ThemeName) || "timeless";
  });

  useEffect(() => {
    localStorage.setItem("app-color-theme", theme);
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
