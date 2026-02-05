import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { useNoteTimer } from "@/contexts/NoteTimerContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteTimerProps {
  noteTitle?: string;
  className?: string;
}

const NoteTimer = ({ noteTitle, className }: NoteTimerProps) => {
  const { time, isRunning, toggleTimer, resetTimer, saveSession, startTimer } = useNoteTimer();

  // Update note title when it changes
  useEffect(() => {
    if (noteTitle && !isRunning && time === 0) {
      // Only set title if timer hasn't started yet
    }
  }, [noteTitle, isRunning, time]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const formatTime = (h: number, m: number, s: number) => {
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleToggle = () => {
    if (!isRunning && time === 0 && noteTitle) {
      startTimer(noteTitle);
    } else {
      toggleTimer();
    }
  };

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card",
          isRunning && "border-primary/50 bg-primary/5"
        )}>
          {isRunning && (
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          )}
          <span className="font-mono text-sm font-medium tabular-nums min-w-[52px]">
            {formatTime(hours, minutes, seconds)}
          </span>
        </div>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleToggle}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isRunning ? "Pause" : "Start"} <kbd className="ml-1 px-1 py-0.5 text-xs bg-muted rounded">Space</kbd></p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={saveSession}
              disabled={time === 0}
            >
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save session <kbd className="ml-1 px-1 py-0.5 text-xs bg-muted rounded">⌘⇧S</kbd></p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={resetTimer}
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Reset <kbd className="ml-1 px-1 py-0.5 text-xs bg-muted rounded">⌘R</kbd></p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export default NoteTimer;
