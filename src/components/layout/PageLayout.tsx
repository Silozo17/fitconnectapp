import { ReactNode } from "react";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
  noIndex?: boolean;
  keywords?: string[];
  schema?: object | object[];
  breadcrumbs?: BreadcrumbItem[];
}

const PageLayout = ({ 
  children, 
  title, 
  description,
  canonicalPath,
  ogImage,
  ogType,
  noIndex,
  keywords,
  schema,
  breadcrumbs,
}: PageLayoutProps) => {
  // Combine custom schema with breadcrumb schema if breadcrumbs provided
  const combinedSchema = breadcrumbs 
    ? [
        ...(Array.isArray(schema) ? schema : schema ? [schema] : []),
        createBreadcrumbSchema(breadcrumbs),
      ]
    : schema;

  return (
    <>
      <SEOHead
        title={title}
        description={description}
        canonicalPath={canonicalPath}
        ogImage={ogImage}
        ogType={ogType}
        noIndex={noIndex}
        keywords={keywords}
        schema={combinedSchema}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default PageLayout;
