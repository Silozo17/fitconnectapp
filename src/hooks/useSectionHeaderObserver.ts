import { useState, useEffect, useRef } from "react";

interface ActiveSection {
  id: string;
  title: string;
  description: string;
}

interface UseSectionHeaderObserverResult {
  activeSection: ActiveSection | null;
  greetingOpacity: number;
  sectionOpacity: number;
  showSection: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}

export function useSectionHeaderObserver(): UseSectionHeaderObserverResult {
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null);
  const [greetingOpacity, setGreetingOpacity] = useState(1);
  const [sectionOpacity, setSectionOpacity] = useState(0);
  const [showSection, setShowSection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeSectionRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Find all sentinel elements (skip the first "activity" section)
    const allSentinels = container.querySelectorAll("[data-section-id]");
    const sentinels = Array.from(allSentinels).filter(
      (el) => el.getAttribute("data-section-id") !== "activity"
    );
    
    // Find the first section sentinel for greeting fade calculation
    const firstSentinel = container.querySelector("[data-section-id='activity']");
    
    if (sentinels.length === 0 && !firstSentinel) return;

    // Track which sentinels are visible
    const visibleSentinels = new Map<string, { element: Element }>();

    const updateState = () => {
      const headerHeight = 72; // Height of sticky header
      const fadeZoneStart = headerHeight + 80; // Start fading when content is this far from top
      const fadeZoneEnd = headerHeight + 20; // Fully faded when this close to top
      
      // Calculate greeting opacity based on first section content position
      if (firstSentinel) {
        const firstSentinelRect = firstSentinel.getBoundingClientRect();
        const nextElement = firstSentinel.nextElementSibling;
        
        if (nextElement) {
          const contentRect = nextElement.getBoundingClientRect();
          
          // Fade greeting as first section content approaches header
          if (contentRect.top > fadeZoneStart) {
            setGreetingOpacity(1);
          } else if (contentRect.top < fadeZoneEnd) {
            setGreetingOpacity(0);
          } else {
            const progress = (contentRect.top - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd);
            setGreetingOpacity(Math.max(0, Math.min(1, progress)));
          }
        }
      }

      // Find active section (from sections after the first)
      if (visibleSentinels.size === 0) {
        setActiveSection(null);
        setSectionOpacity(0);
        setShowSection(false);
        activeSectionRef.current = null;
        return;
      }

      // Find the sentinel closest to the top but past the activation point
      const activationPoint = window.innerHeight * 0.35; // 35% from top
      let bestCandidate: { id: string; element: Element; top: number } | null = null;

      visibleSentinels.forEach(({ element }, id) => {
        const rect = element.getBoundingClientRect();
        // Sentinel should be above or at the activation point
        if (rect.top <= activationPoint) {
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

        // Update active section if changed
        if (activeSectionRef.current !== id) {
          activeSectionRef.current = id;
          setActiveSection({ id, title, description });
        }

        setShowSection(true);

        // Calculate section header opacity
        const nextElement = element.nextElementSibling;
        if (nextElement) {
          const contentRect = nextElement.getBoundingClientRect();
          
          // Fade out when cards approach the header
          if (contentRect.top < fadeZoneEnd) {
            const fadeProgress = Math.max(0, contentRect.top / fadeZoneEnd);
            setSectionOpacity(fadeProgress);
          } else if (contentRect.top < fadeZoneStart) {
            // Fade in as section enters
            const fadeInProgress = 1 - (contentRect.top - fadeZoneEnd) / (fadeZoneStart - fadeZoneEnd);
            setSectionOpacity(Math.max(0, Math.min(1, fadeInProgress)));
          } else {
            setSectionOpacity(1);
          }
        } else {
          setSectionOpacity(1);
        }
      } else {
        // No active section from the tracked ones
        setShowSection(false);
        setSectionOpacity(0);
        activeSectionRef.current = null;
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-section-id");
          if (!id || id === "activity") return; // Skip first section

          if (entry.isIntersecting) {
            visibleSentinels.set(id, { element: entry.target });
          } else {
            visibleSentinels.delete(id);
          }
        });

        updateState();
      },
      {
        root: null,
        rootMargin: "0px 0px -40% 0px",
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    sentinels.forEach((sentinel) => observer.observe(sentinel));

    // Also observe the first sentinel for greeting fade
    if (firstSentinel) {
      observer.observe(firstSentinel);
    }

    // Listen to scroll for smooth opacity updates
    const handleScroll = () => {
      requestAnimationFrame(updateState);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return { activeSection, greetingOpacity, sectionOpacity, showSection, containerRef };
}

export default useSectionHeaderObserver;
