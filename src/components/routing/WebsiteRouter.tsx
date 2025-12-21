import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { LocaleRoutingProvider } from '@/contexts/LocaleRoutingContext';
import GuestOnlyRoute from '@/components/auth/GuestOnlyRoute';
import PageLoadingSpinner from '@/components/shared/PageLoadingSpinner';
import RouteRestorer from '@/components/shared/RouteRestorer';
import ScrollToTop from '@/components/shared/ScrollToTop';
import { DashboardLocaleRedirect } from './DashboardLocaleRedirect';
import { LocaleRouteWrapper } from './LocaleRouteWrapper';

// Eagerly loaded pages (critical path)
import Index from '@/pages/Index';
import GetStarted from '@/pages/GetStarted';
import NotFound from '@/pages/NotFound';

// Lazy loaded public pages
const Coaches = lazy(() => import('@/pages/Coaches'));
const CoachDetail = lazy(() => import('@/pages/CoachDetail'));
const About = lazy(() => import('@/pages/About'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const ForCoaches = lazy(() => import('@/pages/ForCoaches'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const SuccessStories = lazy(() => import('@/pages/SuccessStories'));
const Contact = lazy(() => import('@/pages/Contact'));
const Community = lazy(() => import('@/pages/Community'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
const MarketplaceProduct = lazy(() => import('@/pages/MarketplaceProduct'));
const MarketplaceBundle = lazy(() => import('@/pages/MarketplaceBundle'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Install = lazy(() => import('@/pages/Install'));

// Coach category pages
const PersonalTrainers = lazy(() => import('@/pages/coaches/PersonalTrainers'));
const Nutritionists = lazy(() => import('@/pages/coaches/Nutritionists'));
const Boxing = lazy(() => import('@/pages/coaches/Boxing'));
const MMA = lazy(() => import('@/pages/coaches/MMA'));

/**
 * Shared page routes used by both root and locale-prefixed paths.
 * This component renders the actual page content.
 */
function PageRoutes() {
  return (
    <Routes>
      <Route index element={<Index />} />
      <Route path="get-started" element={<GuestOnlyRoute><GetStarted /></GuestOnlyRoute>} />
      <Route path="coaches" element={<Coaches />} />
      <Route path="coaches/:id" element={<CoachDetail />} />
      <Route path="coaches/personal-trainers" element={<PersonalTrainers />} />
      <Route path="coaches/nutritionists" element={<Nutritionists />} />
      <Route path="coaches/boxing" element={<Boxing />} />
      <Route path="coaches/mma" element={<MMA />} />
      <Route path="about" element={<About />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="pricing" element={<Pricing />} />
      <Route path="for-coaches" element={<ForCoaches />} />
      <Route path="how-it-works" element={<HowItWorks />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />
      <Route path="success-stories" element={<SuccessStories />} />
      <Route path="contact" element={<Contact />} />
      <Route path="community" element={<Community />} />
      <Route path="leaderboards" element={<Navigate to="community" replace />} />
      <Route path="avatars" element={<Navigate to="community?tab=avatars" replace />} />
      <Route path="marketplace" element={<Marketplace />} />
      <Route path="marketplace/:productId" element={<MarketplaceProduct />} />
      <Route path="marketplace/bundles/:bundleId" element={<MarketplaceBundle />} />
      <Route path="checkout" element={<Checkout />} />
      <Route path="blog" element={<Blog />} />
      <Route path="blog/:slug" element={<BlogPost />} />
      <Route path="install" element={<Install />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

/**
 * Wrapper that renders PageRoutes as an outlet child
 */
function PageRoutesOutlet() {
  return <PageRoutes />;
}

/**
 * WebsiteRouter handles all public website routes WITH locale URL logic.
 * Wrapped in LocaleRoutingProvider for URL-based locale handling.
 * 
 * Route structure:
 * - / and /page -> Non-prefixed routes
 * - /:locale/* -> Locale-prefixed routes (e.g., /en-gb/coaches)
 * - /:locale/dashboard/* -> Redirect to /dashboard/* (no locale in app routes)
 */
export function WebsiteRouter() {
  return (
    <LocaleRoutingProvider>
      <RouteRestorer />
      <Suspense fallback={<PageLoadingSpinner />}>
        <Routes>
          {/* Redirect locale-prefixed protected routes to plain routes */}
          <Route path=":locale/dashboard/*" element={<DashboardLocaleRedirect />} />
          <Route path=":locale/onboarding/*" element={<DashboardLocaleRedirect />} />
          <Route path=":locale/docs/*" element={<DashboardLocaleRedirect />} />
          <Route path=":locale/auth" element={<DashboardLocaleRedirect />} />
          <Route path=":locale/subscribe/*" element={<DashboardLocaleRedirect />} />
          
          {/* Locale-prefixed website routes */}
          <Route path=":locale" element={<LocaleRouteWrapper />}>
            <Route index element={<PageRoutesOutlet />} />
            <Route path="*" element={<PageRoutesOutlet />} />
          </Route>
          
          {/* Non-prefixed routes (root level) */}
          <Route path="/" element={<Index />} />
          <Route path="get-started" element={<GuestOnlyRoute><GetStarted /></GuestOnlyRoute>} />
          <Route path="coaches" element={<Coaches />} />
          <Route path="coaches/:id" element={<CoachDetail />} />
          <Route path="coaches/personal-trainers" element={<PersonalTrainers />} />
          <Route path="coaches/nutritionists" element={<Nutritionists />} />
          <Route path="coaches/boxing" element={<Boxing />} />
          <Route path="coaches/mma" element={<MMA />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="for-coaches" element={<ForCoaches />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="success-stories" element={<SuccessStories />} />
          <Route path="contact" element={<Contact />} />
          <Route path="community" element={<Community />} />
          <Route path="leaderboards" element={<Navigate to="/community" replace />} />
          <Route path="avatars" element={<Navigate to="/community?tab=avatars" replace />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:productId" element={<MarketplaceProduct />} />
          <Route path="marketplace/bundles/:bundleId" element={<MarketplaceBundle />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="install" element={<Install />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ScrollToTop />
    </LocaleRoutingProvider>
  );
}

export default WebsiteRouter;
