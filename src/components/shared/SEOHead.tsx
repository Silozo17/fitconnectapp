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
    // Primary high-volume keywords
    "personal trainer near me",
    "personal trainer UK",
    "find personal trainer",
    "book personal trainer",
    "hire personal trainer",
    "fitness coach near me",
    "fitness coach UK",
    "online personal training UK",
    "online personal trainer",
    // Specialty coaches
    "boxing coach near me",
    "boxing coach UK",
    "boxing lessons UK",
    "MMA coach near me",
    "MMA coach UK",
    "mixed martial arts training",
    "nutritionist near me UK",
    "online nutritionist UK",
    "nutrition coach UK",
    "macro coaching UK",
    "bodybuilding coach UK",
    "competition prep coach",
    "physique coach UK",
    // Commercial intent keywords
    "fitness marketplace UK",
    "fitness coaching platform",
    "workout plans UK",
    "meal plans UK",
    "digital fitness products",
    "certified fitness professional UK",
    "verified personal trainer",
    // Location-based
    "personal trainer London",
    "personal trainer Manchester",
    "personal trainer Birmingham",
    "fitness coach London",
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
      <meta property="og:image:secure_url" content={fullOgImage} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${fullTitle} - FitConnect`} />
      <meta property="og:site_name" content="FitConnect" />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={`${fullTitle} - FitConnect`} />
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

// Helper to create FAQPage schema for rich results
export function createFAQPageSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  };
}

// Helper to create HowTo schema for step-by-step guides
export function createHowToSchema(howTo: {
  name: string;
  description: string;
  steps: { name: string; text: string; url?: string }[];
  totalTime?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howTo.name,
    "description": howTo.description,
    ...(howTo.totalTime && { "totalTime": howTo.totalTime }),
    "step": howTo.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text,
      ...(step.url && { "url": `https://getfitconnect.co.uk${step.url}` }),
    })),
  };
}

// Helper to create SoftwareApplication schema
export function createSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FitConnect",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web, iOS, Android",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "GBP",
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "250",
      "bestRating": "5",
      "worstRating": "1",
    },
    "description": "UK's leading fitness coach marketplace. Find and book certified personal trainers, boxing coaches, MMA coaches, nutritionists, and bodybuilding coaches.",
    "url": "https://getfitconnect.co.uk",
    "provider": {
      "@type": "Organization",
      "name": "FitConnect",
      "url": "https://getfitconnect.co.uk",
    },
  };
}
