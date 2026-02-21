import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CelebrationProvider } from "@/contexts/CelebrationContext";
import { ResumeManagerProvider } from "@/contexts/ResumeManagerContext";
import { AnimationSettingsProvider } from "@/contexts/AnimationSettingsContext";
import { CelebrationListeners } from "@/components/gamification/CelebrationListeners";
import { CountryProvider } from "@/contexts/CountryContext";
import { useLanguagePersistence } from "@/hooks/useLanguagePersistence";
import { useAppInitialization } from "@/hooks/useAppInitialization";
import { useDeferredMount } from "@/hooks/useDeferredMount";
import { HydrationSignal } from "@/components/shared/HydrationSignal";
import { isDespia } from "@/lib/despia";
import { useEnvironment } from "@/hooks/useEnvironment";
import { setupQueryLogging } from "@/lib/query-logger";

import ScrollRestoration from "./components/shared/ScrollRestoration";
import { ReloadPrompt } from "./components/pwa/ReloadPrompt";
import { InstallBanner } from "./components/pwa/InstallBanner";
import { CookieConsentBanner } from "./components/shared/CookieConsentBanner";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SessionActivityTracker } from "@/components/auth/SessionActivityTracker";
import { PushNotificationInitializer } from "@/components/notifications/PushNotificationInitializer";

import PageLoadingSpinner from "@/components/shared/PageLoadingSpinner";

// Layout wrappers for routes (provides AppLocaleProvider with different fallbacks)
import { AppLocaleWrapper } from "./components/routing/AppLocaleWrapper"; // Dashboard/onboarding - DashboardSkeleton fallback
import { WebsiteLocaleWrapper } from "./components/routing/WebsiteLocaleWrapper"; // Docs/auth/subscribe - simple spinner fallback

// Website Router
import { WebsiteRouter } from "./components/routing/WebsiteRouter";
import ClientCoachRedirect from "./components/routing/ClientCoachRedirect";

// Auth page (not lazy - critical path)
import Auth from '@/pages/Auth';
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ReviewHandler = lazy(() => import('@/pages/ReviewHandler'));
const Reset = lazy(() => import('@/pages/Reset'));

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
const AdminDebugConsole = lazy(() => import('@/pages/dashboard/admin/AdminDebugConsole'));
const AdminGyms = lazy(() => import('@/pages/dashboard/admin/AdminGyms'));
const AdminMessages = lazy(() => import('@/pages/dashboard/admin/AdminMessages'));
const AdminAutomations = lazy(() => import('@/pages/dashboard/admin/AdminAutomations'));
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
const ClientHealthHistory = lazy(() => import('@/pages/dashboard/client/ClientHealthHistory'));
const DisciplineSetup = lazy(() => import('@/pages/dashboard/client/DisciplineSetup'));
const ClientMyGyms = lazy(() => import('@/pages/dashboard/client/MyGyms'));

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
const CoachGroupClasses = lazy(() => import('@/pages/dashboard/coach/CoachGroupClasses'));
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
const CoachCommunityPage = lazy(() => import('@/pages/dashboard/coach/CoachCommunity'));
const CoachCommunityDetailPage = lazy(() => import('@/pages/dashboard/coach/CoachCommunityDetail'));
const ClientCommunityPage = lazy(() => import('@/pages/dashboard/client/ClientCommunity'));
const ClientCommunityDetailPage = lazy(() => import('@/pages/dashboard/client/ClientCommunityDetail'));

// Gym Admin Pages
const GymAuth = lazy(() => import('@/pages/gym/GymAuth'));
const GymAdminDashboard = lazy(() => import('@/pages/gym/GymAdminDashboard'));
const GymAdminMembers = lazy(() => import('@/pages/gym/GymAdminMembers'));
const GymAdminSchedule = lazy(() => import('@/pages/gym/GymAdminSchedule'));
const GymAdminClasses = lazy(() => import('@/pages/gym/GymAdminClasses'));
const GymAdminMemberships = lazy(() => import('@/pages/gym/GymAdminMemberships'));
const GymAdminSettings = lazy(() => import('@/pages/gym/GymAdminSettings'));
const GymAdminLocations = lazy(() => import('@/pages/gym/GymAdminLocations'));
const GymMemberPortal = lazy(() => import('@/pages/gym/GymMemberPortal'));
const GymCheckIn = lazy(() => import('@/pages/gym/GymCheckIn'));
const GymMemberSignup = lazy(() => import('@/pages/gym/GymMemberSignup'));
const GymMemberProfile = lazy(() => import('@/pages/gym/GymMemberProfile'));
const GymAdminCheckIns = lazy(() => import('@/pages/gym/GymAdminCheckIns'));
const GymAdminAnalytics = lazy(() => import('@/pages/gym/GymAdminAnalytics'));
const GymAdminPayments = lazy(() => import('@/pages/gym/GymAdminPayments'));
const GymAdminLeads = lazy(() => import('@/pages/gym/GymAdminLeads'));
const GymAdminContracts = lazy(() => import('@/pages/gym/GymAdminContracts'));
const GymAdminReferrals = lazy(() => import('@/pages/gym/GymAdminReferrals'));
const GymAdminWebsite = lazy(() => import('@/pages/gym/GymAdminWebsite'));
const GymAdminAnnouncements = lazy(() => import('@/pages/gym/GymAdminAnnouncements'));
const GymPublicWebsite = lazy(() => import('@/pages/gym/GymPublicWebsite'));
const GymAdminStaff = lazy(() => import('@/pages/gym/GymAdminStaff'));
const GymAdminCredits = lazy(() => import('@/pages/gym/GymAdminCredits'));
const GymAdminMarketing = lazy(() => import('@/pages/gym/GymAdminMarketing'));
const GymAdminAutomation = lazy(() => import('@/pages/gym/GymAdminAutomation'));
const GymOnboarding = lazy(() => import('@/pages/gym/GymOnboarding'));
const GymAdminGrading = lazy(() => import('@/pages/gym/GymAdminGrading'));
const GymAdminProducts = lazy(() => import('@/pages/gym/GymAdminProducts'));
const GymAdminPOS = lazy(() => import('@/pages/gym/GymAdminPOS'));
const GymAdminInvoices = lazy(() => import('@/pages/gym/GymAdminInvoices'));
const GymAdminAutomations = lazy(() => import('@/pages/gym/GymAdminAutomations'));
const GymAdminReports = lazy(() => import('@/pages/gym/GymAdminReports'));
const GymAdminActivityLog = lazy(() => import('@/pages/gym/GymAdminActivityLog'));
const GymAdminMessages = lazy(() => import('@/pages/gym/GymAdminMessages'));
const GymAdminRefundRequests = lazy(() => import('@/pages/gym/GymAdminRefundRequests'));
const GymAdminAddMember = lazy(() => import('@/pages/gym/GymAdminAddMember'));
const GymAdminEditMember = lazy(() => import('@/pages/gym/GymAdminEditMember'));
const GymStaffProfile = lazy(() => import('@/pages/gym/GymStaffProfile'));
const GymCoachClasses = lazy(() => import('@/pages/gym/coach/CoachClasses'));
const EmbedTimetable = lazy(() => import('@/pages/gym/embed/EmbedTimetable'));
const EmbedSignup = lazy(() => import('@/pages/gym/embed/EmbedSignup'));
const GymSignup = lazy(() => import('@/pages/gym/GymSignup'));

// Gym Admin Layout Wrapper (provides GymProvider context)
import { GymAdminRouteWrapper } from '@/components/gym/admin/GymAdminRouteWrapper';

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
const DocsClientDataSharing = lazy(() => import('@/pages/docs/client/ClientDataSharingDocs'));
const DocsClientLeaderboards = lazy(() => import('@/pages/docs/client/ClientLeaderboardDocs'));
const DocsClientMessages = lazy(() => import('@/pages/docs/client/ClientMessagesDocs'));
const DocsClientFavourites = lazy(() => import('@/pages/docs/client/ClientFavouritesDocs'));

// AI Documentation
const DocsCoachAIOverview = lazy(() => import('@/pages/docs/coach/CoachAIOverviewDocs'));
const DocsAIClientSummary = lazy(() => import('@/pages/docs/coach/ai/AIClientSummaryDocs'));
const DocsAIWorkoutGenerator = lazy(() => import('@/pages/docs/coach/ai/AIWorkoutGeneratorDocs'));
const DocsAINutritionGenerator = lazy(() => import('@/pages/docs/coach/ai/AINutritionGeneratorDocs'));
const DocsAIMacroCalculator = lazy(() => import('@/pages/docs/coach/ai/AIMacroCalculatorDocs'));
const DocsAICheckInComposer = lazy(() => import('@/pages/docs/coach/ai/AICheckInComposerDocs'));
const DocsAIProgressInsights = lazy(() => import('@/pages/docs/coach/ai/AIProgressInsightsDocs'));
const DocsAIExerciseAlternatives = lazy(() => import('@/pages/docs/coach/ai/AIExerciseAlternativesDocs'));
const DocsAIFoodSubstitutions = lazy(() => import('@/pages/docs/coach/ai/AIFoodSubstitutionsDocs'));
const DocsAIPlanRecommendations = lazy(() => import('@/pages/docs/coach/ai/AIPlanRecommendationsDocs'));

// Coach Additional Documentation
const DocsCoachAchievements = lazy(() => import('@/pages/docs/coach/CoachAchievementsDocs'));
const DocsCoachFinancial = lazy(() => import('@/pages/docs/coach/CoachFinancialDocs'));
const DocsCoachWearables = lazy(() => import('@/pages/docs/coach/CoachWearablesDocs'));
const DocsCoachIntegrations = lazy(() => import('@/pages/docs/coach/CoachIntegrationsDocs'));
const DocsCoachSettings = lazy(() => import('@/pages/docs/coach/CoachSettingsDocs'));
const DocsCoachShowcase = lazy(() => import('@/pages/docs/coach/CoachShowcaseDocs'));
const DocsCoachComparison = lazy(() => import('@/pages/docs/coach/CoachClientComparisonDocs'));
const DocsCoachCaseStudies = lazy(() => import('@/pages/docs/coach/CoachCaseStudiesDocs'));
const DocsCoachPackageAnalytics = lazy(() => import('@/pages/docs/coach/CoachPackageAnalyticsDocs'));
const DocsCoachConnections = lazy(() => import('@/pages/docs/coach/CoachConnectionsDocs'));
const DocsCoachAIRecommendations = lazy(() => import('@/pages/docs/coach/CoachAIRecommendationsDocs'));
const DocsCoachClientRisk = lazy(() => import('@/pages/docs/coach/CoachClientRiskDocs'));
const DocsCoachPlateau = lazy(() => import('@/pages/docs/coach/CoachPlateauDocs'));
const DocsCoachRevenueForecast = lazy(() => import('@/pages/docs/coach/CoachRevenueForecastDocs'));
const DocsCoachCheckInSuggestions = lazy(() => import('@/pages/docs/coach/CoachCheckInSuggestionsDocs'));
const DocsCoachGroupClasses = lazy(() => import('@/pages/docs/coach/CoachGroupClassesDocs'));
const DocsCoachEngagementScoring = lazy(() => import('@/pages/docs/coach/CoachEngagementScoringDocs'));
const DocsCoachClientLTV = lazy(() => import('@/pages/docs/coach/CoachClientLTVDocs'));
const DocsCoachUpsell = lazy(() => import('@/pages/docs/coach/CoachUpsellDocs'));
const DocsCoachGoalAdherence = lazy(() => import('@/pages/docs/coach/CoachGoalAdherenceDocs'));

// Client Additional Documentation
const DocsClientReadiness = lazy(() => import('@/pages/docs/client/ClientReadinessDocs'));
const DocsClientMicroWins = lazy(() => import('@/pages/docs/client/ClientMicroWinsDocs'));
const DocsClientGoalSuggestions = lazy(() => import('@/pages/docs/client/ClientGoalSuggestionsDocs'));
const DocsClientTrends = lazy(() => import('@/pages/docs/client/ClientTrendsDocs'));

// Integration Documentation - Wearables
const DocsAppleHealth = lazy(() => import('@/pages/docs/integrations/AppleHealthIntegration'));
const DocsHealthConnect = lazy(() => import('@/pages/docs/integrations/HealthConnectIntegration'));
const DocsGarmin = lazy(() => import('@/pages/docs/integrations/GarminIntegration'));

// Gym Documentation Pages
const DocsGymOverview = lazy(() => import('@/pages/docs/gym/GymOverview'));
const DocsGymGettingStarted = lazy(() => import('@/pages/docs/gym/GymGettingStarted'));
const DocsGymMembers = lazy(() => import('@/pages/docs/gym/GymMembers'));
const DocsGymMemberships = lazy(() => import('@/pages/docs/gym/GymMemberships'));
const DocsGymClasses = lazy(() => import('@/pages/docs/gym/GymClasses'));
const DocsGymCheckIns = lazy(() => import('@/pages/docs/gym/GymCheckIns'));
const DocsGymCheckInManagement = lazy(() => import('@/pages/docs/gym/GymCheckInManagement'));
const DocsGymStaff = lazy(() => import('@/pages/docs/gym/GymStaff'));
const DocsGymLeads = lazy(() => import('@/pages/docs/gym/GymLeads'));
const DocsGymMarketing = lazy(() => import('@/pages/docs/gym/GymMarketing'));
const DocsGymPOS = lazy(() => import('@/pages/docs/gym/GymPOS'));
const DocsGymPayments = lazy(() => import('@/pages/docs/gym/GymPayments'));
const DocsGymContracts = lazy(() => import('@/pages/docs/gym/GymContracts'));
const DocsGymGrading = lazy(() => import('@/pages/docs/gym/GymGrading'));
const DocsGymReports = lazy(() => import('@/pages/docs/gym/GymReports'));
const DocsGymLocations = lazy(() => import('@/pages/docs/gym/GymLocations'));
const DocsGymMemberPortal = lazy(() => import('@/pages/docs/gym/GymMemberPortal'));
const DocsGymSettings = lazy(() => import('@/pages/docs/gym/GymSettings'));
const DocsGymActivityLog = lazy(() => import('@/pages/docs/gym/GymActivityLog'));
const DocsGymAnalyticsDashboard = lazy(() => import('@/pages/docs/gym/GymAnalyticsDashboard'));
const DocsGymRefunds = lazy(() => import('@/pages/docs/gym/GymRefunds'));
const DocsGymRecurringSchedules = lazy(() => import('@/pages/docs/gym/GymRecurringSchedules'));
const DocsGymWebsiteBuilder = lazy(() => import('@/pages/docs/gym/GymWebsiteBuilder'));
const DocsGymMessaging = lazy(() => import('@/pages/docs/gym/GymMessaging'));
const DocsGymProducts = lazy(() => import('@/pages/docs/gym/GymProducts'));
const DocsGymPromotions = lazy(() => import('@/pages/docs/gym/GymPromotions'));
const DocsGymReferrals = lazy(() => import('@/pages/docs/gym/GymReferrals'));
const DocsGymFamilyAccounts = lazy(() => import('@/pages/docs/gym/GymFamilyAccounts'));
const DocsGymEmbedWidgets = lazy(() => import('@/pages/docs/gym/GymEmbedWidgets'));
const DocsGymAutomationsAdvanced = lazy(() => import('@/pages/docs/gym/GymAutomationsAdvanced'));
const DocsGymCreditsAdvanced = lazy(() => import('@/pages/docs/gym/GymCreditsAdvanced'));
const DocsGymInvoicing = lazy(() => import('@/pages/docs/gym/GymInvoicing'));
const DocsGymReportingAdvanced = lazy(() => import('@/pages/docs/gym/GymReportingAdvanced'));
const DocsGymMultiLocationAdvanced = lazy(() => import('@/pages/docs/gym/GymMultiLocationAdvanced'));

// Client Additional Documentation (new)
const DocsClientMyGyms = lazy(() => import('@/pages/docs/client/ClientMyGyms'));
const DocsClientHealthHistory = lazy(() => import('@/pages/docs/client/ClientHealthHistoryDocs'));
const DocsClientDisciplineSetup = lazy(() => import('@/pages/docs/client/ClientDisciplineSetupDocs'));
const DocsClientNotifications = lazy(() => import('@/pages/docs/client/ClientNotificationsDocs'));

// Admin Additional Documentation (new)
const DocsAdminGyms = lazy(() => import('@/pages/docs/admin/AdminGymsDocs'));
const DocsAdminReviews = lazy(() => import('@/pages/docs/admin/AdminReviewsDocs'));
const DocsAdminFeedback = lazy(() => import('@/pages/docs/admin/AdminFeedbackDocs'));
const DocsAdminDebug = lazy(() => import('@/pages/docs/admin/AdminDebugDocs'));


// Debug pages
const Debug = lazy(() => import('@/pages/Debug'));
const NativeDiagnostics = lazy(() => import('@/pages/NativeDiagnostics'));

// Landing Pages
const ForGyms = lazy(() => import('@/pages/ForGyms'));

// Subscribe pages
const Subscribe = lazy(() => import('@/pages/Subscribe'));
const SubscribeSuccess = lazy(() => import('@/pages/SubscribeSuccess'));

// Language persistence component (must be inside i18n context)
function LanguagePersistence() {
  useLanguagePersistence();
  return null;
}

// Global error capture for errors outside React lifecycle
// Enhanced with chunk load error detection and auto-recovery for Despia
import { handlePotentialChunkError } from "@/lib/chunk-error-recovery";

function GlobalErrorCapture() {
  React.useEffect(() => {
    const captureError = (message: string, source: string, error?: Error) => {
      try {
        const errorDetails = {
          type: source,
          message,
          stack: error?.stack || "No stack trace",
          route: window.location.pathname,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        };
        
        // Store in sessionStorage for debugging
        sessionStorage.setItem("fc_last_global_error", JSON.stringify(errorDetails));
        
        // Log in dev mode
        if (import.meta.env.DEV) {
          console.error(`[GlobalErrorCapture:${source}]`, errorDetails);
        }
        
        // Check for chunk load errors and trigger auto-recovery
        // Only use the actual Error object, not the message string (too many false positives)
        if (error && handlePotentialChunkError(error)) {
          return; // Recovery triggered, don't process further
        }
      } catch { /* ignore storage errors */ }
    };

    // Catch unhandled JS errors
    const handleError = (event: ErrorEvent) => {
      captureError(event.message, "window.onerror", event.error);
    };

    // Catch unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      captureError(message, "unhandledrejection", event.reason instanceof Error ? event.reason : undefined);
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return null;
}

// Despia native initialization (Android status bar config)
function DespiaInitializer() {
  useAppInitialization();
  return null;
}

// Native splash screen wrapper - signals HTML splash to hide when app is ready
// Splash is rendered in index.html for instant display (no white flash)
function NativeSplashWrapper({ children }: { children: React.ReactNode }) {
  const inDespia = isDespia();
  const { isPWA } = useEnvironment();
  const showNativeSplash = inDespia || isPWA;
  
  useEffect(() => {
    if (!showNativeSplash) return;
    
    // Wait for app to be ready, then hide HTML splash
    const timeout = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).__nativeSplash) {
        (window as any).__nativeSplash.hide();
      }
    }, 6500);
    
    return () => clearTimeout(timeout);
  }, [showNativeSplash]);
  
  // Always render children - splash is in HTML layer
  return <>{children}</>;
}

// Deferred non-critical trackers - don't block initial render
function DeferredTrackers() {
  const shouldMount = useDeferredMount(200);
  
  if (!shouldMount) return null;
  
  return (
    <>
      <SessionActivityTracker />
      <PushNotificationInitializer />
    </>
  );
}

// Deferred celebration context - not needed for initial render
function DeferredCelebration({ children }: { children: React.ReactNode }) {
  const shouldMount = useDeferredMount(100);
  
  if (shouldMount) {
    return (
      <CelebrationProvider>
        <CelebrationListeners />
        {children}
      </CelebrationProvider>
    );
  }
  
  // Render children without celebration context initially
  return <>{children}</>;
}

// Migrate legacy localStorage formats on app start (one-time, runs synchronously before React)
(() => {
  try {
    ['fitconnect_client_onboarded', 'fitconnect_coach_onboarded'].forEach(key => {
      const value = localStorage.getItem(key);
      if (value && value.startsWith('{')) {
        const parsed = JSON.parse(value);
        if (parsed?.isOnboarded) {
          localStorage.setItem(key, 'true');
        } else {
          localStorage.removeItem(key);
        }
      }
    });
  } catch { /* ignore migration errors */ }
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh longer
      gcTime: 60 * 60 * 1000, // 1 hour - keep unused data in cache longer
      refetchOnWindowFocus: false, // Prevent refetches when switching tabs
      refetchOnMount: false, // Use cached data on mount, don't refetch
      retry: 1, // Single retry for failed requests
    },
  },
});

// Setup React Query logging for debug console
setupQueryLogging(queryClient);

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <NativeSplashWrapper>
            <Toaster />
            <Sonner />
            <ReloadPrompt />
            <HydrationSignal />
            <DespiaInitializer />
            <GlobalErrorCapture />
            <BrowserRouter>
              <InstallBanner />
              <ScrollRestoration />
              <CookieConsentProvider>
                <CookieConsentBanner />
                <CountryProvider>
                  <AuthProvider>
                    <ResumeManagerProvider>
                      <DeferredTrackers />
                      <AnimationSettingsProvider>
                        <DeferredCelebration>
                          <AdminProvider>
                          <LocaleProvider>
                            <LanguagePersistence />
                            <Routes>
                              {/* Zoom OAuth redirect - must be outside wrappers for isolation */}
                              <Route path="/api/zoom/oauth" element={<ZoomOAuth />} />
                              
                              {/* Auth routes - wrap with WebsiteLocaleWrapper (simple spinner fallback) */}
                              <Route path="/auth" element={
                                <WebsiteLocaleWrapper>
                                  <Auth />
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/reset-password" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <ResetPassword />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/reset" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <Reset />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Subscribe routes (coach registration via Stripe) - wrap with WebsiteLocaleWrapper */}
                              <Route path="/subscribe" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <Subscribe />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/subscribe/success" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <SubscribeSuccess />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Debug route (local development only) */}
                              <Route path="/debug" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <Debug />
                                </Suspense>
                              } />
                              <Route path="/native-diagnostics" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <NativeDiagnostics />
                                </Suspense>
                              } />

                              {/* Documentation Routes - wrap with WebsiteLocaleWrapper */}
                              <Route path="/docs" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsHub />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/getting-started" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GettingStarted />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Client Documentation Routes */}
                              <Route path="/docs/client" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientOverview />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/profile" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientProfile />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/coaches" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientCoaches />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/sessions" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientSessions />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/plans" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientPlans />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/progress" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientProgress />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/achievements" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientAchievements />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/settings" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientSettings />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/habits" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientHabits />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/grocery" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientGrocery />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/challenges" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientChallenges />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/tools" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientTools />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/library" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientLibrary />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/connections" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientConnections />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/food-diary" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientFoodDiary />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/training-logs" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientTrainingLogs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/data-privacy" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientDataPrivacy />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/marketplace" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientMarketplace />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/receipts" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientReceipts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/security" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientSecurity />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/wearables" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientWearables />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/data-sharing" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientDataSharing />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/leaderboards" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientLeaderboards />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/messages" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientMessages />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/favourites" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientFavourites />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/readiness" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientReadiness />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/micro-wins" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientMicroWins />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/goal-suggestions" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientGoalSuggestions />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/trends" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientTrends />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/my-gyms" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientMyGyms />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/health-history" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientHealthHistory />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/discipline-setup" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientDisciplineSetup />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/client/notifications" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsClientNotifications />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Coach Documentation Routes */}
                              <Route path="/docs/coach" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachOverview />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/onboarding" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachOnboarding />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/profile" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachProfile />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/earnings" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachEarnings />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/clients" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachClients />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/messaging" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachMessaging />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/plans" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachPlans />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/schedule" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachSchedule />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/packages" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachPackages />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/verification" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachVerification />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/pipeline" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachPipeline />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/products" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachProducts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/boost" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachBoost />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/nutrition" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachNutrition />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachAI />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/reviews" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachReviews />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/automations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachAutomations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/automations/dropoff-rescue" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachDropoffRescue />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/automations/milestones" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachMilestones />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/automations/reminders" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachReminders />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/automations/scheduled-checkins" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachScheduledCheckins />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai-tools" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachAIOverview />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/client-summary" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIClientSummary />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/workout-generator" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIWorkoutGenerator />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/nutrition-generator" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAINutritionGenerator />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/macro-calculator" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIMacroCalculator />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/check-in-composer" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAICheckInComposer />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/progress-insights" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIProgressInsights />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/exercise-alternatives" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIExerciseAlternatives />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/food-substitutions" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIFoodSubstitutions />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai/plan-recommendations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAIPlanRecommendations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/achievements" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachAchievements />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/financial" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachFinancial />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/wearables" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachWearables />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/integrations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachIntegrations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/settings" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachSettings />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/showcase" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachShowcase />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/compare" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachComparison />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/case-studies" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachCaseStudies />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/package-analytics" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachPackageAnalytics />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/connections" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachConnections />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/ai-recommendations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachAIRecommendations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/client-risk" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachClientRisk />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/plateau" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachPlateau />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/revenue-forecast" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachRevenueForecast />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/check-in-suggestions" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachCheckInSuggestions />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/group-classes" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachGroupClasses />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/engagement-scoring" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachEngagementScoring />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/client-ltv" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachClientLTV />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/upsell" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachUpsell />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/coach/goal-adherence" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsCoachGoalAdherence />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Gym Documentation Routes */}
                              <Route path="/docs/gym" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymOverview />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/getting-started" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymGettingStarted />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/members" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMembers />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/memberships" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMemberships />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/classes" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymClasses />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/checkins" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymCheckIns />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/staff" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymStaff />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/leads" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymLeads />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/marketing" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMarketing />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/pos" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymPOS />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/payments" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymPayments />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/contracts" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymContracts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/grading" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymGrading />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/reports" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymReports />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/locations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymLocations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/member-portal" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMemberPortal />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/settings" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymSettings />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/activity-log" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymActivityLog />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/analytics-dashboard" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymAnalyticsDashboard />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/check-in-management" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymCheckInManagement />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/refunds" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymRefunds />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/recurring-schedules" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymRecurringSchedules />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/website-builder" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymWebsiteBuilder />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/messaging" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMessaging />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/products" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymProducts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/promotions" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymPromotions />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/referrals" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymReferrals />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/family-accounts" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymFamilyAccounts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/embed-widgets" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymEmbedWidgets />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/automations-advanced" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymAutomationsAdvanced />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/credits-advanced" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymCreditsAdvanced />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/invoicing" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymInvoicing />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/reporting-advanced" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymReportingAdvanced />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/gym/multi-location-advanced" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGymMultiLocationAdvanced />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Admin Documentation Routes */}
                              <Route path="/docs/admin" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminOverview />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/dashboard" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminDashboard />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/users" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminUsers />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/coaches" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminCoaches />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/team" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminTeam />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/revenue" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminRevenue />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/analytics" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminAnalytics />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/challenges" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminChallenges />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/blog" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminBlog />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/boosts" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminBoosts />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/integrations" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminIntegrations />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/audit" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminAudit />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/gyms" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminGyms />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/reviews" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminReviews />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/feedback" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminFeedback />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/admin/debug" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAdminDebug />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Integration Documentation Routes */}
                              <Route path="/docs/integrations/zoom" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <ZoomIntegrationDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/google-meet" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GoogleMeetIntegrationDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/google-calendar" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GoogleCalendarIntegrationDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/apple-calendar" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <AppleCalendarIntegrationDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/fitbit" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <FitbitIntegrationDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/wearables" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <WearablesOverviewDocs />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/apple-health" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsAppleHealth />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/health-connect" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsHealthConnect />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />
                              <Route path="/docs/integrations/garmin" element={
                                <WebsiteLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <DocsGarmin />
                                  </Suspense>
                                </WebsiteLocaleWrapper>
                              } />

                              {/* Top-level Onboarding Routes - these are the canonical paths */}
                              <Route path="/onboarding/coach" element={
                                <AppLocaleWrapper>
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachOnboarding />
                                    </Suspense>
                                  </ProtectedRoute>
                                </AppLocaleWrapper>
                              } />
                              <Route path="/onboarding/client" element={
                                <AppLocaleWrapper>
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientOnboarding />
                                    </Suspense>
                                  </ProtectedRoute>
                                </AppLocaleWrapper>
                              } />

                              {/* Review Handler Route - must be before dashboard routes */}
                              <Route path="/review-handler" element={
                                <ProtectedRoute allowedRoles={["client"]}>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <ReviewHandler />
                                  </Suspense>
                                </ProtectedRoute>
                              } />

                              {/* Dashboard Routes - use AppLocaleWrapper as layout (renders Outlet for children) */}
                              <Route path="/dashboard" element={<AppLocaleWrapper />}>
                                {/* Index route for /dashboard - redirects to appropriate role dashboard */}
                                <Route index element={
                                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <DashboardRedirect />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                {/* Admin Dashboard Routes */}
                                <Route path="admin" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminDashboard />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/users" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminUsers />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/coaches" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminCoaches />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/settings" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminSettings />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/team" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminTeam />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/revenue" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminRevenue />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/analytics" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminAnalytics />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/reviews" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminReviews />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/verification" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminVerification />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/integrations" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminIntegrations />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/challenges" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminChallenges />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/audit" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminAuditLog />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/feedback" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminFeedback />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/blog" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminBlog />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/boosts" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminBoosts />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/debug" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminDebugConsole />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/gyms" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminGyms />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/messages" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/messages/:id" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="admin/automations" element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <AdminAutomations />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="my-profile" element={
                                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <MyProfile />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                {/* Onboarding Redirects - redirect old paths to canonical top-level routes */}
                                <Route path="onboarding/client" element={<Navigate to="/onboarding/client" replace />} />
                                <Route path="onboarding/coach" element={<Navigate to="/onboarding/coach" replace />} />
                                
                                {/* Client Dashboard Routes */}
                                <Route path="client" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientOverview />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/coaches" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientCoaches />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/sessions" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientSessions />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/messages" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/messages/:id" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/plans" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientPlans />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/plans/:planId" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientPlanDetail />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/habits" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientHabits />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/progress" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientProgress />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/settings" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientSettings />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/favourites" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientFavourites />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/achievements" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientAchievements />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/leaderboard" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientLeaderboard />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/challenges" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientChallenges />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/community" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientCommunityPage />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/community/:communityId" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientCommunityDetailPage />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/integrations" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientIntegrations />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/grocery" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientGrocery />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/connections" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientConnections />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/library" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientLibrary />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/tools" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientTools />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/receipts" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientReceipts />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/find-coaches" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientFindCoaches />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/coaches/:username" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientCoachProfile />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                {/* Redirect old singular route to plural for backwards compatibility */}
                                <Route path="client/coach/:username" element={<ClientCoachRedirect />} />
                                <Route path="client/marketplace" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMarketplace />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/marketplace/product/:productId" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMarketplaceProduct />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/marketplace/bundle/:bundleId" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMarketplaceBundle />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/food-diary" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientFoodDiary />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/training-logs" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientTrainingLogs />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/health-history" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientHealthHistory />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/discipline-setup" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <DisciplineSetup />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="client/my-gyms" element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <ClientMyGyms />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                
                                {/* Coach Dashboard Routes */}
                                <Route path="coach" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachOverview />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/clients" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachClients />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/clients/:clientId" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachClientDetail />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/schedule" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachSchedule />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/messages" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/messages/:id" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachMessages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/plans" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPlans />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/plans/builder" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPlanBuilder />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/plans/builder/:planId" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPlanBuilder />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/nutrition" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachNutritionBuilder />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/nutrition/:planId" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachNutritionBuilder />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/earnings" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachEarnings />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/settings" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachSettings />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/packages" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPackages />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/group-classes" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachGroupClasses />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/community" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachCommunityPage />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/community/:communityId" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachCommunityDetailPage />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/integrations" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachIntegrations />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/reviews" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachReviews />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/financial" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachFinancial />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/pipeline" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPipeline />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/boost" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachBoost />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/achievements" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachAchievements />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/connections" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachConnections />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/products" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachProducts />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/package-analytics" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachPackageAnalytics />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/showcase" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachOutcomeShowcase />
                                    </Suspense>
                                  </ProtectedRoute>
                                } />
                                <Route path="coach/ai-recommendations" element={
                                  <ProtectedRoute allowedRoles={["coach"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <CoachAIRecommendations />
                                    </Suspense>
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

                              {/* Gym Login & Registration */}
<Route path="/gym-login" element={
                                <AppLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAuth />
                                  </Suspense>
                                </AppLocaleWrapper>
                              } />
                              <Route path="/gym-register" element={
                                <Navigate to="/gym-login?mode=register" replace />
                              } />
                              {/* Legacy route redirects */}
                              <Route path="/gym/register" element={<Navigate to="/gym-register" replace />} />
                              <Route path="/club-login" element={<Navigate to="/gym-login" replace />} />
                              <Route path="/club-register" element={<Navigate to="/gym-register" replace />} />
                              
                              {/* New Gym Onboarding Flow */}
                              <Route path="/onboarding/gym" element={
                                <AppLocaleWrapper>
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymOnboarding />
                                  </Suspense>
                                </AppLocaleWrapper>
                              } />

                              {/* For Gyms Landing Page */}
                              <Route path="/club-management" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <ForGyms />
                                </Suspense>
                              } />

                              {/* Gym Admin Routes - uses gymId with nested routing */}
                              <Route path="/gym-admin/:gymId" element={
                                <AppLocaleWrapper>
                                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                    <GymAdminRouteWrapper />
                                  </ProtectedRoute>
                                </AppLocaleWrapper>
                              }>
                                <Route index element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminDashboard />
                                  </Suspense>
                                } />
                                <Route path="members" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminMembers />
                                  </Suspense>
                                } />
                                <Route path="members/add" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminAddMember />
                                  </Suspense>
                                } />
                                <Route path="members/:memberId" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymMemberProfile />
                                  </Suspense>
                                } />
                                <Route path="members/:memberId/edit" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminEditMember />
                                  </Suspense>
                                } />
                                <Route path="schedule" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminSchedule />
                                  </Suspense>
                                } />
                                <Route path="classes" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminClasses />
                                  </Suspense>
                                } />
                                <Route path="memberships" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminMemberships />
                                  </Suspense>
                                } />
                                <Route path="check-ins" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminCheckIns />
                                  </Suspense>
                                } />
                                <Route path="analytics" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminAnalytics />
                                  </Suspense>
                                } />
                                <Route path="payments" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminPayments />
                                  </Suspense>
                                } />
                                <Route path="locations" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminLocations />
                                  </Suspense>
                                } />
                                <Route path="settings" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminSettings />
                                  </Suspense>
                                } />
                                <Route path="my-profile" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymStaffProfile />
                                  </Suspense>
                                } />
                                <Route path="leads" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminLeads />
                                  </Suspense>
                                } />
                                <Route path="contracts" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminContracts />
                                  </Suspense>
                                } />
                                <Route path="referrals" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminReferrals />
                                  </Suspense>
                                } />
                                <Route path="website" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminWebsite />
                                  </Suspense>
                                } />
                                <Route path="announcements" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminAnnouncements />
                                  </Suspense>
                                } />
                                <Route path="staff" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminStaff />
                                  </Suspense>
                                } />
                                <Route path="credits" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminCredits />
                                  </Suspense>
                                } />
                                <Route path="marketing" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminMarketing />
                                  </Suspense>
                                } />
                                <Route path="automation" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminAutomation />
                                  </Suspense>
                                } />
                                <Route path="grading" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminGrading />
                                  </Suspense>
                                } />
                                <Route path="products" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminProducts />
                                  </Suspense>
                                } />
                                <Route path="pos" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminPOS />
                                  </Suspense>
                                } />
                                <Route path="invoices" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminInvoices />
                                  </Suspense>
                                } />
                                <Route path="automations" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminAutomations />
                                  </Suspense>
                                } />
                                <Route path="reports" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminReports />
                                  </Suspense>
                                } />
                                <Route path="activity-log" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminActivityLog />
                                  </Suspense>
                                } />
                                <Route path="messages" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminMessages />
                                  </Suspense>
                                } />
                                <Route path="refund-requests" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymAdminRefundRequests />
                                  </Suspense>
                                } />
                                <Route path="coach/classes" element={
                                  <Suspense fallback={<PageLoadingSpinner />}>
                                    <GymCoachClasses />
                                  </Suspense>
                                } />
                              </Route>
                              
                              {/* Embed Routes (public) */}
                              <Route path="/embed/:gymId/timetable" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <EmbedTimetable />
                                </Suspense>
                              } />
                              <Route path="/embed/:gymId/signup" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <EmbedSignup />
                                </Suspense>
                              } />
                              
                              {/* Public Gym Signup by ID */}
                              <Route path="/gym-signup/:gymId" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <GymSignup />
                                </Suspense>
                              } />
                              
                              {/* Club Member Signup (public route) */}
                              <Route path="/club/:gymSlug/signup" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <GymMemberSignup />
                                </Suspense>
                              } />
                              
                              {/* Public Gym Website */}
                              <Route path="/club/:gymSlug" element={
                                <Suspense fallback={<PageLoadingSpinner />}>
                                  <GymPublicWebsite />
                                </Suspense>
                              } />
                              
                              {/* Gym Member/Portal Routes */}
                              <Route path="/gym-portal/:gymId" element={
                                <AppLocaleWrapper>
                                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <GymMemberPortal />
                                    </Suspense>
                                  </ProtectedRoute>
                                </AppLocaleWrapper>
                              } />
                              <Route path="/gym-checkin/:gymId" element={
                                <AppLocaleWrapper>
                                  <ProtectedRoute allowedRoles={["client", "coach", "admin"]}>
                                    <Suspense fallback={<PageLoadingSpinner />}>
                                      <GymCheckIn />
                                    </Suspense>
                                  </ProtectedRoute>
                                </AppLocaleWrapper>
                              } />
                              
                              {/* Website routes - WITH locale URL logic (must be last) */}
                              <Route path="/*" element={<WebsiteRouter />} />
                          </Routes>
                          </LocaleProvider>
                        </AdminProvider>
                      </DeferredCelebration>
                    </AnimationSettingsProvider>
                  </ResumeManagerProvider>
                </AuthProvider>
                </CountryProvider>
              </CookieConsentProvider>
            </BrowserRouter>
          </NativeSplashWrapper>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
