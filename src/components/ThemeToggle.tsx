import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme, themeLabels } from "@/contexts/ThemeContext";

export function ThemeToggle() {
  const { theme, cycleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={cycleTheme}
      className="gap-2 text-xs"
      title={`Current: ${themeLabels[theme]}. Click to cycle.`}
    >
      <Palette className="w-4 h-4" />
      <span className="hidden sm:inline">{themeLabels[theme]}</span>
    </Button>
  );
}
