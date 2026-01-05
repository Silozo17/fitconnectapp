import { useEffect, useRef, useCallback } from "react";
import { useScrollSectionContext } from "@/contexts/ScrollSectionContext";

export const useScrollSectionObserver = () => {
  const { sections, setActiveSection, setIntersectionRatio, setIsAtTop } = useScrollSectionContext();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    // Cancel pending RAF to prevent stale updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      // Find the entry with the highest intersection ratio in the activation zone
      let bestEntry: IntersectionObserverEntry | null = null;
      let bestRatio = 0;

      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
          bestRatio = entry.intersectionRatio;
          bestEntry = entry;
        }
      });

      if (bestEntry) {
        const sectionId = (bestEntry as IntersectionObserverEntry).target.getAttribute("data-section-id");
        if (sectionId) {
          const section = sections.get(sectionId);
          if (section) {
            setActiveSection(section);
            setIntersectionRatio(bestRatio);
          }
        }
      }
    });
  }, [sections, setActiveSection, setIntersectionRatio]);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    // Consider "at top" when within first 80px of scroll
    setIsAtTop(scrollTop < 80);
  }, [setIsAtTop]);

  useEffect(() => {
    // Set up intersection observer
    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      // Activation zone: top 30% of viewport
      rootMargin: "-5% 0px -65% 0px",
      threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    });

    // Initial scroll check
    handleScroll();

    // Add scroll listener with passive flag for performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleIntersection, handleScroll]);

  // Function to observe a section element
  const observeSection = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  // Function to unobserve a section element
  const unobserveSection = useCallback((element: HTMLElement | null) => {
    if (element && observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  return { observeSection, unobserveSection };
};
