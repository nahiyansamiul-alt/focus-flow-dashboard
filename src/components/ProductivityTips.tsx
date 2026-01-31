import { useState, useEffect } from "react";
import { Lightbulb, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const tips = [
  {
    title: "Pomodoro Technique",
    tip: "Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break.",
  },
  {
    title: "Two-Minute Rule",
    tip: "If a task takes less than 2 minutes, do it immediately instead of adding it to your list.",
  },
  {
    title: "Eat the Frog",
    tip: "Tackle your most challenging task first thing in the morning when your energy is highest.",
  },
  {
    title: "Time Blocking",
    tip: "Schedule specific time blocks for different tasks to minimize context switching.",
  },
  {
    title: "80/20 Rule",
    tip: "Focus on the 20% of tasks that produce 80% of your results.",
  },
  {
    title: "Single-Tasking",
    tip: "Focus on one task at a time. Multitasking reduces efficiency by up to 40%.",
  },
  {
    title: "Environment Design",
    tip: "Remove distractions from your workspace before starting a focus session.",
  },
  {
    title: "Energy Management",
    tip: "Schedule demanding tasks during your peak energy hours, routine tasks when energy dips.",
  },
];

const ProductivityTips = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setCurrentIndex(Math.floor(Math.random() * tips.length));
  }, []);

  const navigate = (direction: 'prev' | 'next') => {
    setIsAnimating(true);
    setTimeout(() => {
      if (direction === 'next') {
        setCurrentIndex((prev) => (prev + 1) % tips.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + tips.length) % tips.length);
      }
      setIsAnimating(false);
    }, 200);
  };

  const currentTip = tips[currentIndex];

  return (
    <div className="border border-border p-6 bg-card h-[140px] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-contribution-max" />
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            Productivity Tip
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => navigate('prev')}
            title="Previous tip"
          >
            <ChevronLeft className="h-3 w-3 text-muted-foreground" />
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">
            {currentIndex + 1}/{tips.length}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => navigate('next')}
            title="Next tip"
          >
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      </div>
      <div className={`flex-1 transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <h4 className="font-display text-sm font-semibold text-foreground mb-1">
          {currentTip.title}
        </h4>
        <p className="font-body text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {currentTip.tip}
        </p>
      </div>
    </div>
  );
};

export default ProductivityTips;
