import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Save } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { historyAPI } from "@/lib/api";
import { toast } from "sonner";
import Counter from "@/components/ui/counter";

const TimerDigit = ({ value, fontSize }: { value: number; fontSize: number }) => (
  <Counter
    value={value}
    fontSize={fontSize}
    places={[10, 1]}
    gap={0}
    horizontalPadding={0}
    gradientHeight={0}
    gradientFrom="transparent"
    gradientTo="transparent"
  />
);

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

  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = time % 60;

  const handleSaveSession = async () => {
    if (time > 0) {
      try {
        addSession(time);
        
        // Save to backend
        const mins = Math.round(time / 60);
        const result = await historyAPI.create(
          'focus_session',
          `Completed a ${mins} minute focus session`
        );
        
        if (result.success) {
          toast.success(`Session saved: ${mins > 0 ? mins + "m" : time + "s"}`);
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

  const fontSize = typeof window !== 'undefined' && window.innerWidth < 768 ? 56 : 72;

  return (
    <div className="border border-border p-8 bg-card">
      <div className="flex items-center justify-between mb-6">
        <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
          Session Timer
        </span>
        <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
      </div>
      
      <div className="font-display font-bold tracking-tighter text-foreground mb-8 flex items-center justify-start">
        <TimerDigit value={hours} fontSize={fontSize} />
        <span className="mx-1" style={{ fontSize }}>:</span>
        <TimerDigit value={minutes} fontSize={fontSize} />
        <span className="mx-1" style={{ fontSize }}>:</span>
        <TimerDigit value={seconds} fontSize={fontSize} />
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
