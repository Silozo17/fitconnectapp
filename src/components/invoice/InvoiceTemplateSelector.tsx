import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { INVOICE_TEMPLATES, TemplateId } from "@/hooks/useCoachInvoiceSettings";

interface InvoiceTemplateSelectorProps {
  selectedTemplate: TemplateId;
  onSelect: (template: TemplateId) => void;
  accentColor?: string;
}

export function InvoiceTemplateSelector({
  selectedTemplate,
  onSelect,
  accentColor = "#BEFF00",
}: InvoiceTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {INVOICE_TEMPLATES.map((template) => {
        const isSelected = selectedTemplate === template.id;
        
        return (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all text-left",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
          >
            {/* Preview */}
            <div
              className={cn(
                "h-24 rounded-lg mb-3 flex items-center justify-center overflow-hidden",
                template.preview
              )}
              style={template.id === "modern" ? { background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` } : undefined}
            >
              <InvoiceMiniPreview templateId={template.id} accentColor={accentColor} />
            </div>

            {/* Info */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-foreground">{template.name}</h4>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function InvoiceMiniPreview({ templateId, accentColor }: { templateId: string; accentColor: string }) {
  const baseClasses = "w-full h-full p-2 flex flex-col gap-1";
  
  switch (templateId) {
    case "modern":
      return (
        <div className={cn(baseClasses, "bg-card border border-border rounded")}>
          <div className="h-2 w-8 rounded" style={{ backgroundColor: accentColor }} />
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full bg-muted rounded" />
            <div className="h-1 w-3/4 bg-muted rounded" />
          </div>
          <div className="h-2 w-6 rounded ml-auto" style={{ backgroundColor: accentColor }} />
        </div>
      );
    case "classic":
      return (
        <div className={cn(baseClasses, "bg-white border border-gray-200 rounded")}>
          <div className="h-2 w-12 bg-gray-800 rounded" />
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full bg-gray-200 rounded" />
            <div className="h-1 w-3/4 bg-gray-200 rounded" />
          </div>
          <div className="h-px w-full bg-gray-800" />
        </div>
      );
    case "minimal":
      return (
        <div className={cn(baseClasses, "bg-white border border-gray-100 rounded")}>
          <div className="h-2 w-8 bg-gray-400 rounded" />
          <div className="flex-1" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-gray-100 rounded" />
            <div className="h-1 w-1/2 bg-gray-100 rounded" />
          </div>
        </div>
      );
    case "bold":
      return (
        <div className={cn(baseClasses, "bg-gray-900 border border-gray-700 rounded")}>
          <div className="h-3 w-10 bg-white rounded" />
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full bg-gray-700 rounded" />
            <div className="h-1 w-3/4 bg-gray-700 rounded" />
          </div>
          <div className="h-2 w-8 bg-white rounded ml-auto" />
        </div>
      );
    case "professional":
      return (
        <div className={cn(baseClasses, "bg-slate-50 border border-slate-200 rounded")}>
          <div className="flex justify-between items-center">
            <div className="h-2 w-6 bg-blue-600 rounded" />
            <div className="h-2 w-4 bg-slate-300 rounded" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="h-1 w-full bg-slate-200 rounded" />
            <div className="h-1 w-3/4 bg-slate-200 rounded" />
          </div>
          <div className="h-px w-full bg-blue-600" />
        </div>
      );
    default:
      return null;
  }
}
