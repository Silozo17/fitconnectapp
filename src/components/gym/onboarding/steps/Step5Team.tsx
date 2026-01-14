import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Plus, Trash2, Users, Clock } from 'lucide-react';
import type { GymOnboardingData, StaffInvite } from '@/hooks/gym/useGymOnboarding';

interface Step5Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
}

const STAFF_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'manager', label: 'Manager' },
  { value: 'coach', label: 'Coach / Trainer' },
  { value: 'front_desk', label: 'Front Desk / Staff' },
  { value: 'marketing', label: 'Marketing' },
];

const emptyInvite: StaffInvite = {
  name: '',
  email: '',
  role: 'coach',
  locationIds: [],
};

export function Step5Team({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
}: Step5Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateInvite = (index: number, updates: Partial<StaffInvite>) => {
    const newInvites = [...data.staffInvites];
    newInvites[index] = { ...newInvites[index], ...updates };
    updateData({ staffInvites: newInvites });
  };

  const addInvite = () => {
    updateData({ 
      staffInvites: [...data.staffInvites, { ...emptyInvite }],
    });
  };

  const removeInvite = (index: number) => {
    const newInvites = data.staffInvites.filter((_, i) => i !== index);
    updateData({ staffInvites: newInvites });
  };

  const handleAddStaffNowChange = (value: string) => {
    const addNow = value === 'yes';
    updateData({ 
      addStaffNow: addNow,
      staffInvites: addNow && data.staffInvites.length === 0 
        ? [{ ...emptyInvite }] 
        : data.staffInvites,
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (data.addStaffNow) {
      data.staffInvites.forEach((invite, index) => {
        if (!invite.name.trim()) {
          newErrors[`invite_${index}_name`] = 'Name is required';
        }
        if (!invite.email.trim()) {
          newErrors[`invite_${index}_email`] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email)) {
          newErrors[`invite_${index}_email`] = 'Invalid email';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Team & roles"
      subtitle="Invite your team members"
      showBackButton
      onBack={onBack}
      onSkip={() => {
        updateData({ addStaffNow: false, staffInvites: [] });
        onNext();
      }}
      skipLabel="Skip for now"
      footerActions={{
        primary: {
          label: 'Continue',
          onClick: handleSubmit,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-6">
        {/* Add Staff Now Selection */}
        <div className="space-y-3">
          <Label>Would you like to add team members now?</Label>
          <RadioGroup
            value={data.addStaffNow ? 'yes' : 'no'}
            onValueChange={handleAddStaffNowChange}
            className="grid grid-cols-2 gap-3"
          >
            <label className={`
              flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${data.addStaffNow ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}>
              <RadioGroupItem value="yes" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-medium">Yes, add now</span>
              </div>
            </label>
            <label className={`
              flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-colors
              ${!data.addStaffNow ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
            `}>
              <RadioGroupItem value="no" />
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Later</span>
              </div>
            </label>
          </RadioGroup>
        </div>

        {/* Staff Invites */}
        {data.addStaffNow && (
          <div className="space-y-4">
            {data.staffInvites.map((invite, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Team member {index + 1}
                    </CardTitle>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInvite(index)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Jane Smith"
                        value={invite.name}
                        onChange={(e) => updateInvite(index, { name: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    {errors[`invite_${index}_name`] && (
                      <p className="text-sm text-destructive">{errors[`invite_${index}_name`]}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="jane@yourgym.com"
                        value={invite.email}
                        onChange={(e) => updateInvite(index, { email: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                    {errors[`invite_${index}_email`] && (
                      <p className="text-sm text-destructive">{errors[`invite_${index}_email`]}</p>
                    )}
                  </div>

                  {/* Role */}
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select
                      value={invite.role}
                      onValueChange={(v) => updateInvite(index, { role: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assigned Locations (if multiple locations) */}
                  {data.locations.length > 1 && (
                    <div className="space-y-2">
                      <Label>Assigned location(s)</Label>
                      <Select
                        value={invite.locationIds[0] || 'all'}
                        onValueChange={(v) => updateInvite(index, { 
                          locationIds: v === 'all' ? [] : [v] 
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All locations</SelectItem>
                          {data.locations.map((loc, locIndex) => (
                            <SelectItem key={locIndex} value={locIndex.toString()}>
                              {loc.name || `Location ${locIndex + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Add More Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addInvite}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another team member
            </Button>

            <p className="text-sm text-muted-foreground text-center">
              Invitations will be sent after you complete setup
            </p>
          </div>
        )}

        {!data.addStaffNow && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">
              No problem! You can invite team members anytime from your dashboard.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
}
