const Stats = () => {
  const stats = [
    { label: "Today", value: "2h 34m", sublabel: "focused" },
    { label: "Sessions", value: "12", sublabel: "this week" },
    { label: "Streak", value: "7", sublabel: "days" },
  ];

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
