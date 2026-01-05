import { useEffect, useRef, ReactNode, memo } from "react";
import { useScrollSectionContext } from "@/contexts/ScrollSectionContext";
import { useScrollSectionObserver } from "@/hooks/useScrollSectionObserver";

interface ScrollSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const ScrollSection = memo(({ id, title, description, children, className }: ScrollSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { registerSection, unregisterSection } = useScrollSectionContext();
  const { observeSection, unobserveSection } = useScrollSectionObserver();

  useEffect(() => {
    // Register section with context
    registerSection({
      id,
      title,
      description,
      ref: sectionRef,
    });

    // Start observing this section
    if (sectionRef.current) {
      observeSection(sectionRef.current);
    }

    return () => {
      // Cleanup: unregister and stop observing
      unregisterSection(id);
      if (sectionRef.current) {
        unobserveSection(sectionRef.current);
      }
    };
  }, [id, title, description, registerSection, unregisterSection, observeSection, unobserveSection]);

  return (
    <section
      ref={sectionRef}
      data-section-id={id}
      className={className}
      aria-label={title}
    >
      {children}
    </section>
  );
});

ScrollSection.displayName = "ScrollSection";

export default ScrollSection;
