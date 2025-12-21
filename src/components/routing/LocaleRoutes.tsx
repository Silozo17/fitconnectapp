import { ReactNode } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { parseLocaleString, DEFAULT_ROUTE_LOCALE } from '@/lib/locale-routing';

interface LocaleRoutesProps {
  children?: ReactNode;
}

/**
 * Wrapper component for locale-prefixed routes.
 * Parses the :locale param and validates it.
 * Children receive the validated locale context.
 */
export function LocaleRoutes({ children }: LocaleRoutesProps) {
  const { locale } = useParams<{ locale: string }>();
  
  // Parse and validate the locale param
  const parsed = locale ? parseLocaleString(locale) : null;
  
  // If invalid locale, we'll still render but with defaults
  // The LocaleRoutingContext will handle the actual values
  const validLocale = parsed || DEFAULT_ROUTE_LOCALE;
  
  // The LocaleRoutingContext (wrapping the router) handles the actual
  // locale state management. This component just renders the children.
  return <>{children || <Outlet />}</>;
}

/**
 * Get locale from URL params (for use in loaders or outside component tree)
 */
export function getLocaleFromParams(params: Record<string, string | undefined>) {
  const locale = params.locale;
  if (!locale) return DEFAULT_ROUTE_LOCALE;
  
  const parsed = parseLocaleString(locale);
  return parsed || DEFAULT_ROUTE_LOCALE;
}
