import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme, themes, themeLabels, themeSwatches, ThemeName } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useState } from "react";

function ThemeSwatch({ name, isActive, onClick }: { name: ThemeName; isActive: boolean; onClick: () => void }) {
  const [bg, primary, accent] = themeSwatches[name];

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 text-left transition-all hover:bg-muted/50",
        isActive && "bg-muted"
      )}
    >
      <div className="flex gap-0.5 shrink-0">
        <div className="w-5 h-5 border border-border/50" style={{ backgroundColor: bg }} />
        <div className="w-5 h-5 border border-border/50" style={{ backgroundColor: primary }} />
        <div className="w-5 h-5 border border-border/50" style={{ backgroundColor: accent }} />
      </div>
      <span className="text-xs font-body truncate">{themeLabels[name]}</span>
    </button>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-xs"
          title={`Theme: ${themeLabels[theme]}`}
        >
          <Palette className="w-4 h-4" />
          <span className="hidden sm:inline">{themeLabels[theme]}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-56 p-0 bg-popover border border-border z-50 max-h-80 overflow-y-auto"
        align="end"
        sideOffset={8}
      >
        <div className="px-3 py-2 border-b border-border">
          <p className="text-xs font-display font-semibold text-foreground">Choose Theme</p>
        </div>
        <div className="py-1">
          {themes.map((t) => (
            <ThemeSwatch
              key={t}
              name={t}
              isActive={theme === t}
              onClick={() => {
                setTheme(t);
                setOpen(false);
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
