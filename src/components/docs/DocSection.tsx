import { cn } from "@/lib/utils";

interface DocSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function DocSection({ title, children, className }: DocSectionProps) {
  return (
    <section className={cn("mb-8", className)}>
      <h2 className="text-xl font-semibold mb-4 text-foreground">{title}</h2>
      {children}
    </section>
  );
}
