import { Cloud, CloudOff, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/hooks/use-debounce";

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export const SaveIndicator = ({ status, className }: SaveIndicatorProps) => {
  if (status === 'idle') {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-all duration-300",
        status === 'saving' && "text-muted-foreground",
        status === 'saved' && "text-primary",
        className
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </>
      )}
    </div>
  );
};
