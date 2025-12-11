import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Coaches from "./pages/Coaches";
import Auth from "./pages/Auth";
import ClientOnboarding from "./pages/onboarding/ClientOnboarding";
import CoachOnboarding from "./pages/onboarding/CoachOnboarding";
import ClientDashboard from "./pages/dashboard/ClientDashboard";
import CoachDashboard from "./pages/dashboard/CoachDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/coaches" element={<Coaches />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding/client" element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/onboarding/coach" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/client" element={
                <ProtectedRoute allowedRoles={["client"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachDashboard />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
