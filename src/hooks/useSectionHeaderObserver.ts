import { useState, useEffect, useRef, useCallback } from "react";

interface ActiveSection {
  id: string;
  title: string;
  description: string;
}

interface UseSectionHeaderObserverResult {
  activeSection: ActiveSection | null;
  headerOpacity: number;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useSectionHeaderObserver(): UseSectionHeaderObserverResult {
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find all sentinel elements
    const sentinels = container.querySelectorAll("[data-section-id]");
    if (sentinels.length === 0) return;

    // Track which sentinels are visible and their positions
    const visibleSentinels = new Map<string, { entry: IntersectionObserverEntry; element: Element }>();

    const updateActiveSection = () => {
      if (visibleSentinels.size === 0) {
        setActiveSection(null);
        setHeaderOpacity(0);
        activeSectionRef.current = null;
        return;
      }

      // Find the sentinel closest to the top of the activation zone (top 30% of viewport)
      let bestCandidate: { id: string; element: Element; top: number } | null = null;
      const activationZoneTop = window.innerHeight * 0.15; // 15% from top
      const activationZoneBottom = window.innerHeight * 0.4; // 40% from top

      visibleSentinels.forEach(({ element }, id) => {
        const rect = element.getBoundingClientRect();
        // Sentinel should be above or within the activation zone
        if (rect.top <= activationZoneBottom) {
          if (!bestCandidate || rect.top > bestCandidate.top) {
            bestCandidate = { id, element, top: rect.top };
          }
        }
      });

      if (bestCandidate) {
        const element = bestCandidate.element;
        const id = element.getAttribute("data-section-id") || "";
        const title = element.getAttribute("data-section-title") || "";
        const description = element.getAttribute("data-section-description") || "";

        // Only update if section changed
        if (activeSectionRef.current !== id) {
          activeSectionRef.current = id;
          setActiveSection({ id, title, description });
        }

        // Calculate opacity based on how far past the activation zone the sentinel is
        // Fade in as sentinel enters zone from bottom, stay visible while in zone
        const rect = element.getBoundingClientRect();
        
        // Find the next card/content after this sentinel to know when to fade out
        const nextElement = element.nextElementSibling;
        if (nextElement) {
          const nextRect = nextElement.getBoundingClientRect();
          const headerHeight = 60; // Height of the sticky header
          
          // Fade out when cards approach the header
          if (nextRect.top < headerHeight + 40) {
            const fadeOutProgress = 1 - Math.max(0, Math.min(1, (headerHeight + 40 - nextRect.top) / 60));
            setHeaderOpacity(fadeOutProgress);
          } else if (rect.top < activationZoneTop) {
            // Sentinel has scrolled above activation zone - full opacity
            setHeaderOpacity(1);
          } else if (rect.top <= activationZoneBottom) {
            // Sentinel is entering activation zone - fade in
            const fadeInProgress = 1 - (rect.top - activationZoneTop) / (activationZoneBottom - activationZoneTop);
            setHeaderOpacity(Math.max(0, Math.min(1, fadeInProgress)));
          }
        } else {
          // No next element, just fade based on sentinel position
          if (rect.top < activationZoneTop) {
            setHeaderOpacity(1);
          } else {
            const fadeInProgress = 1 - (rect.top - activationZoneTop) / (activationZoneBottom - activationZoneTop);
            setHeaderOpacity(Math.max(0, Math.min(1, fadeInProgress)));
          }
        }
      } else {
        setActiveSection(null);
        setHeaderOpacity(0);
        activeSectionRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-section-id");
          if (!id) return;

          if (entry.isIntersecting) {
            visibleSentinels.set(id, { entry, element: entry.target });
          } else {
            visibleSentinels.delete(id);
          }
        });

        updateActiveSection();
      },
      {
        root: null,
        // Observe a large portion of the viewport
        rootMargin: "0px 0px -50% 0px",
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    sentinels.forEach((sentinel) => observer.observe(sentinel));

    // Also listen to scroll for smooth opacity updates
    const handleScroll = () => {
      requestAnimationFrame(updateActiveSection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { activeSection, headerOpacity, containerRef };
}

export default useSectionHeaderObserver;
