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
  addSession: (duration: number, startTime: string, endTime: string) => void;
  getSessionsForDate: (date: Date) => Session[];
  getLevelForDate: (date: Date) => number;
  fetchSessions: () => Promise<void>;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = "focus-sessions";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useState<DayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch sessions from backend on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  }, [sessions]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) throw new Error("Failed to fetch history");
      
      const historyData = await response.json();
      
      // Convert backend history to DayData format
      const grouped = historyData.reduce((acc: { [key: string]: Session[] }, item: any) => {
        if (item.date && item.action === 'focus_session') {
          if (!acc[item.date]) {
            acc[item.date] = [];
          }
          acc[item.date].push({
            start: item.startTime || '00:00',
            end: item.endTime || '00:00',
            duration: item.duration || 0,
          });
        }
        return acc;
      }, {});
      
      const sessionsData = Object.entries(grouped).map(([date, sessions]) => ({
        date,
        sessions: sessions as Session[]
      }));
      
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions from backend:", error);
      // Fall back to localStorage if backend fails
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addSession = (durationSeconds: number, startTime: string, endTime: string) => {
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];
    
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
    <SessionContext.Provider value={{ sessions, addSession, getSessionsForDate, getLevelForDate, fetchSessions, isLoading }}>
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
