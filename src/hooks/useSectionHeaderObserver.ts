import { useState, useEffect, useRef, useCallback } from "react";

interface ActiveSection {
  title: string;
  description: string;
}

interface UseSectionHeaderObserverResult {
  mode: "greeting" | "section";
  activeSection: ActiveSection | null;
  headerOpacity: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

// Clamp helper
const clamp = (value: number, min: number, max: number) => 
  Math.max(min, Math.min(max, value));

export function useSectionHeaderObserver(): UseSectionHeaderObserverResult {
  const [mode, setMode] = useState<"greeting" | "section">("greeting");
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null);
  const [headerOpacity, setHeaderOpacity] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Track visible sentinels with their intersection ratios
  const visibleSentinelsRef = useRef<Map<string, { element: Element; ratio: number }>>(new Map());

  const updateHeaderState = useCallback(() => {
    const HEADER_HEIGHT = 72;
    const container = scrollContainerRef.current;
    if (!container) return;

    const sentinels = visibleSentinelsRef.current;
    
    // If no sentinels are visible/active, show greeting
    if (sentinels.size === 0) {
      setMode("greeting");
      setActiveSection(null);
      setHeaderOpacity(1);
      return;
    }

    // Find the sentinel that's most "active" (closest to top, past the header)
    let bestCandidate: { id: string; element: Element; top: number; ratio: number } | null = null;
    
    sentinels.forEach(({ element, ratio }, id) => {
      const rect = element.getBoundingClientRect();
      // Sentinel should be at or above the activation threshold (35% from top)
      const activationThreshold = window.innerHeight * 0.35;
      
      if (rect.top <= activationThreshold) {
        if (!bestCandidate || rect.top > bestCandidate.top) {
          bestCandidate = { id, element, top: rect.top, ratio };
        }
      }
    });

    if (bestCandidate) {
      const { element } = bestCandidate;
      const title = element.getAttribute("data-section-title") || "";
      const description = element.getAttribute("data-section-description") || "";
      
      setMode("section");
      setActiveSection({ title, description });
      
      // Calculate opacity based on how close the next content is to the header
      // The content after the sentinel
      const nextElement = element.nextElementSibling;
      if (nextElement) {
        const contentRect = nextElement.getBoundingClientRect();
        const fadeZoneStart = HEADER_HEIGHT + 100; // Start fading when content is this far
        const fadeZoneEnd = HEADER_HEIGHT + 20; // Fully faded when this close
        
        if (contentRect.top > fadeZoneStart) {
          setHeaderOpacity(1);
        } else if (contentRect.top < fadeZoneEnd) {
          setHeaderOpacity(0);
        } else {
          const progress = (contentRect.top - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd);
          setHeaderOpacity(clamp(progress, 0, 1));
        }
      } else {
        setHeaderOpacity(1);
      }
    } else {
      // No sentinel past activation threshold - check if we should show greeting
      // Find if any sentinel is visible but above threshold
      let highestVisibleSentinel: { element: Element; top: number } | null = null;
      
      sentinels.forEach(({ element }) => {
        const rect = element.getBoundingClientRect();
        if (!highestVisibleSentinel || rect.top < highestVisibleSentinel.top) {
          highestVisibleSentinel = { element, top: rect.top };
        }
      });
      
      if (highestVisibleSentinel && highestVisibleSentinel.top > HEADER_HEIGHT) {
        // Show greeting, fade based on how close first content is
        setMode("greeting");
        setActiveSection(null);
        
        const nextElement = highestVisibleSentinel.element.nextElementSibling;
        if (nextElement) {
          const contentRect = nextElement.getBoundingClientRect();
          const fadeZoneStart = HEADER_HEIGHT + 100;
          const fadeZoneEnd = HEADER_HEIGHT + 20;
          
          if (contentRect.top > fadeZoneStart) {
            setHeaderOpacity(1);
          } else if (contentRect.top < fadeZoneEnd) {
            setHeaderOpacity(0);
          } else {
            const progress = (contentRect.top - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd);
            setHeaderOpacity(clamp(progress, 0, 1));
          }
        } else {
          setHeaderOpacity(1);
        }
      } else {
        setMode("greeting");
        setActiveSection(null);
        setHeaderOpacity(1);
      }
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Find all sentinel elements
    const sentinels = container.querySelectorAll("[data-section-id]");
    if (sentinels.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-section-id");
          if (!id) return;

          if (entry.isIntersecting) {
            visibleSentinelsRef.current.set(id, { 
              element: entry.target, 
              ratio: entry.intersectionRatio 
            });
          } else {
            visibleSentinelsRef.current.delete(id);
          }
        });

        updateHeaderState();
      },
      {
        root: null,
        rootMargin: "-72px 0px -30% 0px", // Account for header height
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sentinels.forEach((sentinel) => observer.observe(sentinel));

    // Listen to scroll for smooth opacity updates
    const handleScroll = () => {
      requestAnimationFrame(updateHeaderState);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial state
    updateHeaderState();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      visibleSentinelsRef.current.clear();
    };
  }, [updateHeaderState]);

  return { mode, activeSection, headerOpacity, scrollContainerRef };
}

export default useSectionHeaderObserver;
