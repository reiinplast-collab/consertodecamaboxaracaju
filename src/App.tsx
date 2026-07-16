import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdmLogin from "./pages/AdmLogin";
import AdmPanel from "./pages/AdmPanel";
import PostDetail from "./pages/PostDetail";
import ThemeProvider from "./components/ThemeProvider";
import { trackVisit } from "./lib/visit-tracker";

const queryClient = new QueryClient();

const VisitTracker = () => {
  const loc = useLocation();
  useEffect(() => {
    if (!loc.pathname.startsWith("/adm")) trackVisit(loc.pathname);
  }, [loc.pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeProvider>
        <BrowserRouter>
          <VisitTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/adm/login" element={<AdmLogin />} />
            <Route path="/adm" element={<AdmPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
