import { usePublicCoachCaseStudies, PublicCaseStudy } from "@/hooks/usePublicCoachShowcases";
import { ContentSection, ContentSectionHeader } from "@/components/shared/ContentSection";
import { FileText, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { parseSimpleMarkdown } from "@/lib/markdown-utils";

interface Props {
  coachId: string;
}

function CaseStudyCard({ caseStudy }: { caseStudy: PublicCaseStudy }) {
  const [showDetail, setShowDetail] = useState(false);
  const content = caseStudy.content || {};

  return (
    <>
      <div 
        className="cursor-pointer rounded-xl bg-muted/30 p-4 hover:bg-muted/50 transition-all duration-300 hover:scale-[1.01]"
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
              {caseStudy.title}
            </h3>
            {content.summary && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.summary}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </div>

      {/* Case Study Detail Modal */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{caseStudy.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {content.summary && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Overview</h3>
                  <p className="text-muted-foreground">{content.summary}</p>
                </div>
              )}

              <Separator />

              {content.challenge && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">The Challenge</h3>
                  <p className="text-muted-foreground">{content.challenge}</p>
                </div>
              )}

              {content.approach && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">The Approach</h3>
                  <p className="text-muted-foreground">{content.approach}</p>
                </div>
              )}

              {content.results && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">The Results</h3>
                  <p className="text-muted-foreground">{content.results}</p>
                </div>
              )}

              {content.testimonial && (
                <div>
                  <h3 className="font-semibold mb-2 text-foreground">Client Testimonial</h3>
                  <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
                    "{content.testimonial}"
                  </blockquote>
                </div>
              )}

              {caseStudy.generated_narrative && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 text-foreground">Full Story</h3>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: parseSimpleMarkdown(caseStudy.generated_narrative) 
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CoachCaseStudiesSection({ coachId }: Props) {
  const { data: caseStudies = [], isLoading } = usePublicCoachCaseStudies(coachId);

  if (isLoading || caseStudies.length === 0) return null;

  return (
    <ContentSection colorTheme="purple">
      <ContentSectionHeader
        icon={FileText}
        title={`Success Stories (${caseStudies.length})`}
      />
      <div className="space-y-3 pt-4">
        {caseStudies.map((caseStudy) => (
          <CaseStudyCard key={caseStudy.id} caseStudy={caseStudy} />
        ))}
      </div>
    </ContentSection>
  );
}
