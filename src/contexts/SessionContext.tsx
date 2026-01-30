import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Session {
  start: string;
  end: string;
  duration: number;
}

export interface DayData {
  date: string; // ISO date string for storage
  sessions: Session[];
}

interface SessionContextType {
  sessions: DayData[];
  addSession: (duration: number) => void;
  getSessionsForDate: (date: Date) => Session[];
  getLevelForDate: (date: Date) => number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = "focus-sessions";

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<DayData[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const addSession = (durationSeconds: number) => {
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    const endTime = now.toTimeString().slice(0, 5);
    
    const startDate = new Date(now.getTime() - durationSeconds * 1000);
    const startTime = startDate.toTimeString().slice(0, 5);
    
    const durationMinutes = Math.round(durationSeconds / 60);

    const newSession: Session = {
      start: startTime,
      end: endTime,
      duration: durationMinutes,
    };

    setSessions((prev) => {
      const existingDay = prev.find((d) => d.date === dateKey);
      if (existingDay) {
        return prev.map((d) =>
          d.date === dateKey
            ? { ...d, sessions: [...d.sessions, newSession] }
            : d
        );
      }
      return [...prev, { date: dateKey, sessions: [newSession] }];
    });
  };

  const getSessionsForDate = (date: Date): Session[] => {
    const dateKey = date.toISOString().split("T")[0];
    const day = sessions.find((d) => d.date === dateKey);
    return day?.sessions || [];
  };

  const getLevelForDate = (date: Date): number => {
    const daySessions = getSessionsForDate(date);
    const totalMinutes = daySessions.reduce((acc, s) => acc + s.duration, 0);
    
    if (totalMinutes === 0) return 0;
    if (totalMinutes < 30) return 1;
    if (totalMinutes < 60) return 2;
    if (totalMinutes < 120) return 3;
    return 4;
  };

  return (
    <SessionContext.Provider value={{ sessions, addSession, getSessionsForDate, getLevelForDate }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
