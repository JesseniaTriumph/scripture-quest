import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import FillInTheBlank from "./pages/FillInTheBlank";
import PreviewMode from "./pages/PreviewMode";
import CopyMode from "./pages/CopyMode";
import WordScramble from "./pages/WordScramble";
import RecallMode from "./pages/RecallMode";
import QuickTap from "./pages/QuickTap";
import MemoryMatch from "./pages/MemoryMatch";
import VerseBuilder from "./pages/VerseBuilder";
import Review from "./pages/Review";
import NotFound from "./pages/NotFound";
import { GameSelectionScreen } from "@/components/GameSelectionScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/review" element={<Review />} />
            <Route path="/game-select" element={<GameSelectionScreen />} />
            <Route path="/game/preview" element={<PreviewMode />} />
            <Route path="/game/copy" element={<CopyMode />} />
            <Route path="/game/fill-blank" element={<FillInTheBlank />} />
            <Route path="/game/scramble" element={<WordScramble />} />
            <Route path="/game/verse-builder" element={<VerseBuilder />} />
            <Route path="/game/memory-match" element={<MemoryMatch />} />
            <Route path="/game/recall" element={<RecallMode />} />
            <Route path="/game/quick-tap" element={<QuickTap />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
