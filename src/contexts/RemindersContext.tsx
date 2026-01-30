import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { remindersAPI } from "@/lib/api";
import { toast } from "sonner";

export interface Reminder {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  date: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

interface RemindersContextType {
  reminders: Reminder[];
  loading: boolean;
  
  // CRUD
  createReminder: (title: string, date: Date, description?: string) => Promise<Reminder | null>;
  updateReminder: (id: string, updates: Partial<Reminder>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  getRemindersByDate: (date: Date) => Reminder[];
  
  // Query
  getUpcomingReminders: (days?: number) => Reminder[];
  getOverdueReminders: () => Reminder[];
}

const RemindersContext = createContext<RemindersContextType | null>(null);

interface RemindersProviderProps {
  children: ReactNode;
}

export const RemindersProvider = ({ children }: RemindersProviderProps) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);

  // Load reminders from backend
  const loadReminders = async () => {
    try {
      const result = await remindersAPI.getAll();
      if (result.success) {
        const data = result.data || [];
        const mappedReminders = data.map((r: any) => ({
          ...r,
          id: r._id || r.id,
          date: new Date(r.date),
          createdAt: new Date(r.createdAt),
          updatedAt: r.updatedAt ? new Date(r.updatedAt) : new Date(r.createdAt)
        }));
        setReminders(mappedReminders);
      }
    } catch (error) {
      console.error("Error loading reminders:", error);
    }
  };

  // Load reminders on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadReminders();
      setLoading(false);
    };
    loadData();
  }, []);

  const createReminder = async (title: string, date: Date, description?: string): Promise<Reminder | null> => {
    try {
      const result = await remindersAPI.create(title, date.toISOString(), description);
      if (result.success && result.data) {
        const newReminder = {
          ...result.data,
          id: result.data._id,
          date: new Date(result.data.date),
          createdAt: new Date(result.data.createdAt),
        };
        setReminders(prev => [...prev, newReminder]);
        toast.success("Reminder created");
        return newReminder;
      } else {
        toast.error(result.error || "Failed to create reminder");
      }
    } catch (error) {
      toast.error("Error creating reminder");
      console.error(error);
    }
    return null;
  };

  const updateReminder = async (id: string, updates: Partial<Reminder>) => {
    try {
      const updateData = { ...updates };
      if (updates.date) {
        updateData.date = updates.date.toISOString() as any;
      }
      
      const result = await remindersAPI.update(id, updateData);
      if (result.success) {
        setReminders(prev => prev.map(r => 
          (r._id === id || r.id === id) ? { ...r, ...updates } : r
        ));
        toast.success("Reminder updated");
      } else {
        toast.error(result.error || "Failed to update reminder");
      }
    } catch (error) {
      toast.error("Error updating reminder");
      console.error(error);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      const result = await remindersAPI.delete(id);
      if (result.success) {
        setReminders(prev => prev.filter(r => (r._id !== id && r.id !== id)));
        toast.success("Reminder deleted");
      } else {
        toast.error(result.error || "Failed to delete reminder");
      }
    } catch (error) {
      toast.error("Error deleting reminder");
      console.error(error);
    }
  };

  const getRemindersByDate = (date: Date): Reminder[] => {
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return reminders.filter(r => {
      const reminderDate = new Date(r.date.getFullYear(), r.date.getMonth(), r.date.getDate());
      return reminderDate.getTime() === targetDate.getTime();
    });
  };

  const getUpcomingReminders = (days: number = 7): Reminder[] => {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + days);
    
    return reminders.filter(r => r.date >= now && r.date <= futureDate && !r.completed)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getOverdueReminders = (): Reminder[] => {
    const now = new Date();
    return reminders.filter(r => r.date < now && !r.completed)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  };

  return (
    <RemindersContext.Provider value={{
      reminders,
      loading,
      createReminder,
      updateReminder,
      deleteReminder,
      getRemindersByDate,
      getUpcomingReminders,
      getOverdueReminders,
    }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (!context) {
    throw new Error("useReminders must be used within a RemindersProvider");
  }
  return context;
};
