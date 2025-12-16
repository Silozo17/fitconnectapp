import { Button } from "@/components/ui/button";
import { Video, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface JoinMeetingButtonProps {
  meetingUrl: string | null;
  provider?: string | null;
  className?: string;
  size?: "sm" | "default" | "lg";
}

const JoinMeetingButton = ({
  meetingUrl,
  provider,
  className,
  size = "sm",
}: JoinMeetingButtonProps) => {
  if (!meetingUrl) return null;

  const handleJoin = () => {
    window.open(meetingUrl, "_blank", "noopener,noreferrer");
  };

  const providerLabel = provider === "zoom" ? "Zoom" : provider === "google_meet" ? "Google Meet" : "Meeting";

  return (
    <Button
      size={size}
      onClick={handleJoin}
      className={cn(
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
        className
      )}
    >
      <Video className="w-4 h-4 mr-2" />
      Join {providerLabel}
      <ExternalLink className="w-3 h-3 ml-2" />
    </Button>
  );
};

export default JoinMeetingButton;
