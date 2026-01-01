import { Helmet } from "react-helmet-async";

interface HreflangEntry {
  lang: string;
  url: string;
}

interface SEOHeadProps {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
  schema?: object | object[];
  publishedTime?: string;
  modifiedTime?: string;
  /** Alternate language/region versions of this page for hreflang tags */
  hreflangEntries?: HreflangEntry[];
}

const BASE_URL = "https://getfitconnect.co.uk";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.webp?v=2`;
const DEFAULT_OG_IMAGE_ALT = "FitConnect - Connect with world-class fitness coaches in the UK";

export function SEOHead({
  title,
  description,
  canonicalPath = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  ogType = "website",
  noIndex = false,
  keywords = [],
  schema,
  publishedTime,
  modifiedTime,
  hreflangEntries = [],
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

  // Determine robots directive
  const robotsContent = noIndex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="robots" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang tags for international/locale versions */}
      {hreflangEntries.map((entry) => (
        <link 
          key={entry.lang} 
          rel="alternate" 
          hrefLang={entry.lang} 
          href={entry.url.startsWith("http") ? entry.url : `${BASE_URL}${entry.url}`} 
        />
      ))}
      {/* Add x-default if we have hreflang entries */}
      {hreflangEntries.length > 0 && (
        <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:secure_url" content={fullOgImage} />
      <meta property="og:image:type" content={fullOgImage.endsWith('.webp') ? 'image/webp' : 'image/png'} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content="FitConnect" />
      <meta property="og:locale" content="en_GB" />
      
      {/* Article-specific Open Graph */}
      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
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

// Helper to create Product schema for digital products
export function createProductSchema(product: {
  name: string;
  description: string;
  image?: string;
  url: string;
  price: number;
  currency: string;
  availability?: "InStock" | "OutOfStock" | "PreOrder";
  rating?: number;
  reviewCount?: number;
  seller?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image || "https://getfitconnect.co.uk/og-image.png",
    "url": `https://getfitconnect.co.uk${product.url}`,
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": product.currency,
      "availability": `https://schema.org/${product.availability || "InStock"}`,
      "seller": {
        "@type": "Organization",
        "name": product.seller || "FitConnect",
      },
    },
    ...(product.rating && product.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating.toFixed(1),
        "reviewCount": product.reviewCount,
        "bestRating": "5",
        "worstRating": "1",
      },
    }),
  };
}

// Helper to create LocalBusiness schema for coach profiles
export function createLocalBusinessSchema(coach: {
  name: string;
  description?: string;
  image?: string;
  url: string;
  location?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  coachTypes?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `https://getfitconnect.co.uk${coach.url}`,
    "name": coach.name,
    "description": coach.description,
    "image": coach.image,
    "url": `https://getfitconnect.co.uk${coach.url}`,
    ...(coach.location && {
      "address": {
        "@type": "PostalAddress",
        "addressLocality": coach.location,
        "addressCountry": "GB",
      },
    }),
    "priceRange": coach.priceRange || "££",
    ...(coach.rating && coach.reviewCount && {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": coach.rating.toFixed(1),
        "reviewCount": coach.reviewCount,
        "bestRating": "5",
        "worstRating": "1",
      },
    }),
    "areaServed": {
      "@type": "Country",
      "name": "United Kingdom",
    },
    ...(coach.coachTypes && {
      "knowsAbout": coach.coachTypes,
    }),
  };
}

// Helper to create enhanced Article schema
export function createArticleSchema(article: {
  headline: string;
  description: string;
  image?: string;
  url: string;
  author?: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.headline,
    "description": article.description,
    "image": article.image || "https://getfitconnect.co.uk/og-image.png",
    "url": `https://getfitconnect.co.uk${article.url}`,
    "author": {
      "@type": "Organization",
      "name": article.author || "FitConnect",
      "url": "https://getfitconnect.co.uk",
    },
    "publisher": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://getfitconnect.co.uk/pwa-512x512.png",
      },
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified || article.datePublished,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://getfitconnect.co.uk${article.url}`,
    },
    ...(article.keywords && {
      "keywords": article.keywords.join(", "),
    }),
  };
}

// Helper to generate hreflang entries for supported locales
export function createHreflangEntries(
  basePath: string,
  supportedLocales: { lang: string; location: string }[] = [
    { lang: "en-GB", location: "gb" },
    { lang: "en-US", location: "us" },
    { lang: "pl", location: "pl" },
  ]
): HreflangEntry[] {
  return supportedLocales.map((locale) => ({
    lang: locale.lang,
    url: `/${locale.location}-${locale.lang.split("-")[0].toLowerCase()}${basePath}`,
  }));
}
