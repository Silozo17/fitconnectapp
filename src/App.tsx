import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
import { AnimationSettingsProvider } from "@/contexts/AnimationSettingsContext";
import { CelebrationListeners } from "@/components/gamification/CelebrationListeners";
import { CountryProvider } from "@/contexts/CountryContext";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import { useAppInitialization } from "@/hooks/useAppInitialization";

import ScrollRestoration from "./components/shared/ScrollRestoration";
import { ReloadPrompt } from "./components/pwa/ReloadPrompt";
import { InstallBanner } from "./components/pwa/InstallBanner";
import { CookieConsentBanner } from "./components/shared/CookieConsentBanner";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SessionActivityTracker } from "@/components/auth/SessionActivityTracker";
import { PushNotificationInitializer } from "@/components/notifications/PushNotificationInitializer";

import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";

// Layout wrapper for app routes (provides AppLocaleProvider)
import { AppLocaleWrapper } from "./components/routing/AppLocaleWrapper";

// Website Router
import { WebsiteRouter } from "./components/routing/WebsiteRouter";

// Auth page (not lazy - critical path)
import Auth from '@/pages/Auth';
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Zoom OAuth redirect (not lazy - must be immediate)
import ZoomOAuth from '@/pages/api/zoom/OAuth';

// Onboarding
const ClientOnboarding = lazy(() => import('@/pages/onboarding/ClientOnboarding'));
const CoachOnboarding = lazy(() => import('@/pages/onboarding/CoachOnboarding'));

// Admin Dashboard Pages
const AdminDashboard = lazy(() => import('@/pages/dashboard/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/dashboard/admin/AdminUsers'));
const AdminCoaches = lazy(() => import('@/pages/dashboard/admin/AdminCoaches'));
const AdminSettings = lazy(() => import('@/pages/dashboard/admin/AdminSettings'));
const AdminTeam = lazy(() => import('@/pages/dashboard/admin/AdminTeam'));
const AdminRevenue = lazy(() => import('@/pages/dashboard/admin/AdminRevenue'));
const AdminAnalytics = lazy(() => import('@/pages/dashboard/admin/AdminAnalytics'));
const AdminReviews = lazy(() => import('@/pages/dashboard/admin/AdminReviews'));
const AdminVerification = lazy(() => import('@/pages/dashboard/admin/AdminVerification'));
const AdminIntegrations = lazy(() => import('@/pages/dashboard/admin/AdminIntegrations'));
const AdminChallenges = lazy(() => import('@/pages/dashboard/admin/AdminChallenges'));
const AdminAuditLog = lazy(() => import('@/pages/dashboard/admin/AdminAuditLog'));
const AdminFeedback = lazy(() => import('@/pages/dashboard/admin/AdminFeedback'));
const AdminBlog = lazy(() => import('@/pages/dashboard/admin/AdminBlog'));
const AdminBoosts = lazy(() => import('@/pages/dashboard/admin/AdminBoosts'));
const MyProfile = lazy(() => import('@/pages/dashboard/MyProfile'));
const DashboardRedirect = lazy(() => import('@/pages/dashboard/DashboardRedirect'));

// Client Dashboard Pages
const ClientOverview = lazy(() => import('@/pages/dashboard/client/ClientOverview'));
const ClientCoaches = lazy(() => import('@/pages/dashboard/client/ClientCoaches'));
const ClientSessions = lazy(() => import('@/pages/dashboard/client/ClientSessions'));
const ClientMessages = lazy(() => import('@/pages/dashboard/client/ClientMessages'));
const ClientPlans = lazy(() => import('@/pages/dashboard/client/ClientPlans'));
const ClientHabits = lazy(() => import('@/pages/dashboard/client/ClientHabits'));
const ClientProgress = lazy(() => import('@/pages/dashboard/client/ClientProgress'));
const ClientSettings = lazy(() => import('@/pages/dashboard/client/ClientSettings'));
const ClientFavourites = lazy(() => import('@/pages/dashboard/client/ClientFavourites'));
const ClientAchievements = lazy(() => import('@/pages/dashboard/client/ClientAchievements'));
const ClientLeaderboard = lazy(() => import('@/pages/dashboard/client/ClientLeaderboard'));
const ClientChallenges = lazy(() => import('@/pages/dashboard/client/ClientChallenges'));
const ClientIntegrations = lazy(() => import('@/pages/dashboard/client/ClientIntegrations'));
const ClientGrocery = lazy(() => import('@/pages/dashboard/client/ClientGrocery'));
const ClientConnections = lazy(() => import('@/pages/dashboard/client/ClientConnections'));
const ClientLibrary = lazy(() => import('@/pages/dashboard/client/ClientLibrary'));
const ClientTools = lazy(() => import('@/pages/dashboard/client/ClientTools'));
const ClientReceipts = lazy(() => import('@/pages/dashboard/client/ClientReceipts'));
const ClientFindCoaches = lazy(() => import('@/pages/dashboard/client/ClientFindCoaches'));
const ClientCoachProfile = lazy(() => import('@/pages/dashboard/client/ClientCoachProfile'));
const ClientMarketplace = lazy(() => import('@/pages/dashboard/client/ClientMarketplace'));
const ClientMarketplaceProduct = lazy(() => import('@/pages/dashboard/client/ClientMarketplaceProduct'));
const ClientMarketplaceBundle = lazy(() => import('@/pages/dashboard/client/ClientMarketplaceBundle'));
const ClientPlanDetail = lazy(() => import('@/pages/dashboard/client/ClientPlanDetail'));
const ClientFoodDiary = lazy(() => import('@/pages/dashboard/client/ClientFoodDiary'));
const ClientTrainingLogs = lazy(() => import('@/pages/dashboard/client/ClientTrainingLogs'));

// Coach Dashboard Pages
const CoachOverview = lazy(() => import('@/pages/dashboard/coach/CoachOverview'));
const CoachClients = lazy(() => import('@/pages/dashboard/coach/CoachClients'));
const CoachClientDetail = lazy(() => import('@/pages/dashboard/coach/CoachClientDetail'));
const CoachSchedule = lazy(() => import('@/pages/dashboard/coach/CoachSchedule'));
const CoachMessages = lazy(() => import('@/pages/dashboard/coach/CoachMessages'));
const CoachPlans = lazy(() => import('@/pages/dashboard/coach/CoachPlans'));
const CoachPlanBuilder = lazy(() => import('@/pages/dashboard/coach/CoachPlanBuilder'));
const CoachNutritionBuilder = lazy(() => import('@/pages/dashboard/coach/CoachNutritionBuilder'));
const CoachEarnings = lazy(() => import('@/pages/dashboard/coach/CoachEarnings'));
const CoachSettings = lazy(() => import('@/pages/dashboard/coach/CoachSettings'));
const CoachPackages = lazy(() => import('@/pages/dashboard/coach/CoachPackages'));
const CoachIntegrations = lazy(() => import('@/pages/dashboard/coach/CoachIntegrations'));
const CoachReviews = lazy(() => import('@/pages/dashboard/coach/CoachReviews'));
const CoachFinancial = lazy(() => import('@/pages/dashboard/coach/CoachFinancial'));
const CoachPipeline = lazy(() => import('@/pages/dashboard/coach/CoachPipeline'));
const CoachBoost = lazy(() => import('@/pages/dashboard/coach/CoachBoost'));
const CoachAchievements = lazy(() => import('@/pages/dashboard/coach/CoachAchievements'));
const CoachConnections = lazy(() => import('@/pages/dashboard/coach/CoachConnections'));
const CoachProducts = lazy(() => import('@/pages/dashboard/coach/CoachProducts'));
const CoachPackageAnalytics = lazy(() => import('@/pages/dashboard/coach/CoachPackageAnalytics'));
const CoachOutcomeShowcase = lazy(() => import('@/pages/dashboard/coach/CoachOutcomeShowcase'));
const CoachAIRecommendations = lazy(() => import('@/pages/dashboard/coach/CoachAIRecommendations'));
const CoachScheduledCheckins = lazy(() => import('@/pages/dashboard/coach/CoachScheduledCheckins'));
const CoachAutomations = lazy(() => import('@/pages/dashboard/coach/CoachAutomations'));
const CoachWearableDashboard = lazy(() => import('@/pages/dashboard/coach/CoachWearableDashboard'));
const CoachClientComparison = lazy(() => import('@/pages/dashboard/coach/CoachClientComparison'));
const CoachCaseStudies = lazy(() => import('@/pages/dashboard/coach/CoachCaseStudies'));

// Shared Dashboard Pages
const Notifications = lazy(() => import('@/pages/dashboard/Notifications'));

// Documentation Pages
const DocsHub = lazy(() => import('@/pages/docs/DocsHub'));
const GettingStarted = lazy(() => import('@/pages/docs/GettingStarted'));
const DocsClientOverview = lazy(() => import('@/pages/docs/client/ClientOverview'));
const DocsClientProfile = lazy(() => import('@/pages/docs/client/ClientProfile'));
const DocsClientCoaches = lazy(() => import('@/pages/docs/client/ClientCoaches'));
const DocsClientSessions = lazy(() => import('@/pages/docs/client/ClientSessions'));
const DocsClientPlans = lazy(() => import('@/pages/docs/client/ClientPlans'));
const DocsClientProgress = lazy(() => import('@/pages/docs/client/ClientProgress'));
const DocsClientAchievements = lazy(() => import('@/pages/docs/client/ClientAchievements'));
const DocsClientSettings = lazy(() => import('@/pages/docs/client/ClientSettingsDocs'));
const DocsClientHabits = lazy(() => import('@/pages/docs/client/ClientHabits'));
const DocsClientGrocery = lazy(() => import('@/pages/docs/client/ClientGrocery'));
const DocsClientChallenges = lazy(() => import('@/pages/docs/client/ClientChallenges'));
const DocsClientTools = lazy(() => import('@/pages/docs/client/ClientToolsDocs'));
const DocsClientLibrary = lazy(() => import('@/pages/docs/client/ClientLibrary'));
const DocsClientConnections = lazy(() => import('@/pages/docs/client/ClientConnectionsDocs'));
const DocsCoachOverview = lazy(() => import('@/pages/docs/coach/CoachOverview'));
const DocsCoachOnboarding = lazy(() => import('@/pages/docs/coach/CoachOnboarding'));
const DocsCoachProfile = lazy(() => import('@/pages/docs/coach/CoachProfile'));
const DocsCoachEarnings = lazy(() => import('@/pages/docs/coach/CoachEarnings'));
const DocsCoachClients = lazy(() => import('@/pages/docs/coach/CoachClientsDocs'));
const DocsCoachMessaging = lazy(() => import('@/pages/docs/coach/CoachMessagingDocs'));
const DocsCoachPlans = lazy(() => import('@/pages/docs/coach/CoachPlansDocs'));
const DocsCoachSchedule = lazy(() => import('@/pages/docs/coach/CoachScheduleDocs'));
const DocsCoachPackages = lazy(() => import('@/pages/docs/coach/CoachPackagesDocs'));
const DocsCoachVerification = lazy(() => import('@/pages/docs/coach/CoachVerificationDocs'));
const DocsCoachPipeline = lazy(() => import('@/pages/docs/coach/CoachPipelineDocs'));
const DocsCoachProducts = lazy(() => import('@/pages/docs/coach/CoachProductsDocs'));
const DocsCoachBoost = lazy(() => import('@/pages/docs/coach/CoachBoostDocs'));
const DocsCoachNutrition = lazy(() => import('@/pages/docs/coach/CoachNutritionDocs'));
const DocsCoachAI = lazy(() => import('@/pages/docs/coach/CoachAIDocs'));
const DocsCoachReviews = lazy(() => import('@/pages/docs/coach/CoachReviewsDocs'));
const DocsCoachAutomations = lazy(() => import('@/pages/docs/coach/CoachAutomationsOverview'));
const DocsCoachDropoffRescue = lazy(() => import('@/pages/docs/coach/automations/DropoffRescueDocs'));
const DocsCoachMilestones = lazy(() => import('@/pages/docs/coach/automations/MilestoneDocs'));
const DocsCoachReminders = lazy(() => import('@/pages/docs/coach/automations/ReminderDocs'));
const DocsCoachScheduledCheckins = lazy(() => import('@/pages/docs/coach/automations/ScheduledCheckinsDocs'));
const DocsAdminOverview = lazy(() => import('@/pages/docs/admin/AdminOverview'));
const DocsAdminDashboard = lazy(() => import('@/pages/docs/admin/AdminDashboardDocs'));
const DocsAdminUsers = lazy(() => import('@/pages/docs/admin/AdminUsersDocs'));
const DocsAdminCoaches = lazy(() => import('@/pages/docs/admin/AdminCoachesDocs'));
const DocsAdminTeam = lazy(() => import('@/pages/docs/admin/AdminTeamDocs'));
const DocsAdminRevenue = lazy(() => import('@/pages/docs/admin/AdminRevenueDocs'));
const DocsAdminAnalytics = lazy(() => import('@/pages/docs/admin/AdminAnalyticsDocs'));
const DocsAdminChallenges = lazy(() => import('@/pages/docs/admin/AdminChallengesDocs'));
const DocsAdminBlog = lazy(() => import('@/pages/docs/admin/AdminBlogDocs'));
const DocsAdminBoosts = lazy(() => import('@/pages/docs/admin/AdminBoostsDocs'));
const DocsAdminIntegrations = lazy(() => import('@/pages/docs/admin/AdminIntegrationsDocs'));
const DocsAdminAudit = lazy(() => import('@/pages/docs/admin/AdminAuditDocs'));

// Integration Documentation
const ZoomIntegrationDocs = lazy(() => import('@/pages/docs/integrations/ZoomIntegration'));
const GoogleMeetIntegrationDocs = lazy(() => import('@/pages/docs/integrations/GoogleMeetIntegration'));
const GoogleCalendarIntegrationDocs = lazy(() => import('@/pages/docs/integrations/GoogleCalendarIntegration'));
const AppleCalendarIntegrationDocs = lazy(() => import('@/pages/docs/integrations/AppleCalendarIntegration'));
const FitbitIntegrationDocs = lazy(() => import('@/pages/docs/integrations/FitbitIntegration'));
const WearablesOverviewDocs = lazy(() => import('@/pages/docs/integrations/WearablesOverview'));

// Additional Client Documentation
const DocsClientFoodDiary = lazy(() => import('@/pages/docs/client/ClientFoodDiaryDocs'));
const DocsClientTrainingLogs = lazy(() => import('@/pages/docs/client/ClientTrainingLogsDocs'));
const DocsClientDataPrivacy = lazy(() => import('@/pages/docs/client/ClientDataPrivacyDocs'));
const DocsClientMarketplace = lazy(() => import('@/pages/docs/client/ClientMarketplaceDocs'));
const DocsClientReceipts = lazy(() => import('@/pages/docs/client/ClientReceiptsDocs'));
const DocsClientSecurity = lazy(() => import('@/pages/docs/client/ClientSecurityDocs'));
const DocsClientWearables = lazy(() => import('@/pages/docs/client/ClientWearablesDocs'));

// Subscribe pages
const Subscribe = lazy(() => import('@/pages/Subscribe'));
const SubscribeSuccess = lazy(() => import('@/pages/SubscribeSuccess'));

// Language persistence component (must be inside i18n context)
function LanguagePersistence() {
  useLanguagePersistence();
  return null;
}

// Despia native initialization (Android status bar config)
function DespiaInitializer() {
  useAppInitialization();
  return null;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache
      refetchOnWindowFocus: false, // Prevent refetches when switching tabs
      retry: 1, // Single retry for failed requests
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <ReloadPrompt />
          <DespiaInitializer />
          <BrowserRouter>
            <InstallBanner />
            <ScrollRestoration />
            <CookieConsentProvider>
              <CookieConsentBanner />
              <CountryProvider>
                <AuthProvider>
                  <SessionActivityTracker />
                  <PushNotificationInitializer />
                  <AnimationSettingsProvider>
                    <CelebrationProvider>
                      <CelebrationListeners />
                      <AdminProvider>
                        <LocaleProvider>
                          <LanguagePersistence />
                          <Routes>
                            {/* Zoom OAuth redirect - must be outside AppLocaleWrapper for isolation */}
                            <Route path="/api/zoom/oauth" element={<ZoomOAuth />} />
                            
                            {/* App routes - wrapped with AppLocaleWrapper (layout route pattern) */}
                            <Route element={<AppLocaleWrapper />}>
                              {/* Auth */}
                              <Route path="/auth" element={<Auth />} />
                              <Route path="/auth/reset-password" element={<Suspense fallback={<PageLoadingSpinner />}><ResetPassword /></Suspense>} />
                              
                              {/* Subscription Pages */}
                              <Route path="/subscribe" element={<Subscribe />} />
                              <Route path="/subscribe/success" element={<SubscribeSuccess />} />
                              
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
                              
                              {/* Documentation Routes */}
                              <Route path="/docs" element={<DocsHub />} />
                              <Route path="/docs/getting-started" element={<GettingStarted />} />
                              <Route path="/docs/client" element={<DocsClientOverview />} />
                              <Route path="/docs/client/profile" element={<DocsClientProfile />} />
                              <Route path="/docs/client/coaches" element={<DocsClientCoaches />} />
                              <Route path="/docs/client/sessions" element={<DocsClientSessions />} />
                              <Route path="/docs/client/plans" element={<DocsClientPlans />} />
                              <Route path="/docs/client/progress" element={<DocsClientProgress />} />
                              <Route path="/docs/client/achievements" element={<DocsClientAchievements />} />
                              <Route path="/docs/client/settings" element={<DocsClientSettings />} />
                              <Route path="/docs/client/habits" element={<DocsClientHabits />} />
                              <Route path="/docs/client/grocery" element={<DocsClientGrocery />} />
                              <Route path="/docs/client/challenges" element={<DocsClientChallenges />} />
                              <Route path="/docs/client/tools" element={<DocsClientTools />} />
                              <Route path="/docs/client/library" element={<DocsClientLibrary />} />
                              <Route path="/docs/client/connections" element={<DocsClientConnections />} />
                              <Route path="/docs/client/food-diary" element={<DocsClientFoodDiary />} />
                              <Route path="/docs/client/training-logs" element={<DocsClientTrainingLogs />} />
                              <Route path="/docs/client/data-privacy" element={<DocsClientDataPrivacy />} />
                              <Route path="/docs/client/marketplace" element={<DocsClientMarketplace />} />
                              <Route path="/docs/client/receipts" element={<DocsClientReceipts />} />
                              <Route path="/docs/client/security" element={<DocsClientSecurity />} />
                              <Route path="/docs/client/wearables" element={<DocsClientWearables />} />
                              <Route path="/docs/coach" element={<DocsCoachOverview />} />
                              <Route path="/docs/coach/onboarding" element={<DocsCoachOnboarding />} />
                              <Route path="/docs/coach/profile" element={<DocsCoachProfile />} />
                              <Route path="/docs/coach/earnings" element={<DocsCoachEarnings />} />
                              <Route path="/docs/coach/clients" element={<DocsCoachClients />} />
                              <Route path="/docs/coach/messaging" element={<DocsCoachMessaging />} />
                              <Route path="/docs/coach/plans" element={<DocsCoachPlans />} />
                              <Route path="/docs/coach/schedule" element={<DocsCoachSchedule />} />
                              <Route path="/docs/coach/packages" element={<DocsCoachPackages />} />
                              <Route path="/docs/coach/verification" element={<DocsCoachVerification />} />
                              <Route path="/docs/coach/pipeline" element={<DocsCoachPipeline />} />
                              <Route path="/docs/coach/products" element={<DocsCoachProducts />} />
                              <Route path="/docs/coach/boost" element={<DocsCoachBoost />} />
                              <Route path="/docs/coach/nutrition" element={<DocsCoachNutrition />} />
                              <Route path="/docs/coach/ai" element={<DocsCoachAI />} />
                              <Route path="/docs/coach/reviews" element={<DocsCoachReviews />} />
                              <Route path="/docs/coach/automations" element={<DocsCoachAutomations />} />
                              <Route path="/docs/coach/automations/dropoff-rescue" element={<DocsCoachDropoffRescue />} />
                              <Route path="/docs/coach/automations/milestones" element={<DocsCoachMilestones />} />
                              <Route path="/docs/coach/automations/reminders" element={<DocsCoachReminders />} />
                              <Route path="/docs/coach/automations/checkins" element={<DocsCoachScheduledCheckins />} />
                              
                              {/* Protected Admin Documentation Routes */}
                              <Route path="/docs/admin" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminOverview /></ProtectedRoute>} />
                              <Route path="/docs/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminDashboard /></ProtectedRoute>} />
                              <Route path="/docs/admin/users" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminUsers /></ProtectedRoute>} />
                              <Route path="/docs/admin/coaches" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminCoaches /></ProtectedRoute>} />
                              <Route path="/docs/admin/team" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminTeam /></ProtectedRoute>} />
                              <Route path="/docs/admin/revenue" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminRevenue /></ProtectedRoute>} />
                              <Route path="/docs/admin/analytics" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminAnalytics /></ProtectedRoute>} />
                              <Route path="/docs/admin/challenges" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminChallenges /></ProtectedRoute>} />
                              <Route path="/docs/admin/blog" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminBlog /></ProtectedRoute>} />
                              <Route path="/docs/admin/boosts" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminBoosts /></ProtectedRoute>} />
                              <Route path="/docs/admin/integrations" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminIntegrations /></ProtectedRoute>} />
                              <Route path="/docs/admin/audit" element={<ProtectedRoute allowedRoles={["admin", "manager", "staff"]}><DocsAdminAudit /></ProtectedRoute>} />
                              
                              {/* Public Integration Documentation Routes */}
                              <Route path="/docs/integrations/zoom" element={<ZoomIntegrationDocs />} />
                              <Route path="/docs/integrations/google-meet" element={<GoogleMeetIntegrationDocs />} />
                              <Route path="/docs/integrations/google-calendar" element={<GoogleCalendarIntegrationDocs />} />
                              <Route path="/docs/integrations/apple-calendar" element={<AppleCalendarIntegrationDocs />} />
                              <Route path="/docs/integrations/fitbit" element={<FitbitIntegrationDocs />} />
                              <Route path="/docs/integrations/wearables" element={<WearablesOverviewDocs />} />
                              
                              {/* Dashboard Redirect */}
                              <Route path="/dashboard" element={
                                <ProtectedRoute allowedRoles={["client", "coach", "admin", "manager", "staff"]}>
                                  <DashboardRedirect />
                                </ProtectedRoute>
                              } />
                              
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
                              <Route path="/dashboard/admin/boosts" element={
                                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                                  <AdminBoosts />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/analytics" element={
                                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                                  <AdminAnalytics />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/profile" element={
                                <ProtectedRoute allowedRoles={["admin", "manager", "staff", "coach", "client"]}>
                                  <MyProfile />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/settings" element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                  <AdminSettings />
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
                              <Route path="/dashboard/admin/integrations" element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                  <AdminIntegrations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/challenges" element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                  <AdminChallenges />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/audit" element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                  <AdminAuditLog />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/feedback" element={
                                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                                  <AdminFeedback />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/blog" element={
                                <ProtectedRoute allowedRoles={["admin", "manager"]}>
                                  <AdminBlog />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/notifications" element={
                                <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                                  <Notifications />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/messages" element={
                                <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                                  <CoachMessages />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/admin/messages/:participantId" element={
                                <ProtectedRoute allowedRoles={["admin", "manager", "staff"]}>
                                  <CoachMessages />
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
                              <Route path="/dashboard/client/find-coaches" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientFindCoaches />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/find-coaches/:coachSlug" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientCoachProfile />
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
                              <Route path="/dashboard/client/plans/:planId" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientPlanDetail />
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
                              <Route path="/dashboard/client/integrations" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientIntegrations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/grocery" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientGrocery />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/library" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientLibrary />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/marketplace/bundles/:bundleId" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientMarketplaceBundle />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/marketplace/:productSlug" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientMarketplaceProduct />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/marketplace" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientMarketplace />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/food-diary" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientFoodDiary />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/training-logs" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientTrainingLogs />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/tools" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientTools />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/connections" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientConnections />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/client/receipts" element={
                                <ProtectedRoute allowedRoles={["client", "admin"]}>
                                  <ClientReceipts />
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
                              <Route path="/dashboard/coach/pipeline" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachPipeline />
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
                              <Route path="/dashboard/coach/connections" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachConnections />
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
                              <Route path="/dashboard/coach/plans/nutrition/:planId" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachNutritionBuilder />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/packages" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachPackages />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/achievements" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachAchievements />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/earnings" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachEarnings />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/financial" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachFinancial />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/boost" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachBoost />
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
                              <Route path="/dashboard/coach/integrations" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachIntegrations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/products" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachProducts />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/analytics/packages" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachPackageAnalytics />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/showcase" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachOutcomeShowcase />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/ai-recommendations" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachAIRecommendations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/scheduled-checkins" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachAutomations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/automations" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachAutomations />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/wearables" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachWearableDashboard />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/compare" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachClientComparison />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/coach/case-studies" element={
                                <ProtectedRoute allowedRoles={["coach"]}>
                                  <CoachCaseStudies />
                                </ProtectedRoute>
                              } />
                              <Route path="/dashboard/notifications" element={
                                <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                  <Notifications />
                                </ProtectedRoute>
                              } />
                            </Route>
                            
                            {/* Website routes - WITH locale URL logic (must be last) */}
                            <Route path="/*" element={<WebsiteRouter />} />
                        </Routes>
                        </LocaleProvider>
                      </AdminProvider>
                    </CelebrationProvider>
                  </AnimationSettingsProvider>
                </AuthProvider>
              </CountryProvider>
            </CookieConsentProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
