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

// CSS-in-JS approach for inline styles
const getPatternStyle = (pattern: PaperPattern): React.CSSProperties => {
  if (pattern === "none") return {};
  
  const styles: Record<PaperPattern, React.CSSProperties> = {
    none: {},
    // Simple clean grid
    grid: {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(45 10% 75% / 0.5) 1px, transparent 1px),
        linear-gradient(90deg, hsl(45 10% 75% / 0.5) 1px, transparent 1px)
      `,
      backgroundSize: "20px 20px",
    },
    // Grid with green plus signs at intersections (image-19)
    "grid-plus": {
      backgroundColor: "hsl(48 35% 95%)",
      backgroundImage: `
        linear-gradient(hsl(45 10% 80% / 0.4) 1px, transparent 1px),
        linear-gradient(90deg, hsl(45 10% 80% / 0.4) 1px, transparent 1px),
        radial-gradient(circle, hsl(90 50% 45%) 1.5px, transparent 1.5px),
        linear-gradient(hsl(90 50% 45%) 1px, transparent 1px),
        linear-gradient(90deg, hsl(90 50% 45%) 1px, transparent 1px)
      `,
      backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 4px, 4px 40px",
      backgroundPosition: "0 0, 0 0, 20px 20px, 18px 20px, 20px 18px",
    },
    // Confetti grid with scattered colorful squares (image-18)
    "grid-confetti": {
      backgroundColor: "hsl(10 20% 97%)",
      backgroundImage: `
        linear-gradient(hsl(350 20% 88% / 0.3) 1px, transparent 1px),
        linear-gradient(90deg, hsl(350 20% 88% / 0.3) 1px, transparent 1px),
        radial-gradient(circle, hsl(350 60% 70%) 2px, transparent 2px),
        radial-gradient(circle, hsl(200 60% 60%) 2px, transparent 2px),
        radial-gradient(circle, hsl(100 50% 55%) 2px, transparent 2px),
        radial-gradient(circle, hsl(35 70% 60%) 2px, transparent 2px)
      `,
      backgroundSize: "12px 12px, 12px 12px, 180px 150px, 220px 170px, 200px 190px, 160px 140px",
      backgroundPosition: "0 0, 0 0, 15px 20px, 80px 60px, 120px 100px, 50px 130px",
    },
    // Rainbow stripe grid with colored horizontal bands (image-17)
    "graph-rainbow": {
      backgroundColor: "hsl(45 30% 96%)",
      backgroundImage: `
        linear-gradient(hsl(350 55% 75% / 0.5) 1px, transparent 1px),
        linear-gradient(90deg, hsl(350 55% 75% / 0.5) 1px, transparent 1px),
        linear-gradient(to bottom, 
          hsl(350 55% 75% / 0.15) 0%, hsl(350 55% 75% / 0.15) 14.28%,
          hsl(35 65% 70% / 0.15) 14.28%, hsl(35 65% 70% / 0.15) 28.56%,
          hsl(50 70% 65% / 0.15) 28.56%, hsl(50 70% 65% / 0.15) 42.84%,
          hsl(160 45% 60% / 0.15) 42.84%, hsl(160 45% 60% / 0.15) 57.12%,
          hsl(45 30% 96% / 0) 57.12%, hsl(45 30% 96% / 0) 71.4%,
          hsl(350 50% 70% / 0.1) 71.4%, hsl(350 50% 70% / 0.1) 85.68%,
          hsl(160 40% 55% / 0.1) 85.68%, hsl(160 40% 55% / 0.1) 100%
        )
      `,
      backgroundSize: "10px 10px, 10px 10px, 100% 700px",
      backgroundPosition: "0 0, 0 0, 0 0",
    },
    // Cyan graph paper with red accent lines
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
    // Dot grid
    dots: {
      backgroundColor: "hsl(45 25% 95%)",
      backgroundImage: "radial-gradient(circle, hsl(30 10% 35%) 1.5px, transparent 1.5px)",
      backgroundSize: "22px 22px",
    },
    // Horizontal lines
    lines: {
      backgroundColor: "hsl(42 25% 93%)",
      backgroundImage: "linear-gradient(hsl(35 15% 70% / 0.6) 1px, transparent 1px)",
      backgroundSize: "100% 26px",
    },
    // Ruled paper with red margin line
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
