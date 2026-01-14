import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Upload, 
  Palette, 
  Image as ImageIcon,
  X,
  Building2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { GymOnboardingData } from '@/hooks/gym/useGymOnboarding';

interface Step8Props {
  data: GymOnboardingData;
  updateData: (updates: Partial<GymOnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
  currentStep: number;
  totalSteps: number;
  gymId: string | null;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange
];

export function Step8Branding({
  data,
  updateData,
  onNext,
  onBack,
  isLoading,
  currentStep,
  totalSteps,
  gymId,
}: Step8Props) {
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Reset input so same file can be re-selected
    e.target.value = '';
    
    if (!file) return;
    
    if (!gymId) {
      console.error('Logo upload failed: gymId is missing', { currentStep, gymId });
      toast.error('Unable to upload. Please refresh and try again.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB');
      return;
    }

    setIsUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${gymId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('gym-assets')
        .getPublicUrl(filePath);

      updateData({ logoUrl: urlData.publicUrl });
      toast.success('Logo uploaded');
    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    // Reset input so same file can be re-selected
    e.target.value = '';
    
    if (!file) return;
    
    if (!gymId) {
      console.error('Cover upload failed: gymId is missing', { currentStep, gymId });
      toast.error('Unable to upload. Please refresh and try again.');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, GIF, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Cover image must be less than 5MB');
      return;
    }

    setIsUploadingCover(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${gymId}/cover.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('gym-assets')
        .getPublicUrl(filePath);

      updateData({ coverImageUrl: urlData.publicUrl });
      toast.success('Cover image uploaded');
    } catch (error: any) {
      console.error('Cover upload error:', error);
      toast.error('Failed to upload cover image');
    } finally {
      setIsUploadingCover(false);
    }
  };

  const removeLogo = () => {
    updateData({ logoUrl: '' });
  };

  const removeCover = () => {
    updateData({ coverImageUrl: '' });
  };

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Branding"
      subtitle="Customize your gym's appearance"
      showBackButton
      onBack={onBack}
      onSkip={() => onNext()}
      skipLabel="Skip for now"
      footerActions={{
        primary: {
          label: 'Continue',
          onClick: onNext,
          loading: isLoading,
          disabled: isLoading,
        },
      }}
    >
      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-3">
          <Label>Logo</Label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20 border-2 border-dashed border-border">
                {data.logoUrl ? (
                  <AvatarImage src={data.logoUrl} alt="Gym logo" />
                ) : (
                  <AvatarFallback className="bg-secondary">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </AvatarFallback>
                )}
              </Avatar>
              {data.logoUrl && (
                <button
                  onClick={removeLogo}
                  className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="flex-1">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {data.logoUrl ? 'Change logo' : 'Upload logo'}
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Square image, max 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Brand Color */}
        <div className="space-y-3">
          <Label>Brand color</Label>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => updateData({ brandColor: color })}
                  className={`
                    w-10 h-10 rounded-lg transition-all
                    ${data.brandColor === color 
                      ? 'ring-2 ring-offset-2 ring-primary scale-110' 
                      : 'hover:scale-105'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Palette className="w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Custom: #3B82F6"
                value={data.brandColor}
                onChange={(e) => updateData({ brandColor: e.target.value })}
                className="max-w-[180px]"
              />
              {data.brandColor && (
                <div 
                  className="w-8 h-8 rounded border border-border"
                  style={{ backgroundColor: data.brandColor }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Cover Image */}
        <div className="space-y-3">
          <Label>Cover image</Label>
          <div className="space-y-3">
            {data.coverImageUrl ? (
              <div className="relative aspect-[3/1] rounded-lg overflow-hidden border border-border">
                <img 
                  src={data.coverImageUrl} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={removeCover}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                className="aspect-[3/1] rounded-lg border-2 border-dashed border-border bg-secondary/50 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => coverInputRef.current?.click()}
              >
                <div className="text-center">
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload cover image
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Recommended: 1200x400px
                  </p>
                </div>
              </div>
            )}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            {isUploadingCover && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </div>
            )}
          </div>
        </div>

        {/* Preview Note */}
        <div className="p-4 bg-secondary/50 rounded-lg border border-border">
          <p className="text-sm text-muted-foreground">
            💡 Your branding will be used across your public gym page, booking forms, and member communications.
          </p>
        </div>
      </div>
    </OnboardingLayout>
  );
}
