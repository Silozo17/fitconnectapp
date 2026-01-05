import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode, RefObject } from "react";

interface Section {
  id: string;
  title: string;
  description: string;
  ref: RefObject<HTMLElement>;
}

interface ScrollSectionContextValue {
  sections: Map<string, Section>;
  registerSection: (section: Section) => void;
  unregisterSection: (id: string) => void;
  activeSection: Section | null;
  intersectionRatio: number;
  isAtTop: boolean;
  observeSection: (element: HTMLElement | null) => void;
  unobserveSection: (element: HTMLElement | null) => void;
}

const ScrollSectionContext = createContext<ScrollSectionContextValue | null>(null);

export const ScrollSectionProvider = ({ children }: { children: ReactNode }) => {
  const [sections] = useState<Map<string, Section>>(() => new Map());
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [intersectionRatio, setIntersectionRatio] = useState(0);
  const [isAtTop, setIsAtTop] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const registerSection = useCallback((section: Section) => {
    sections.set(section.id, section);
  }, [sections]);

  const unregisterSection = useCallback((id: string) => {
    sections.delete(id);
  }, [sections]);

  // Create observer once in the provider
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = 0;

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });

        if (bestEntry) {
          const sectionId = bestEntry.target.getAttribute("data-section-id");
          if (sectionId) {
            const section = sections.get(sectionId);
            if (section) {
              setActiveSection(section);
              setIntersectionRatio(bestRatio);
            }
          }
        }
      });
    };

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: "-5% 0px -65% 0px",
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    });

    // Scroll listener for isAtTop
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 80);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      observerRef.current?.disconnect();
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [sections]);

  const observeSection = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserveSection = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return (
    <ScrollSectionContext.Provider
      value={{
        sections,
        registerSection,
        unregisterSection,
        activeSection,
        intersectionRatio,
        isAtTop,
        observeSection,
        unobserveSection,
      }}
    >
      {children}
    </ScrollSectionContext.Provider>
  );
};

export const useScrollSectionContext = () => {
  const context = useContext(ScrollSectionContext);
  if (!context) {
    throw new Error("useScrollSectionContext must be used within ScrollSectionProvider");
  }
  return context;
};

export const useActiveSection = () => {
  const { activeSection, intersectionRatio, isAtTop } = useScrollSectionContext();
  return { activeSection, intersectionRatio, isAtTop };
};
