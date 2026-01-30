import { useSession } from "@/contexts/SessionContext";
import { useMemo } from "react";

const Stats = () => {
  const { sessions } = useSession();

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const todayData = sessions.find((d) => d.date === today);
    const todaySessions = todayData?.sessions || [];
    const totalMinutesToday = todaySessions.reduce((acc, s) => acc + s.duration, 0);

    // Calculate weekly stats
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekKey = weekStart.toISOString().split("T")[0];
    
    let weekCount = 0;
    let weekMinutes = 0;
    sessions.forEach((day) => {
      if (day.date >= weekKey) {
        weekCount += day.sessions.length;
        weekMinutes += day.sessions.reduce((acc, s) => acc + s.duration, 0);
      }
    });

    // Calculate streak
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      const dateKey = checkDate.toISOString().split("T")[0];
      const dayData = sessions.find((d) => d.date === dateKey);
      if (dayData && dayData.sessions.length > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const hours = Math.floor(totalMinutesToday / 60);
    const mins = totalMinutesToday % 60;

    return [
      { 
        label: "Today", 
        value: `${hours}h ${mins}m`, 
        sublabel: "focused" 
      },
      { 
        label: "Sessions", 
        value: weekCount.toString(), 
        sublabel: "this week" 
      },
      { 
        label: "Streak", 
        value: streak.toString(), 
        sublabel: streak === 1 ? "day" : "days" 
      },
    ];
  }, [sessions]);

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-border p-4 bg-card">
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            {stat.label}
          </span>
          <div className="mt-2">
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              {stat.value}
            </span>
            <p className="font-body text-xs text-muted-foreground mt-1">
              {stat.sublabel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Stats;
