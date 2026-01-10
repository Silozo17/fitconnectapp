import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseStudy: any;
}

export function CaseStudyPreview({ open, onOpenChange, caseStudy }: Props) {
  const { t } = useTranslation("coach");
  const content = caseStudy?.content || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{caseStudy?.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {content.summary && (
              <div>
                <h3 className="font-semibold mb-2">{t("caseStudies.sections.overview")}</h3>
                <p className="text-muted-foreground">{content.summary}</p>
              </div>
            )}

            <Separator />

            {content.challenge && (
              <div>
                <h3 className="font-semibold mb-2">{t("caseStudies.sections.challenge")}</h3>
                <p className="text-muted-foreground">{content.challenge}</p>
              </div>
            )}

            {content.approach && (
              <div>
                <h3 className="font-semibold mb-2">{t("caseStudies.sections.approach")}</h3>
                <p className="text-muted-foreground">{content.approach}</p>
              </div>
            )}

            {content.results && (
              <div>
                <h3 className="font-semibold mb-2">{t("caseStudies.sections.results")}</h3>
                <p className="text-muted-foreground">{content.results}</p>
              </div>
            )}

            {content.testimonial && (
              <div>
                <h3 className="font-semibold mb-2">{t("caseStudies.sections.testimonial")}</h3>
                <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                  "{content.testimonial}"
                </blockquote>
              </div>
            )}

            {caseStudy?.generated_narrative && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">{t("caseStudies.fullNarrative")}</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    {caseStudy.generated_narrative}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
