import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { docsSearchIndex, DocSearchItem } from "@/data/docsSearchIndex";
import { cn } from "@/lib/utils";

interface DocSearchProps {
  className?: string;
  onSelect?: () => void;
}

export function DocSearch({ className, onSelect }: DocSearchProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const isAdmin = role === "admin" || role === "manager" || role === "staff";
  
  // Filter out admin docs for non-admin users
  const availableDocs = docsSearchIndex.filter(
    (doc) => doc.category !== "For Administrators" || isAdmin
  );

  // Group docs by category
  const groupedDocs = availableDocs.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocSearchItem[]>);

  // Filter docs based on search
  const filterDocs = useCallback((docs: DocSearchItem[], query: string) => {
    if (!query) return docs.slice(0, 5); // Show top 5 per category when no search
    
    const lowerQuery = query.toLowerCase();
    return docs.filter((doc) => {
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
      const keywordMatch = doc.keywords.some((kw) => kw.includes(lowerQuery));
      return titleMatch || keywordMatch;
    });
  }, []);

  // Handle selection
  const handleSelect = (href: string) => {
    navigate(href);
    setOpen(false);
    setSearch("");
    onSelect?.();
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Calculate total results
  const hasResults = Object.values(groupedDocs).some(
    (docs) => filterDocs(docs, search).length > 0
  );

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Command 
        className="rounded-lg border border-border bg-card shadow-md overflow-hidden"
        shouldFilter={false}
      >
        <CommandInput
          placeholder={t('placeholder.search')}
          value={search}
          onValueChange={setSearch}
          onFocus={() => setOpen(true)}
          className="h-12"
        />
        
        {open && (
          <CommandList className="max-h-[300px] overflow-y-auto border-t border-border">
            {!hasResults && search && (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                No results found for "{search}"
              </CommandEmpty>
            )}
            
            {Object.entries(groupedDocs).map(([category, docs]) => {
              const filteredDocs = filterDocs(docs, search);
              if (filteredDocs.length === 0) return null;
              
              return (
                <CommandGroup key={category} heading={category}>
                  {filteredDocs.slice(0, 6).map((doc) => (
                    <CommandItem
                      key={doc.href}
                      value={doc.href}
                      onSelect={() => handleSelect(doc.href)}
                      className="flex items-center gap-2 px-3 py-2 cursor-pointer"
                    >
                      <doc.icon className="h-4 w-4 text-muted-foreground" />
                      <span>{doc.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              );
            })}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
