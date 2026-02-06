import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Notes from "./pages/Notes";
import Canvas from "./pages/Canvas";
import NotFound from "./pages/NotFound";
import { UpdateNotification } from "./components/UpdateNotification";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SessionProvider } from "./contexts/SessionContext";
import { NoteTimerProvider } from "./contexts/NoteTimerContext";

const queryClient = new QueryClient();

// Use HashRouter for Electron (file:// protocol), BrowserRouter for web
const Router = (window as any).electron?.isElectron ? HashRouter : BrowserRouter;

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <NoteTimerProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <UpdateNotification />
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/canvas" element={<Canvas />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </NoteTimerProvider>
        </SessionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
