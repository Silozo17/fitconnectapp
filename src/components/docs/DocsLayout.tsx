import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { DocNav } from "./DocNav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SEOHead, createBreadcrumbSchema } from "@/components/shared/SEOHead";

interface BreadcrumbItemType {
  label: string;
  href?: string;
}

interface DocsLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItemType[];
  children: React.ReactNode;
  noIndex?: boolean;
}

const BASE_URL = "https://getfitconnect.co.uk";

export function DocsLayout({ title, description, breadcrumbs = [], children, noIndex = false }: DocsLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  
  // Build breadcrumb schema for SEO
  const breadcrumbSchemaItems = [
    { name: "Home", url: BASE_URL },
    { name: "Help Center", url: `${BASE_URL}/docs` },
    ...breadcrumbs.map(crumb => ({
      name: crumb.label,
      url: crumb.href ? `${BASE_URL}${crumb.href}` : `${BASE_URL}${location.pathname}`
    }))
  ];

  return (
    <>
      <SEOHead
        title={`${title} | FitConnect Help Center`}
        description={description || `Learn about ${title} on FitConnect - comprehensive guides and tutorials for UK fitness coaches and clients.`}
        canonicalPath={location.pathname}
        ogType="article"
        noIndex={noIndex}
        keywords={["FitConnect help", "fitness app guide UK", "personal trainer help", title.toLowerCase()]}
        schema={createBreadcrumbSchema(breadcrumbSchemaItems)}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <div className="flex-1 flex pt-16 md:pt-20">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen">
              <DocNav />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {/* Mobile nav toggle + Breadcrumbs */}
              <div className="flex items-center gap-3 mb-6">
                {/* Mobile Menu Button */}
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden flex-shrink-0">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Open navigation</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
                    <SheetHeader className="p-4 border-b border-border">
                      <SheetTitle>Documentation</SheetTitle>
                    </SheetHeader>
                    <div className="overflow-y-auto max-h-[calc(100vh-80px)]">
                      <DocNav onNavigate={() => setMobileNavOpen(false)} />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                  <Breadcrumb className="flex-1 min-w-0">
                    <BreadcrumbList className="flex-wrap">
                      <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                          <Link to="/docs">Help Center</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      {breadcrumbs.map((crumb: BreadcrumbItemType, index: number) => (
                        <BreadcrumbItem key={index}>
                          <BreadcrumbSeparator />
                          {crumb.href ? (
                            <BreadcrumbLink asChild>
                              <Link to={crumb.href}>{crumb.label}</Link>
                            </BreadcrumbLink>
                          ) : (
                            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                          )}
                        </BreadcrumbItem>
                      ))}
                    </BreadcrumbList>
                  </Breadcrumb>
                )}
              </div>

              {/* Page header */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{title}</h1>
                {description && (
                  <p className="text-base sm:text-lg text-muted-foreground">{description}</p>
                )}
              </div>

              {/* Page content */}
              <div className="prose prose-invert max-w-none">
                {children}
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}