
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import PWAManager from "@/components/pwa/PWAManager";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";
import "./App.css";
import "./i18n";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            {import.meta.env.DEV && <Route path="/design-preview" element={<Index />} />}
            {import.meta.env.DEV && <Route path="/auth-preview" element={<Auth previewMode />} />}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Index />
                </AuthGuard>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ShadcnToaster />
          <SonnerToaster />
          <PWAManager />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
