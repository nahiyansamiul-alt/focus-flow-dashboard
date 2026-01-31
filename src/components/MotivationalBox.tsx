import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const motivationalQuotes = [
  {
    quote: "The secret of getting ahead is getting started.",
    author: "Mark Twain",
  },
  {
    quote: "Focus on being productive instead of busy.",
    author: "Tim Ferriss",
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
  },
  {
    quote: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    quote: "It's not about having time, it's about making time.",
    author: "Unknown",
  },
  {
    quote: "Small steps every day lead to big results.",
    author: "Unknown",
  },
  {
    quote: "Don't watch the clock; do what it does. Keep going.",
    author: "Sam Levenson",
  },
  {
    quote: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    quote: "Success is the sum of small efforts repeated day in and day out.",
    author: "Robert Collier",
  },
  {
    quote: "You don't have to be great to start, but you have to start to be great.",
    author: "Zig Ziglar",
  },
];

const MotivationalBox = () => {
  const [currentQuote, setCurrentQuote] = useState(motivationalQuotes[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, []);

  const handleRefresh = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentQuote(getRandomQuote());
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="border border-border p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-contribution-high" />
          <span className="font-body text-xs uppercase tracking-widest text-muted-foreground">
            Daily Motivation
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleRefresh}
          title="New quote"
        >
          <RefreshCw className={`h-3 w-3 text-muted-foreground ${isAnimating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className={`transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <blockquote className="font-accent text-lg italic text-foreground leading-relaxed">
          "{currentQuote.quote}"
        </blockquote>
        <p className="font-body text-sm text-muted-foreground mt-3">
          — {currentQuote.author}
        </p>
      </div>
    </div>
  );
};

export default MotivationalBox;
