import { CheckCircle, Award, Calendar, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCoachQualifications } from "@/hooks/useCoachQualifications";
import { format, parseISO, isPast } from "date-fns";
import { cn } from "@/lib/utils";

interface CoachQualificationsSectionProps {
  coachId: string;
}

export function CoachQualificationsSection({ coachId }: CoachQualificationsSectionProps) {
  const { data: qualifications = [], isLoading } = useCoachQualifications(coachId);

  if (isLoading) {
    return null;
  }

  if (qualifications.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(parseISO(dateStr), "MMM yyyy");
    } catch {
      return null;
    }
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    try {
      return isPast(parseISO(dateStr));
    } catch {
      return false;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-primary" />
          Qualifications & Certifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {qualifications.map((qual) => {
            const expired = isExpired(qual.expiry_date);
            
            return (
              <div
                key={qual.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg bg-muted/50",
                  expired && "opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {qual.name}
                    </span>
                    {qual.is_verified && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-primary/30 text-primary bg-primary/5 gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                    {expired && (
                      <Badge variant="secondary" className="text-xs">
                        Expired
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    {qual.issuing_authority && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {qual.issuing_authority}
                      </span>
                    )}
                    {(qual.issue_date || qual.expiry_date) && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(qual.issue_date)}
                        {qual.expiry_date && ` - ${formatDate(qual.expiry_date)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
