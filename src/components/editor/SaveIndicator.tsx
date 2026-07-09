import { AlertCircle, Check, Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveState } from "@/hooks/use-debounce";

interface SaveIndicatorProps {
  state: SaveState;
  className?: string;
}

const formatSavedAt = (date: Date | null) => {
  if (!date) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const formatRelative = (date: Date | null) => {
  if (!date) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};

export const SaveIndicator = ({ state, className }: SaveIndicatorProps) => {
  const { status, savedAt, queuedAt, error } = state;

  if (status === 'idle') {
    return savedAt ? (
      <div className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)} title={`Last saved at ${formatSavedAt(savedAt)}`}>
        <Check className="h-3 w-3" />
        <span>Saved {formatRelative(savedAt)}</span>
      </div>
    ) : null;
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs transition-all duration-300",
        status === 'saving' && "text-muted-foreground",
        status === 'saved' && "text-primary",
        status === 'queued' && "text-yellow-500",
        status === 'error' && "text-destructive",
        className
      )}
      title={error || (savedAt ? `Last saved at ${formatSavedAt(savedAt)}` : queuedAt ? `Queued at ${formatSavedAt(queuedAt)}` : undefined)}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      )}
      {status === 'queued' && (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Queued {formatRelative(queuedAt)}</span>
        </>
      )}
      {status === 'error' && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Save failed</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved {formatRelative(savedAt)}</span>
        </>
      )}
    </div>
  );
};
