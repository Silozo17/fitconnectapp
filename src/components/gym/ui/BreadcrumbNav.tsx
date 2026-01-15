import * as React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        
        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-[hsl(var(--gym-card-muted))]" />
            )}
            {isLast ? (
              <span className="font-medium text-[hsl(var(--gym-card-fg))]">
                {item.label}
              </span>
            ) : item.href ? (
              <Link
                to={item.href}
                className="text-[hsl(var(--gym-card-muted))] hover:text-[hsl(var(--gym-card-fg))] transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-[hsl(var(--gym-card-muted))]">{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
