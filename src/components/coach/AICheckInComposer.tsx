import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, RefreshCw, Send, Zap, Heart, Briefcase } from "lucide-react";
import { useAICheckInComposer, MessageTone, ClientContext } from "@/hooks/useAICheckInComposer";
import { cn } from "@/lib/utils";

interface AICheckInComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientContext: ClientContext;
  onSend: (message: string) => void;
}

const toneOptions: { value: MessageTone; label: string; icon: typeof Zap; description: string }[] = [
  {
    value: "motivational",
    label: "Motivational",
    icon: Zap,
    description: "Energetic and encouraging",
  },
  {
    value: "supportive",
    label: "Supportive",
    icon: Heart,
    description: "Warm and empathetic",
  },
  {
    value: "professional",
    label: "Professional",
    icon: Briefcase,
    description: "Clear and direct",
  },
];

export function AICheckInComposer({ open, onOpenChange, clientContext, onSend }: AICheckInComposerProps) {
  const [selectedTone, setSelectedTone] = useState<MessageTone>("supportive");
  const [editedMessage, setEditedMessage] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  
  const { generateMessage, isGenerating, generatedMessage, clearMessage } = useAICheckInComposer();

  // Generate on first open
  useEffect(() => {
    if (open && !hasGenerated && !isGenerating) {
      handleGenerate();
      setHasGenerated(true);
    }
    // Reset when dialog closes
    if (!open) {
      setHasGenerated(false);
      setEditedMessage("");
      clearMessage();
    }
  }, [open]);

  // Update edited message when generation completes
  useEffect(() => {
    if (generatedMessage?.message) {
      setEditedMessage(generatedMessage.message);
    }
  }, [generatedMessage]);

  const handleGenerate = async () => {
    await generateMessage(clientContext, selectedTone);
  };

  const handleToneChange = async (tone: MessageTone) => {
    setSelectedTone(tone);
    await generateMessage(clientContext, tone);
  };

  const handleSend = () => {
    if (editedMessage.trim()) {
      onSend(editedMessage.trim());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Check-In Composer
          </DialogTitle>
          <DialogDescription>
            Generate a personalized message for {clientContext.clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Context summary */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{clientContext.clientName}</span>
              <Badge variant="outline" className="text-xs">
                {clientContext.reason.replace(/_/g, " ")}
              </Badge>
            </div>
            {clientContext.reasonContext && (
              <p className="text-xs text-muted-foreground">{clientContext.reasonContext}</p>
            )}
          </div>

          {/* Tone selector */}
          <div className="space-y-2">
            <Label className="text-sm">Message Tone</Label>
            <div className="grid grid-cols-3 gap-2">
              {toneOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => !isGenerating && handleToneChange(option.value)}
                    disabled={isGenerating}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      selectedTone === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                      isGenerating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <Icon className={cn(
                      "h-4 w-4",
                      selectedTone === option.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated message */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Message</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="h-7 text-xs"
              >
                {isGenerating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Regenerate
              </Button>
            </div>
            
            <div className="relative">
              {isGenerating && !editedMessage && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30 rounded-md">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </div>
                </div>
              )}
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                placeholder={isGenerating ? "Generating message..." : "Your message will appear here..."}
                className="min-h-[120px] resize-none"
                disabled={isGenerating && !editedMessage}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Edit the message above or regenerate with a different tone
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSend} 
              disabled={!editedMessage.trim() || isGenerating}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
