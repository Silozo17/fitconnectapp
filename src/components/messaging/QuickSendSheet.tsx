import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import QuickSendContent from "./QuickSendContent";

interface QuickSendSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantId: string;
  clientId?: string;
  onSendMessage: (message: string) => Promise<boolean>;
}

const QuickSendSheet = ({ 
  open, 
  onOpenChange, 
  participantId, 
  clientId, 
  onSendMessage 
}: QuickSendSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[75vh] rounded-t-2xl px-0"
      >
        <SheetHeader className="px-4 pb-2 border-b border-border">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />
          <SheetTitle className="text-left">Quick Send</SheetTitle>
        </SheetHeader>
        
        <QuickSendContent
          participantId={participantId}
          clientId={clientId}
          onSendMessage={async (message) => {
            const result = await onSendMessage(message);
            if (result) {
              onOpenChange(false);
            }
            return result;
          }}
          variant="sheet"
        />
      </SheetContent>
    </Sheet>
  );
};

export default QuickSendSheet;
