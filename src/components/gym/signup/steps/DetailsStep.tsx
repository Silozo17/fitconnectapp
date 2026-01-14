import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Heart, Phone } from "lucide-react";
import { useSignupWizard } from "../SignupWizardContext";

interface DetailsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function DetailsStep({ onNext, onBack }: DetailsStepProps) {
  const { formData, updateFormData } = useSignupWizard();

  const isValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.emergencyContactName.trim() &&
    formData.emergencyContactPhone.trim();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Your Details</h2>
        <p className="text-muted-foreground">Tell us about yourself</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateFormData({ firstName: e.target.value })}
                placeholder="John"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateFormData({ lastName: e.target.value })}
                placeholder="Smith"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData({ email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateFormData({ phone: e.target.value })}
                placeholder="07700 900000"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => updateFormData({ gender: value })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-binary</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasMedicalConditions"
                checked={formData.hasMedicalConditions}
                onCheckedChange={(checked) =>
                  updateFormData({ hasMedicalConditions: checked === true })
                }
              />
              <Label htmlFor="hasMedicalConditions" className="leading-relaxed">
                I have medical conditions that may affect my training
              </Label>
            </div>
            {formData.hasMedicalConditions && (
              <Textarea
                placeholder="Please describe your medical conditions..."
                value={formData.medicalConditions}
                onChange={(e) => updateFormData({ medicalConditions: e.target.value })}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                id="hasInjuries"
                checked={formData.hasInjuries}
                onCheckedChange={(checked) =>
                  updateFormData({ hasInjuries: checked === true })
                }
              />
              <Label htmlFor="hasInjuries" className="leading-relaxed">
                I have current injuries that may affect my training
              </Label>
            </div>
            {formData.hasInjuries && (
              <Textarea
                placeholder="Please describe your injuries..."
                value={formData.injuries}
                onChange={(e) => updateFormData({ injuries: e.target.value })}
                className="mt-2"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Emergency Contact *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Contact Name *</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyContactName}
                onChange={(e) => updateFormData({ emergencyContactName: e.target.value })}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Contact Phone *</Label>
              <Input
                id="emergencyPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData({ emergencyContactPhone: e.target.value })}
                placeholder="07700 900001"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyRelation">Relationship</Label>
            <Input
              id="emergencyRelation"
              value={formData.emergencyContactRelation}
              onChange={(e) => updateFormData({ emergencyContactRelation: e.target.value })}
              placeholder="e.g., Spouse, Parent, Friend"
            />
          </div>
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
