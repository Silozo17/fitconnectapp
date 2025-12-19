import { cn } from "@/lib/utils";

interface VisuallyHiddenProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Visually hidden component for screen reader only content.
 * Content is hidden visually but remains accessible to screen readers.
 */
const VisuallyHidden = ({ 
  children, 
  as: Component = "span",
  className 
}: VisuallyHiddenProps) => {
  return (
    <Component className={cn("sr-only", className)}>
      {children}
    </Component>
  );
};

export default VisuallyHidden;
