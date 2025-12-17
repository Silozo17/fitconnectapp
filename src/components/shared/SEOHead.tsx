import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
  schema?: object | object[];
}

const BASE_URL = "https://getfitconnect.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

export function SEOHead({
  title,
  description,
  canonicalPath = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  keywords = [],
  schema,
}: SEOHeadProps) {
  const fullTitle = title.includes("FitConnect") ? title : `${title} | FitConnect`;
  const canonicalUrl = `${BASE_URL}${canonicalPath}`;
  const fullOgImage = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  const defaultKeywords = [
    "personal trainer",
    "fitness coach",
    "nutritionist",
    "boxing coach",
    "MMA coach",
    "online coaching",
    "fitness training UK",
  ];

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])].join(", ");

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="FitConnect" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:site" content="@FitConnect" />

      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(schema) ? schema : [schema])}
        </script>
      )}
    </Helmet>
  );
}

// Helper to create BreadcrumbList schema
export function createBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://getfitconnect.co.uk${item.url}`,
    })),
  };
}

// Helper to create Service schema for coach categories
export function createServiceSchema(service: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "url": `https://getfitconnect.co.uk${service.url}`,
    "provider": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk",
    },
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom",
    },
  };
}

// Helper to create Person schema for coach profiles
export function createCoachSchema(coach: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  jobTitle?: string;
  location?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": coach.name,
    "description": coach.description,
    "image": coach.image,
    "url": `https://getfitconnect.co.uk${coach.url}`,
    "jobTitle": coach.jobTitle || "Fitness Coach",
    "worksFor": {
      "@type": "Organization",
      "name": "FitConnect",
    },
    ...(coach.location && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": coach.location,
        "addressCountry": "GB",
      },
    }),
  };
}

// Helper to create ItemList schema for coach listings
export function createCoachListSchema(coaches: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": coaches.map((coach, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Person",
        "name": coach.name,
        "url": `https://getfitconnect.co.uk${coach.url}`,
      },
    })),
  };
}
