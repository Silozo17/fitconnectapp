interface SectionSentinelProps {
  id: string;
  title: string;
  description: string;
}

/**
 * Invisible marker element that signals section boundaries.
 * Used by useSectionHeaderObserver to detect which section is active.
 * 
 * This is NOT a visible header - it's just a 1px trigger point.
 * The actual header content is shown in the GlobalStickyHeader.
 */
export function SectionSentinel({ id, title, description }: SectionSentinelProps) {
  return (
    <div
      data-section-id={id}
      data-section-title={title}
      data-section-description={description}
      className="h-[1px] w-full pointer-events-none"
      aria-hidden="true"
    />
  );
}

export default SectionSentinel;
