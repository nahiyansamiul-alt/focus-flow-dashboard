import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Timer from "@/components/Timer";
import Clock from "@/components/Clock";
import TodoList from "@/components/TodoList";
import RemindersList from "@/components/RemindersList";
import ContributionGrid from "@/components/ContributionGrid";
import Stats from "@/components/Stats";
import MotivationalBox from "@/components/MotivationalBox";
import ProductivityTips from "@/components/ProductivityTips";
import KeyboardShortcutsModal, { KeyboardShortcutsButton } from "@/components/KeyboardShortcutsModal";
import { ReminderForm } from "@/components/ReminderForm";
import { SessionProvider } from "@/contexts/SessionContext";
import { RemindersProvider } from "@/contexts/RemindersContext";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const IndexContent = () => {
  const navigate = useNavigate();
  const [reminderFormOpen, setReminderFormOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useKeyboardShortcuts({
    onNewReminder: () => setReminderFormOpen(true),
  });

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8 md:p-12 lg:p-16">
      {/* Header */}
      <header className="mb-8 md:mb-16">
        <h1 
          className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-none cursor-pointer hover:text-muted-foreground transition-colors"
          onClick={() => navigate("/notes")}
          title="Go to Notes"
        >
          FOCUS
        </h1>
        <p className="font-accent text-lg sm:text-xl md:text-2xl text-muted-foreground mt-2 italic">
          Track your productivity
        </p>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-12">
        {/* Left Column - Timer, Clock & Motivation */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 lg:space-y-8">
          <Timer />
          <Clock />
          <MotivationalBox />
        </div>

        {/* Right Column - Todo, Reminders, Stats & Tips */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6 lg:space-y-8">
          <TodoList />
          <RemindersList />
          <Stats />
          <ProductivityTips />
        </div>
      </div>

      {/* Contribution Grid - Full Width */}
      <div className="mt-6 sm:mt-8 lg:mt-12">
        <ContributionGrid />
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 lg:mt-16 pt-6 sm:pt-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="font-body text-xs sm:text-sm text-muted-foreground">
            Built with intention. Stay focused.
          </p>
          <KeyboardShortcutsButton onClick={() => setShortcutsOpen(true)} />
        </div>
      </footer>

      <KeyboardShortcutsModal isOpen={shortcutsOpen} onOpenChange={setShortcutsOpen} />

      <ReminderForm isOpen={reminderFormOpen} onOpenChange={setReminderFormOpen} />
    </div>
  );
};

const Index = () => {
  return (
    <SessionProvider>
      <RemindersProvider>
        <IndexContent />
      </RemindersProvider>
    </SessionProvider>
  );
};

export default Index;
