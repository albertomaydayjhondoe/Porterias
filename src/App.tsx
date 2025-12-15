import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Archive from "./pages/Archive";
import About from "./pages/About";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import Porteria from "./pages/Porteria";
import NotFound from "./pages/NotFound";

// Query client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  console.log("App component rendering...");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename="/Porterias/">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/archivo" element={<Archive />} />
              <Route path="/auth" element={<Auth />} />
              {/* Porteria: Hidden from navigation menu but accessible via direct URL */}
              <Route path="/porteria" element={<Porteria />} />
              <Route path="/sobre-mi" element={<About />} />
              <Route path="/admin" element={<Admin />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
