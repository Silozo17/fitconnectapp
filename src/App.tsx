import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Coaches from "./pages/Coaches";
import CoachDetail from "./pages/CoachDetail";
import Auth from "./pages/Auth";
import ClientOnboarding from "./pages/onboarding/ClientOnboarding";
import CoachOnboarding from "./pages/onboarding/CoachOnboarding";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/dashboard/admin/AdminUsers";
import AdminCoaches from "./pages/dashboard/admin/AdminCoaches";
import AdminSettings from "./pages/dashboard/admin/AdminSettings";
import AdminTeam from "./pages/dashboard/admin/AdminTeam";
import AdminRevenue from "./pages/dashboard/admin/AdminRevenue";
import AdminAnalytics from "./pages/dashboard/admin/AdminAnalytics";
import AdminProfile from "./pages/dashboard/admin/AdminProfile";
import AdminPlatformPlans from "./pages/dashboard/admin/AdminPlatformPlans";
import AdminFeatures from "./pages/dashboard/admin/AdminFeatures";
import AdminReviews from "./pages/dashboard/admin/AdminReviews";
import AdminVerification from "./pages/dashboard/admin/AdminVerification";

// Coach Dashboard Pages
import ClientOverview from "./pages/dashboard/client/ClientOverview";
import ClientCoaches from "./pages/dashboard/client/ClientCoaches";
import ClientSessions from "./pages/dashboard/client/ClientSessions";
import ClientMessages from "./pages/dashboard/client/ClientMessages";
import ClientPlans from "./pages/dashboard/client/ClientPlans";
import ClientHabits from "./pages/dashboard/client/ClientHabits";
import ClientProgress from "./pages/dashboard/client/ClientProgress";
import ClientSettings from "./pages/dashboard/client/ClientSettings";
import ClientFavourites from "./pages/dashboard/client/ClientFavourites";
import ClientAchievements from "./pages/dashboard/client/ClientAchievements";
import ClientLeaderboard from "./pages/dashboard/client/ClientLeaderboard";
import ClientChallenges from "./pages/dashboard/client/ClientChallenges";

// Coach Dashboard Pages
import CoachOverview from "./pages/dashboard/coach/CoachOverview";
import CoachClients from "./pages/dashboard/coach/CoachClients";
import CoachClientDetail from "./pages/dashboard/coach/CoachClientDetail";
import CoachSchedule from "./pages/dashboard/coach/CoachSchedule";
import CoachMessages from "./pages/dashboard/coach/CoachMessages";
import CoachPlans from "./pages/dashboard/coach/CoachPlans";
import CoachPlanBuilder from "./pages/dashboard/coach/CoachPlanBuilder";
import CoachNutritionBuilder from "./pages/dashboard/coach/CoachNutritionBuilder";
import CoachEarnings from "./pages/dashboard/coach/CoachEarnings";
import CoachSettings from "./pages/dashboard/coach/CoachSettings";
import CoachPackages from "./pages/dashboard/coach/CoachPackages";
import CoachReviews from "./pages/dashboard/coach/CoachReviews";
import CoachVerification from "./pages/dashboard/coach/CoachVerification";

// Shared Dashboard Pages
import Notifications from "./pages/dashboard/Notifications";

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
              <LocaleProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/coaches" element={<Coaches />} />
                <Route path="/coaches/:id" element={<CoachDetail />} />
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
                  <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/users" element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/coaches" element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <AdminCoaches />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/team" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminTeam />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/revenue" element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <AdminRevenue />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/analytics" element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/profile" element={
                  <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                    <AdminProfile />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/settings" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/plans" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminPlatformPlans />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/features" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminFeatures />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/reviews" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminReviews />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/admin/verification" element={
                  <ProtectedRoute allowedRoles={["admin", "manager"]}>
                    <AdminVerification />
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
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientOverview />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/coaches" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientCoaches />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/favourites" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientFavourites />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/sessions" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientSessions />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/messages" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientMessages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/messages/:id" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientMessages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/plans" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientPlans />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/habits" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientHabits />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/progress" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientProgress />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/achievements" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientAchievements />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/leaderboard" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientLeaderboard />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/challenges" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientChallenges />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/settings" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <ClientSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/client/notifications" element={
                  <ProtectedRoute allowedRoles={["client", "admin"]}>
                    <Notifications />
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
                <Route path="/dashboard/coach/plans/nutrition/new" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachNutritionBuilder />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/packages" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachPackages />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/earnings" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachEarnings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/reviews" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachReviews />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/settings" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachSettings />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/notifications" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/coach/verification" element={
                  <ProtectedRoute allowedRoles={["coach"]}>
                    <CoachVerification />
                  </ProtectedRoute>
                } />
                <Route path="/dashboard/notifications" element={
                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                    <Notifications />
                  </ProtectedRoute>
                } />
              
                <Route path="*" element={<NotFound />} />
              </Routes>
              </LocaleProvider>
            </AdminProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
