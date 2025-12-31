import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Eye } from "lucide-react";
import { useMessageVariables } from "@/hooks/useMessageVariables";
import { cn } from "@/lib/utils";

interface MessagePreviewProps {
  template: string;
  sampleData?: {
    clientName?: string;
    coachName?: string;
  };
  className?: string;
  showWarnings?: boolean;
}

export function MessagePreview({
  template,
  sampleData,
  className,
  showWarnings = true,
}: MessagePreviewProps) {
  const { previewMessage, findUnknownVariables, extractVariables } = useMessageVariables();

  const preview = useMemo(
    () => previewMessage(template, sampleData),
    [template, sampleData, previewMessage]
  );

  const usedVariables = useMemo(
    () => extractVariables(template),
    [template, extractVariables]
  );

  const unknownVariables = useMemo(
    () => findUnknownVariables(template),
    [template, findUnknownVariables]
  );

  if (!template) {
    return (
      <Card className={cn("bg-muted/30", className)}>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Enter a message to see preview
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-muted/30", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Warning for unknown variables */}
        {showWarnings && unknownVariables.length > 0 && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-700">
                Unknown variables detected
              </p>
              <div className="flex flex-wrap gap-1">
                {unknownVariables.map((v) => (
                  <Badge
                    key={v}
                    variant="outline"
                    className="font-mono text-xs bg-amber-500/10 border-amber-500/30 text-amber-700"
                  >
                    {`{${v}}`}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-amber-600/80">
                These will be removed when the message is sent.
              </p>
            </div>
          </div>
        )}

        {/* Preview message */}
        <div className="p-3 rounded-md bg-background border text-sm whitespace-pre-wrap">
          {preview}
        </div>

        {/* Variables used */}
        {usedVariables.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Variables:</span>
            {usedVariables.map((v) => {
              const isUnknown = unknownVariables.includes(v);
              return (
                <Badge
                  key={v}
                  variant="outline"
                  className={cn(
                    "font-mono text-xs",
                    isUnknown
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-700"
                      : "bg-primary/10 border-primary/30 text-primary"
                  )}
                >
                  {`{${v}}`}
                </Badge>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
