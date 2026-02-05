import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { useSession } from "@/contexts/SessionContext";
import { historyAPI } from "@/lib/api";
import { toast } from "sonner";

interface NoteTimerContextType {
  time: number;
  isRunning: boolean;
  noteTitle: string | null;
  startTimer: (title?: string) => void;
  pauseTimer: () => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  saveSession: () => Promise<void>;
}

const NoteTimerContext = createContext<NoteTimerContextType | undefined>(undefined);

export const NoteTimerProvider = ({ children }: { children: ReactNode }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [noteTitle, setNoteTitle] = useState<string | null>(null);
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

  const startTimer = useCallback((title?: string) => {
    if (title) setNoteTitle(title);
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  const saveSession = useCallback(async () => {
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
      setNoteTitle(null);
    }
  }, [time, noteTitle, addSession, fetchSessions]);

  return (
    <NoteTimerContext.Provider value={{
      time,
      isRunning,
      noteTitle,
      startTimer,
      pauseTimer,
      toggleTimer,
      resetTimer,
      saveSession,
    }}>
      {children}
    </NoteTimerContext.Provider>
  );
};

export const useNoteTimer = () => {
  const context = useContext(NoteTimerContext);
  if (!context) {
    throw new Error("useNoteTimer must be used within a NoteTimerProvider");
  }
  return context;
};
