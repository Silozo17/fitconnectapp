import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { DocNav } from "./DocNav";
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
  return (
    <>
      <Helmet>
        <title>{title} | FitConnect Help Center</title>
        <meta name="description" content={description || `Learn about ${title} on FitConnect`} />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <div className="flex-1 flex">
          {/* Sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen">
              <DocNav />
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Breadcrumbs */}
              {breadcrumbs.length > 0 && (
                <Breadcrumb className="mb-6">
                  <BreadcrumbList>
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

              {/* Page header */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                {description && (
                  <p className="text-lg text-muted-foreground">{description}</p>
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
