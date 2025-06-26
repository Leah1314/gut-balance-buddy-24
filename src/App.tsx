

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import Auth from "./pages/Auth";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthGuard from "./components/AuthGuard";
import GutHealthCoach from "./components/GutHealthCoach";
import AnalyticsPage from "./pages/Analytics";
import { AuthProvider } from "./hooks/useAuth";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              } />
              <Route path="/analytics" element={
                <AuthGuard>
                  <AnalyticsPage />
                </AuthGuard>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
            <GutHealthCoach />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

