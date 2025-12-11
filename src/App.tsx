import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Coaches from "./pages/Coaches";
import Auth from "./pages/Auth";
import ClientOnboarding from "./pages/onboarding/ClientOnboarding";
import CoachOnboarding from "./pages/onboarding/CoachOnboarding";
import ClientDashboard from "./pages/dashboard/ClientDashboard";

// Coach Dashboard Pages
import CoachOverview from "./pages/dashboard/coach/CoachOverview";
import CoachClients from "./pages/dashboard/coach/CoachClients";
import CoachClientDetail from "./pages/dashboard/coach/CoachClientDetail";
import CoachSchedule from "./pages/dashboard/coach/CoachSchedule";
import CoachMessages from "./pages/dashboard/coach/CoachMessages";
import CoachPlans from "./pages/dashboard/coach/CoachPlans";
import CoachPlanBuilder from "./pages/dashboard/coach/CoachPlanBuilder";
import CoachEarnings from "./pages/dashboard/coach/CoachEarnings";
import CoachSettings from "./pages/dashboard/coach/CoachSettings";

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
              
              {/* Coach Dashboard Routes */}
              <Route path="/dashboard/coach" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachOverview />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/clients" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachClients />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/clients/:id" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachClientDetail />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/schedule" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachSchedule />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/messages" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachMessages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/messages/:id" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachMessages />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/plans" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachPlans />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/plans/new" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachPlanBuilder />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/plans/:id" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachPlanBuilder />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/earnings" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachEarnings />
                </ProtectedRoute>
              } />
              <Route path="/dashboard/coach/settings" element={
                <ProtectedRoute allowedRoles={["coach"]}>
                  <CoachSettings />
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
