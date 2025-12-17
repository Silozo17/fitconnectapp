import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
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

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DocsLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

export function DocsLayout({ title, description, breadcrumbs = [], children }: DocsLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>{title} | FitConnect Help Center</title>
        <meta name="description" content={description || `Learn about ${title} on FitConnect`} />
      </Helmet>

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
                      {breadcrumbs.map((crumb, index) => (
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