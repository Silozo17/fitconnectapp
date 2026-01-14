import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, Megaphone, UserPlus } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";

const MARKETING_SOURCES = [
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "word-of-mouth", label: "Word of Mouth" },
  { value: "beaconsfield-roundabout", label: "Beaconsfield Roundabout" },
  { value: "walk-in", label: "Walk In" },
  { value: "other", label: "Other" },
];

interface MarketingStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function MarketingStep({ onNext, onBack }: MarketingStepProps) {
  const { formData, updateFormData } = useSignupWizard();

  const isValid = !!formData.marketingSource && 
    (formData.marketingSource !== "other" || formData.marketingSourceOther.trim());

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Almost There!</h2>
        <p className="text-muted-foreground">Help us understand how you found us</p>
      </div>

      {/* Referral */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Referral
          </CardTitle>
          <CardDescription>
            Were you referred by a friend? Enter their email to let them know!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="referredBy">Referred by (email)</Label>
            <Input
              id="referredBy"
              type="email"
              value={formData.referredByEmail}
              onChange={(e) => updateFormData({ referredByEmail: e.target.value })}
              placeholder="friend@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Marketing Source */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            How did you hear about us? *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup
            value={formData.marketingSource}
            onValueChange={(value) =>
              updateFormData({ marketingSource: value, marketingSourceOther: "" })
            }
            className="grid gap-3 sm:grid-cols-2"
          >
            {MARKETING_SOURCES.map((source) => (
              <div
                key={source.value}
                className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  formData.marketingSource === source.value
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() =>
                  updateFormData({ marketingSource: source.value, marketingSourceOther: "" })
                }
              >
                <RadioGroupItem value={source.value} id={source.value} />
                <Label htmlFor={source.value} className="cursor-pointer flex-1">
                  {source.label}
                </Label>
              </div>
            ))}
          </RadioGroup>

          {formData.marketingSource === "other" && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="marketingOther">Please specify *</Label>
              <Input
                id="marketingOther"
                value={formData.marketingSourceOther}
                onChange={(e) => updateFormData({ marketingSourceOther: e.target.value })}
                placeholder="How did you find us?"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Continue
        </Button>
      </div>
    </div>
  );
}
