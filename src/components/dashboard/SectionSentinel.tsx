interface SectionSentinelProps {
  id: string;
  title: string;
  description: string;
}

export function SectionSentinel({ id, title, description }: SectionSentinelProps) {
  return (
    <div
      data-section-id={id}
      data-section-title={title}
      data-section-description={description}
      className="h-0 w-full"
      aria-hidden="true"
    />
  );
}

export default SectionSentinel;
