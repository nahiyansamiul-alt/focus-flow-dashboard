import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

interface CodeBlockProps {
  language?: string;
  children: string;
}

export const CodeBlock = ({ language, children }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check if document has a dark theme or use prefers-color-scheme
    const checkDarkMode = () => {
      const root = document.documentElement;
      const bgColor = getComputedStyle(root).getPropertyValue('--background').trim();
      // If background HSL lightness is low, it's dark
      const match = bgColor.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
      if (match) {
        const lightness = parseFloat(match[3]);
        setIsDark(lightness < 50);
      } else {
        // Fallback to system preference
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      }
    };
    
    checkDarkMode();
    
    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden my-3">
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-1.5 bg-muted/80 border-b border-border text-xs z-10">
        <span className="text-muted-foreground font-mono">
          {language || "text"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
          title="Copy code"
        >
          {copied ? (
            <Check className="h-3 w-3 text-primary" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          paddingTop: "2.5rem",
          borderRadius: "0.5rem",
          fontSize: "0.8125rem",
        }}
        showLineNumbers={children.split("\n").length > 3}
        wrapLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// Inline code component
export const InlineCode = ({ children }: { children: React.ReactNode }) => {
  return (
    <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm text-foreground">
      {children}
    </code>
  );
};
