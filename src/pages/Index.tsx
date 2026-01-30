import { useNavigate } from "react-router-dom";
import Timer from "@/components/Timer";
import Clock from "@/components/Clock";
import TodoList from "@/components/TodoList";
import ContributionGrid from "@/components/ContributionGrid";
import Stats from "@/components/Stats";
import { SessionProvider } from "@/contexts/SessionContext";

const Index = () => {
  const navigate = useNavigate();

  return (
    <SessionProvider>
      <div className="min-h-screen bg-background p-8 md:p-12 lg:p-16">
        {/* Header */}
        <header className="mb-16">
          <h1 
            className="font-display text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none cursor-pointer hover:text-muted-foreground transition-colors"
            onClick={() => navigate("/notes")}
            title="Go to Notes"
          >
            FOCUS
          </h1>
          <p className="font-accent text-xl md:text-2xl text-muted-foreground mt-2 italic">
            Track your productivity
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column - Timer & Clock */}
          <div className="lg:col-span-5 space-y-8">
            <Timer />
            <Clock />
          </div>

          {/* Right Column - Todo & Stats */}
          <div className="lg:col-span-7 space-y-8">
            <TodoList />
            <Stats />
          </div>
        </div>

        {/* Contribution Grid - Full Width */}
        <div className="mt-12">
          <ContributionGrid />
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-border">
          <p className="font-body text-sm text-muted-foreground">
            Built with intention. Stay focused.
          </p>
        </footer>
      </div>
    </SessionProvider>
  );
};

export default Index;
