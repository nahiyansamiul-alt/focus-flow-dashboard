import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Sigma } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LatexTemplate {
  name: string;
  template: string;
  preview: string;
}

const latexTemplates: LatexTemplate[] = [
  // Basic Math
  { name: "Fraction", template: "\\frac{a}{b}", preview: "a/b" },
  { name: "Square Root", template: "\\sqrt{x}", preview: "√x" },
  { name: "Nth Root", template: "\\sqrt[n]{x}", preview: "ⁿ√x" },
  { name: "Power", template: "x^{n}", preview: "xⁿ" },
  { name: "Subscript", template: "x_{i}", preview: "xᵢ" },
  
  // Calculus
  { name: "Integral", template: "\\int_{a}^{b} f(x) \\, dx", preview: "∫" },
  { name: "Double Integral", template: "\\iint_{D} f(x,y) \\, dA", preview: "∬" },
  { name: "Summation", template: "\\sum_{i=1}^{n} x_i", preview: "Σ" },
  { name: "Product", template: "\\prod_{i=1}^{n} x_i", preview: "∏" },
  { name: "Limit", template: "\\lim_{x \\to \\infty} f(x)", preview: "lim" },
  { name: "Derivative", template: "\\frac{d}{dx} f(x)", preview: "d/dx" },
  { name: "Partial", template: "\\frac{\\partial f}{\\partial x}", preview: "∂f/∂x" },
  
  // Greek Letters
  { name: "Alpha", template: "\\alpha", preview: "α" },
  { name: "Beta", template: "\\beta", preview: "β" },
  { name: "Gamma", template: "\\gamma", preview: "γ" },
  { name: "Delta", template: "\\delta", preview: "δ" },
  { name: "Epsilon", template: "\\epsilon", preview: "ε" },
  { name: "Theta", template: "\\theta", preview: "θ" },
  { name: "Lambda", template: "\\lambda", preview: "λ" },
  { name: "Pi", template: "\\pi", preview: "π" },
  { name: "Sigma (lower)", template: "\\sigma", preview: "σ" },
  { name: "Phi", template: "\\phi", preview: "φ" },
  { name: "Omega", template: "\\omega", preview: "ω" },
  
  // Matrices
  { name: "2x2 Matrix", template: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}", preview: "[2×2]" },
  { name: "3x3 Matrix", template: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}", preview: "[3×3]" },
  { name: "Determinant", template: "\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}", preview: "|det|" },
  { name: "Bracket Matrix", template: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}", preview: "[[]]" },
  
  // Relations & Operators
  { name: "Not Equal", template: "\\neq", preview: "≠" },
  { name: "Approximately", template: "\\approx", preview: "≈" },
  { name: "Less or Equal", template: "\\leq", preview: "≤" },
  { name: "Greater or Equal", template: "\\geq", preview: "≥" },
  { name: "Plus Minus", template: "\\pm", preview: "±" },
  { name: "Times", template: "\\times", preview: "×" },
  { name: "Divide", template: "\\div", preview: "÷" },
  { name: "Infinity", template: "\\infty", preview: "∞" },
  
  // Sets
  { name: "Element of", template: "\\in", preview: "∈" },
  { name: "Not Element", template: "\\notin", preview: "∉" },
  { name: "Subset", template: "\\subset", preview: "⊂" },
  { name: "Union", template: "\\cup", preview: "∪" },
  { name: "Intersection", template: "\\cap", preview: "∩" },
  { name: "Empty Set", template: "\\emptyset", preview: "∅" },
  
  // Arrows
  { name: "Right Arrow", template: "\\rightarrow", preview: "→" },
  { name: "Left Arrow", template: "\\leftarrow", preview: "←" },
  { name: "Double Arrow", template: "\\Leftrightarrow", preview: "⇔" },
  { name: "Implies", template: "\\Rightarrow", preview: "⇒" },
  
  // Common Formulas
  { name: "Quadratic Formula", template: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}", preview: "Quadratic" },
  { name: "Euler's Identity", template: "e^{i\\pi} + 1 = 0", preview: "Euler" },
  { name: "Pythagorean", template: "a^2 + b^2 = c^2", preview: "a²+b²=c²" },
  { name: "Binomial", template: "\\binom{n}{k} = \\frac{n!}{k!(n-k)!}", preview: "(n k)" },
];

interface LatexTemplatesProps {
  onInsert: (template: string, isBlock?: boolean) => void;
  disabled?: boolean;
}

export const LatexTemplates = ({ onInsert, disabled }: LatexTemplatesProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="LaTeX Templates"
          disabled={disabled}
        >
          <Sigma className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-2 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground">LaTeX Templates</p>
          <p className="text-xs text-muted-foreground/70">Click to insert, Shift+Click for block</p>
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-2 gap-1 p-2">
            {latexTemplates.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                size="sm"
                className="h-auto py-1.5 px-2 justify-start text-xs font-normal hover:bg-muted"
                onClick={(e) => {
                  onInsert(item.template, e.shiftKey);
                }}
                title={`$${item.template}$`}
              >
                <span className="w-8 text-center font-mono text-muted-foreground mr-2">
                  {item.preview}
                </span>
                <span className="truncate">{item.name}</span>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
