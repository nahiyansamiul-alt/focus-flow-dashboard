import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { toast } from "sonner";

const Timer = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addSession } = useSession();

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

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveSession = () => {
    if (time > 0) {
      addSession(time);
      const mins = Math.round(time / 60);
      toast.success(`Session saved: ${mins > 0 ? mins + "m" : time + "s"}`);
      setIsRunning(false);
      setTime(0);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };

  return (
    <div className="border border-border p-8 bg-card">
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          Session Timer
        </span>
        <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
      </div>
      
      <div className="font-display text-7xl md:text-8xl font-bold tracking-tighter text-foreground mb-8 tabular-nums">
        {formatTime(time)}
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setIsRunning(!isRunning)}
          variant="outline"
          className="flex-1 h-12 font-body text-sm uppercase tracking-wider"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={handleSaveSession}
          variant="default"
          className="h-12 px-4"
          disabled={time === 0}
        >
          <Save className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleReset}
          variant="ghost"
          className="h-12 px-4"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default Timer;
