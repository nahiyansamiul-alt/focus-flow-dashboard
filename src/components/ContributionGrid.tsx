const ContributionGrid = () => {
  // Generate mock data for 20 weeks (140 days)
  const generateData = () => {
    const data = [];
    for (let i = 0; i < 140; i++) {
      const random = Math.random();
      let level = 0;
      if (random > 0.7) level = 1;
      if (random > 0.8) level = 2;
      if (random > 0.9) level = 3;
      if (random > 0.95) level = 4;
      data.push(level);
    }
    return data;
  };

  const data = generateData();
  const weeks = [];
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

  const months = ["Jan", "Feb", "Mar", "Apr", "May"];

  return (
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
            {week.map((level, dayIdx) => (
              <div
                key={dayIdx}
                className={`w-3 h-3 ${getLevelClass(level)} transition-colors hover:ring-1 hover:ring-foreground`}
                title={`${level} hour${level !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContributionGrid;
