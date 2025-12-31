import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
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

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Calculate total results
  const hasResults = Object.values(groupedDocs).some(
    (docs) => filterDocs(docs, search).length > 0
  );

  return (
    <div className={cn("relative w-full", className)}>
      <Command 
        className="rounded-lg border border-border bg-card shadow-md"
        shouldFilter={false}
      >
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <CommandInput
            placeholder={t('placeholder.search')}
            value={search}
            onValueChange={setSearch}
            onFocus={() => setOpen(true)}
            className="flex h-12 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        
        {open && (
          <CommandList className="max-h-[300px] overflow-y-auto">
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
