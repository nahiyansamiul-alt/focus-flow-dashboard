import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSession, Session } from "@/contexts/SessionContext";
import { useReminders } from "@/contexts/RemindersContext";
import { ReminderPopup } from "./ReminderPopup";

interface DayData {
  level: number;
  date: Date;
  sessions: Session[];
}

const ContributionGrid = () => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [reminderPopupOpen, setReminderPopupOpen] = useState(false);
  const { getSessionsForDate, getLevelForDate } = useSession();
  const { reminders, getRemindersByDate } = useReminders();

  // Generate grid data for 20 weeks (140 days)
  const data = useMemo((): DayData[] => {
    const result: DayData[] = [];
    const today = new Date();
    
    for (let i = 139; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const sessions = getSessionsForDate(date);
      const level = getLevelForDate(date);
      
      result.push({ level, date, sessions });
    }
    return result;
  }, [getSessionsForDate, getLevelForDate]);
  
  const weeks: DayData[][] = [];
  for (let i = 0; i < 20; i++) {
    weeks.push(data.slice(i * 7, (i + 1) * 7));
  }

  const getLevelClass = (level: number) => {
    switch (level) {
      case 0: return "bg-muted";
      case 1: return "bg-contribution-low";
      case 2: return "bg-contribution-medium";
      case 3: return "bg-contribution-high";
      case 4: return "bg-contribution-max";
      default: return "bg-muted";
    }
  };

  const hasReminder = (date: Date): boolean => {
    return getRemindersByDate(date).length > 0;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTotalTime = (sessions: { duration: number }[]) => {
    const total = sessions.reduce((acc, s) => acc + s.duration, 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const months = ["Jan", "Feb", "Mar", "Apr", "May"];

  return (
    <>
      <div className="border border-border p-6 bg-card">
        <div className="flex items-center justify-between mb-6">
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            Activity
          </span>
          <div className="flex items-center gap-2">
            <span className="font-body text-xs text-muted-foreground">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 ${getLevelClass(level)}`} />
              ))}
            </div>
            <span className="font-body text-xs text-muted-foreground">More</span>
          </div>
        </div>

        {/* Month labels */}
        <div className="flex gap-1 mb-2 ml-0">
          {months.map((month) => (
            <span
              key={month}
              className="font-body text-xs text-muted-foreground"
              style={{ width: "calc(20% - 2px)" }}
            >
              {month}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-1">
              {week.map((day, dayIdx) => {
                const dayHasReminder = hasReminder(day.date);
                return (
                  <div
                    key={dayIdx}
                    className={`w-3 h-3 relative ${getLevelClass(day.level)} transition-all hover:ring-1 hover:ring-foreground cursor-pointer rounded-sm`}
                    title={`${day.level} hour${day.level !== 1 ? "s" : ""}${dayHasReminder ? " • Has reminder" : ""}`}
                    onClick={() => {
                      if (dayHasReminder) {
                        setSelectedDay(day);
                        setReminderPopupOpen(true);
                      } else {
                        setSelectedDay(day);
                      }
                    }}
                  >
                    {dayHasReminder && (
                      <div className="absolute inset-0 bg-red-500 rounded-sm animate-pulse opacity-70" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedDay && !reminderPopupOpen} onOpenChange={() => setSelectedDay(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {selectedDay && formatDate(selectedDay.date)}
            </DialogTitle>
            <DialogDescription>
              {selectedDay?.sessions.length === 0
                ? "No focus sessions recorded"
                : `${selectedDay?.sessions.length} session${selectedDay?.sessions.length !== 1 ? "s" : ""} • ${selectedDay && getTotalTime(selectedDay.sessions)} total`}
            </DialogDescription>
          </DialogHeader>

          {selectedDay && selectedDay.sessions.length > 0 && (
            <div className="space-y-3 mt-4">
              {selectedDay.sessions.map((session, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 border border-border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 ${getLevelClass(selectedDay.level)}`} />
                    <span className="font-body text-sm">
                      {session.start} — {session.end}
                    </span>
                  </div>
                  <span className="font-display text-sm font-medium">
                    {session.duration}m
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedDay && selectedDay.sessions.length === 0 && (
            <div className="py-8 text-center">
              <p className="font-body text-muted-foreground text-sm">
                Start a focus session to track your progress
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ReminderPopup
        isOpen={reminderPopupOpen && !!selectedDay}
        onOpenChange={setReminderPopupOpen}
        reminders={selectedDay ? getRemindersByDate(selectedDay.date) : []}
        selectedDate={selectedDay?.date || null}
      />
    </>
  );
};

export default ContributionGrid;
