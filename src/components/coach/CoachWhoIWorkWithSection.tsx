import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CoachWhoIWorkWithSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function CoachWhoIWorkWithSection({ value, onChange }: CoachWhoIWorkWithSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Who I Work With</CardTitle>
        <CardDescription>
          Describe your ideal clients and the types of people you love working with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="who-i-work-with">Description</Label>
          <Textarea
            id="who-i-work-with"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g., I specialise in working with busy professionals who want to build strength and improve their energy levels. Whether you're a complete beginner or returning to fitness after a break, I create personalised programs that fit your lifestyle..."
            rows={5}
          />
          <p className="text-xs text-muted-foreground">
            Be specific about who you help and what outcomes they can expect
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
