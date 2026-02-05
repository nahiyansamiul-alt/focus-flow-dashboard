import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { historyAPI } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NoteTimerProps {
  noteTitle?: string;
  className?: string;
}

const NoteTimer = ({ noteTitle, className }: NoteTimerProps) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addSession, fetchSessions } = useSession();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const formatTime = (h: number, m: number, s: number) => {
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    }
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveSession = async () => {
    if (time > 0) {
      try {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - time * 1000);
        
        const startTime = startDate.toTimeString().slice(0, 5);
        const endTime = endDate.toTimeString().slice(0, 5);
        const durationMinutes = Math.round(time / 60);

        const description = noteTitle 
          ? `Reading/memorizing: "${noteTitle}" for ${durationMinutes} minutes`
          : `Note study session: ${durationMinutes} minutes`;

        const result = await historyAPI.create('note_session', description, {
          duration: durationMinutes,
          startTime,
          endTime,
          noteTitle,
        });
        
        if (result.success) {
          addSession(time, startTime, endTime);
          await fetchSessions();
          toast.success(`Session saved: ${durationMinutes > 0 ? durationMinutes + "m" : time + "s"}`);
        } else {
          toast.error(result.error || 'Failed to save session');
        }
      } catch (error) {
        toast.error('Error saving session');
        console.error(error);
      }
      setIsRunning(false);
      setTime(0);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
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
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setIsRunning(!isRunning)}
        title={isRunning ? "Pause" : "Start"}
      >
        {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleSaveSession}
        disabled={time === 0}
        title="Save session"
      >
        <Save className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={handleReset}
        title="Reset"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default NoteTimer;
