import { cn } from "@/lib/utils";

export type PaperPattern = 
  | "none"
  | "grid"
  | "grid-plus"
  | "grid-confetti"
  | "graph-rainbow"
  | "graph-cyan"
  | "dots"
  | "lines"
  | "ruled";

interface PaperBackgroundProps {
  pattern: PaperPattern;
  className?: string;
  children?: React.ReactNode;
}

const patternStyles: Record<PaperPattern, string> = {
  none: "",
  grid: `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(var(--paper-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--paper-line)) 1px, transparent 1px);
    background-size: 20px 20px;
  `,
  "grid-plus": `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(var(--paper-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--paper-line)) 1px, transparent 1px),
      radial-gradient(circle, hsl(120 50% 50%) 1.5px, transparent 1.5px);
    background-size: 20px 20px, 20px 20px, 80px 80px;
    background-position: 0 0, 0 0, 10px 10px;
  `,
  "grid-confetti": `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(var(--paper-line-soft)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--paper-line-soft)) 1px, transparent 1px);
    background-size: 12px 12px;
  `,
  "graph-rainbow": `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(var(--paper-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(var(--paper-line)) 1px, transparent 1px);
    background-size: 16px 16px;
  `,
  "graph-cyan": `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(185 60% 70%) 1px, transparent 1px),
      linear-gradient(90deg, hsl(185 60% 70%) 1px, transparent 1px),
      linear-gradient(hsl(0 70% 60%) 2px, transparent 2px);
    background-size: 12px 12px, 12px 12px, 100% 120px;
    background-position: 0 0, 0 0, 0 0;
  `,
  dots: `
    background-color: hsl(var(--paper-base));
    background-image: radial-gradient(circle, hsl(var(--paper-dot)) 2px, transparent 2px);
    background-size: 24px 24px;
  `,
  lines: `
    background-color: hsl(var(--paper-base));
    background-image: linear-gradient(hsl(var(--paper-line)) 1px, transparent 1px);
    background-size: 100% 28px;
  `,
  ruled: `
    background-color: hsl(var(--paper-base));
    background-image: 
      linear-gradient(hsl(var(--paper-line)) 1px, transparent 1px),
      linear-gradient(90deg, hsl(0 70% 60%) 2px, transparent 2px);
    background-size: 100% 28px, 60px 100%;
    background-position: 0 0, 58px 0;
  `,
};

// CSS-in-JS approach for inline styles
const getPatternStyle = (pattern: PaperPattern): React.CSSProperties => {
  if (pattern === "none") return {};
  
  const styles: Record<PaperPattern, React.CSSProperties> = {
    none: {},
    grid: {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(45 10% 75% / 0.5) 1px, transparent 1px),
        linear-gradient(90deg, hsl(45 10% 75% / 0.5) 1px, transparent 1px)
      `,
      backgroundSize: "20px 20px",
    },
    "grid-plus": {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(45 10% 75% / 0.4) 1px, transparent 1px),
        linear-gradient(90deg, hsl(45 10% 75% / 0.4) 1px, transparent 1px),
        radial-gradient(circle, hsl(120 45% 55%) 1.5px, transparent 1.5px)
      `,
      backgroundSize: "20px 20px, 20px 20px, 80px 80px",
      backgroundPosition: "0 0, 0 0, 10px 10px",
    },
    "grid-confetti": {
      backgroundColor: "hsl(45 30% 97%)",
      backgroundImage: `
        linear-gradient(hsl(350 40% 85% / 0.4) 1px, transparent 1px),
        linear-gradient(90deg, hsl(350 40% 85% / 0.4) 1px, transparent 1px)
      `,
      backgroundSize: "10px 10px",
    },
    "graph-rainbow": {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(350 60% 70% / 0.5) 1px, transparent 1px),
        linear-gradient(90deg, hsl(350 60% 70% / 0.5) 1px, transparent 1px)
      `,
      backgroundSize: "14px 14px",
    },
    "graph-cyan": {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(185 55% 65% / 0.6) 1px, transparent 1px),
        linear-gradient(90deg, hsl(185 55% 65% / 0.6) 1px, transparent 1px),
        linear-gradient(hsl(0 65% 60%) 2px, transparent 2px)
      `,
      backgroundSize: "10px 10px, 10px 10px, 100% 100px",
      backgroundPosition: "0 0, 0 0, 0 0",
    },
    dots: {
      backgroundColor: "hsl(45 25% 95%)",
      backgroundImage: "radial-gradient(circle, hsl(30 10% 35%) 1.5px, transparent 1.5px)",
      backgroundSize: "22px 22px",
    },
    lines: {
      backgroundColor: "hsl(42 25% 93%)",
      backgroundImage: "linear-gradient(hsl(35 15% 70% / 0.6) 1px, transparent 1px)",
      backgroundSize: "100% 26px",
    },
    ruled: {
      backgroundColor: "hsl(50 35% 95%)",
      backgroundImage: `
        linear-gradient(hsl(40 15% 75% / 0.5) 1px, transparent 1px),
        linear-gradient(90deg, hsl(0 65% 60%) 2px, transparent 2px)
      `,
      backgroundSize: "100% 26px, 56px 100%",
      backgroundPosition: "0 0, 54px 0",
    },
  };
  
  return styles[pattern];
};

export function PaperBackground({ pattern, className, children }: PaperBackgroundProps) {
  return (
    <div 
      className={cn("w-full h-full", className)}
      style={getPatternStyle(pattern)}
    >
      {children}
    </div>
  );
}

// Pattern preview component for the selector
export function PatternPreview({ pattern, isSelected, onClick }: { 
  pattern: PaperPattern; 
  isSelected: boolean;
  onClick: () => void;
}) {
  const labels: Record<PaperPattern, string> = {
    none: "None",
    grid: "Grid",
    "grid-plus": "Grid +",
    "grid-confetti": "Confetti",
    "graph-rainbow": "Rainbow",
    "graph-cyan": "Graph",
    dots: "Dots",
    lines: "Lines",
    ruled: "Ruled",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-12 h-12 rounded border-2 transition-all overflow-hidden",
        isSelected 
          ? "border-primary ring-2 ring-primary/20" 
          : "border-border hover:border-primary/50"
      )}
      title={labels[pattern]}
    >
      <div 
        className="w-full h-full"
        style={pattern === "none" ? { backgroundColor: "hsl(var(--background))" } : getPatternStyle(pattern)}
      />
    </button>
  );
}

export const paperPatterns: PaperPattern[] = [
  "none",
  "grid",
  "grid-plus", 
  "dots",
  "lines",
  "ruled",
  "graph-cyan",
  "grid-confetti",
  "graph-rainbow",
];

export default PaperBackground;
