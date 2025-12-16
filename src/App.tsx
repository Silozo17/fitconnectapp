import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Coaches from "./pages/Coaches";
import Auth from "./pages/Auth";
import ClientOnboarding from "./pages/onboarding/ClientOnboarding";
import CoachOnboarding from "./pages/onboarding/CoachOnboarding";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminCoaches from "./pages/dashboard/admin/AdminCoaches";
import AdminSettings from "./pages/dashboard/admin/AdminSettings";

// Client Dashboard Pages
import ClientOverview from "./pages/dashboard/client/ClientOverview";
import ClientCoaches from "./pages/dashboard/client/ClientCoaches";
import ClientSessions from "./pages/dashboard/client/ClientSessions";
import ClientMessages from "./pages/dashboard/client/ClientMessages";
import ClientPlans from "./pages/dashboard/client/ClientPlans";
import ClientProgress from "./pages/dashboard/client/ClientProgress";
import ClientSettings from "./pages/dashboard/client/ClientSettings";

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

// Public Pages
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Pricing from "./pages/Pricing";
import ForCoaches from "./pages/ForCoaches";
import HowItWorks from "./pages/HowItWorks";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

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
            <AdminProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/coaches" element={<Coaches />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/for-coaches" element={<ForCoaches />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                {/* Admin Dashboard */}
                <Route path="/dashboard/admin" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/coaches" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminCoaches />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/settings" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                
                {/* Onboarding */}
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

                {/* Client Dashboard Routes */}
                <Route path="/dashboard/client" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientOverview />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/coaches" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientCoaches />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/sessions" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientSessions />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/messages" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientMessages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/messages/:id" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientMessages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/plans" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientPlans />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/progress" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientProgress />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/settings" element={
                  <ProtectedRoute allowedRoles={["client"]}>
                    <ClientSettings />
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
            </AdminProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
