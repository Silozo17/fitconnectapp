import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export const UserAvatar = ({ src, name, className, fallbackClassName }: UserAvatarProps) => {
  const getInitials = () => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate consistent color based on name
  const getAvatarColor = () => {
    if (!name) return "bg-primary/20 text-primary";
    const colors = [
      "bg-primary/20 text-primary",
      "bg-accent/20 text-accent",
      "bg-blue-500/20 text-blue-500",
      "bg-green-500/20 text-green-500",
      "bg-purple-500/20 text-purple-500",
      "bg-orange-500/20 text-orange-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Avatar className={cn("border border-border", className)}>
      <AvatarImage src={src || undefined} alt={name || "User"} className="object-cover" />
      <AvatarFallback className={cn("font-semibold", getAvatarColor(), fallbackClassName)}>
        {getInitials()}
      </AvatarFallback>
    </Avatar>
  );
};
