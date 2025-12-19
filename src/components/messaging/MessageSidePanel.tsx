import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminView } from "@/contexts/AdminContext";
import QuickSendContent from "./QuickSendContent";

interface MessageSidePanelProps {
  participantId: string;
  clientId?: string;
  onSendMessage: (message: string) => Promise<boolean>;
  onClose?: () => void;
}

const MessageSidePanel = ({ participantId, clientId, onSendMessage, onClose }: MessageSidePanelProps) => {
  const { activeProfileType } = useAdminView();

  // Only show for coaches (including admins viewing as coach)
  if (activeProfileType !== "coach") return null;

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      <div className="p-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold text-sm text-foreground">Quick Send</h3>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <QuickSendContent
        participantId={participantId}
        clientId={clientId}
        onSendMessage={onSendMessage}
        variant="sidebar"
      />
    </div>
  );
};

export default MessageSidePanel;
