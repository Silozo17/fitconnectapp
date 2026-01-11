// Empty states
export { EmptyState } from "./EmptyState";
export { ErrorState } from "./ErrorState";

// Layout components - NEW DESIGN SYSTEM
export { DashboardSectionHeader } from "./DashboardSectionHeader";
export { MetricCard } from "./MetricCard";
export type { MetricCardColor } from "./MetricCard";
export { ContentSection, ContentSectionHeader } from "./ContentSection";
export type { ContentSectionColor } from "./ContentSection";
export { StatsGrid } from "./StatsGrid";
export { IconBadge } from "./IconBadge";
export type { IconBadgeColor, IconBadgeSize } from "./IconBadge";

// Layout components - Legacy (for gradual migration)
/** @deprecated Use ContentSection instead */
export { SectionHeader } from "./SectionHeader";
/** @deprecated Use ContentSection instead */
export { ContentCard } from "./ContentCard";
/** @deprecated Use MetricCard instead */
export { StatCard, StatCardGrid } from "./StatCard";

// Status & indicators
export { StatusIndicator, StatusBadge } from "./StatusIndicator";
export { SidebarBadge } from "./SidebarBadge";

// Loading states
export { SkeletonCard, SkeletonList } from "./SkeletonCard";
export { InlineLoader, AreaLoader } from "./InlineLoader";
export { default as PageLoadingSpinner } from "./PageLoadingSpinner";

// Avatars & images
export { UserAvatar } from "./UserAvatar";
export { DecorativeAvatar } from "./DecorativeAvatar";
export { ProfileImageUpload } from "./ProfileImageUpload";
export { CardImageUpload } from "./CardImageUpload";
export { ImageCropperModal } from "./ImageCropperModal";
export { CardImageCropperModal } from "./CardImageCropperModal";

// Navigation & layout
export { default as SkipNavigation } from "./SkipNavigation";
export { default as VisuallyHidden } from "./VisuallyHidden";
export { default as Breadcrumbs } from "./Breadcrumbs";
export { default as ScrollToTop } from "./ScrollToTop";
export { default as ScrollRestoration } from "./ScrollRestoration";

// Forms & inputs
export { CurrencySelector } from "./CurrencySelector";
export { LanguageSelector } from "./LanguageSelector";
export { LocationSelector } from "./LocationSelector";
export { LocationAutocomplete } from "./LocationAutocomplete";
export { DateRangeFilter } from "./DateRangeFilter";

// Dialogs & modals
export { UnsavedChangesDialog } from "./UnsavedChangesDialog";
export { DeleteAccountModal } from "./DeleteAccountModal";

// Error handling
export { ErrorBoundary } from "./ErrorBoundary";
export { WidgetErrorBoundary } from "./WidgetErrorBoundary";

// Misc
export { SEOHead } from "./SEOHead";
export { ShareButton } from "./ShareButton";
export { SocialLinks } from "./SocialLinks";
export { ComparisonStatCard } from "./ComparisonStatCard";
