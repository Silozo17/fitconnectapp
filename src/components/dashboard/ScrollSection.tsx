import { useEffect, useRef, ReactNode, memo } from "react";
import { useScrollSectionContext } from "@/contexts/ScrollSectionContext";

interface ScrollSectionProps {
  id: string;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

const ScrollSection = memo(({ id, title, description, children, className }: ScrollSectionProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const { registerSection, unregisterSection, observeSection, unobserveSection } = useScrollSectionContext();

  useEffect(() => {
    registerSection({
      id,
      title,
      description,
      ref: sectionRef,
    });

    const element = sectionRef.current;
    if (element) {
      observeSection(element);
    }

    return () => {
      unregisterSection(id);
      if (element) {
        unobserveSection(element);
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
