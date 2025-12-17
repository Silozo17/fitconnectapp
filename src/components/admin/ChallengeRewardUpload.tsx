import { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Gift, Trophy, Image as ImageIcon, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const RARITY_OPTIONS = [
  { value: 'common', label: 'Common', color: 'text-gray-400' },
  { value: 'uncommon', label: 'Uncommon', color: 'text-green-500' },
  { value: 'rare', label: 'Rare', color: 'text-blue-500' },
  { value: 'epic', label: 'Epic', color: 'text-purple-500' },
  { value: 'legendary', label: 'Legendary', color: 'text-primary' },
] as const;

export interface RewardData {
  hasReward: boolean;
  rewardType: 'badge' | 'avatar';
  rewardName: string;
  rewardDescription: string;
  rewardRarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  rewardImage: File | null;
  rewardImagePreview: string | null;
}

interface ChallengeRewardUploadProps {
  value: RewardData;
  onChange: (data: RewardData) => void;
  existingRewardImageUrl?: string | null;
}

export function ChallengeRewardUpload({ value, onChange, existingRewardImageUrl }: ChallengeRewardUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({
        ...value,
        rewardImage: file,
        rewardImagePreview: previewUrl,
      });
    }
  };

  const clearImage = () => {
    onChange({
      ...value,
      rewardImage: null,
      rewardImagePreview: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectedRarity = RARITY_OPTIONS.find(r => r.value === value.rewardRarity);
  const displayImageUrl = value.rewardImagePreview || existingRewardImageUrl;

  return (
    <Card className="p-4 border-dashed border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-primary" />
          <Label className="text-base font-medium">Exclusive Reward</Label>
        </div>
        <Switch
          checked={value.hasReward}
          onCheckedChange={(checked) => onChange({ ...value, hasReward: checked })}
        />
      </div>

      {value.hasReward && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>This reward can ONLY be earned by completing this challenge</span>
          </div>

          {/* Reward Type */}
          <div>
            <Label className="text-sm mb-2 block">Reward Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={value.rewardType === 'badge' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...value, rewardType: 'badge' })}
                className="flex-1"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Badge
              </Button>
              <Button
                type="button"
                variant={value.rewardType === 'avatar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChange({ ...value, rewardType: 'avatar' })}
                className="flex-1"
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Avatar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Image Upload */}
            <div className="col-span-2 sm:col-span-1">
              <Label className="text-sm mb-2 block">
                {value.rewardType === 'avatar' ? 'Avatar Image' : 'Badge Image'}
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
              
              {displayImageUrl ? (
                <div className="relative">
                  <div className={cn(
                    "w-full aspect-square rounded-lg border-2 overflow-hidden",
                    selectedRarity?.value === 'legendary' && 'border-primary',
                    selectedRarity?.value === 'epic' && 'border-purple-500',
                    selectedRarity?.value === 'rare' && 'border-blue-500',
                    selectedRarity?.value === 'uncommon' && 'border-green-500',
                    selectedRarity?.value === 'common' && 'border-gray-500'
                  )}>
                    <img
                      src={displayImageUrl}
                      alt="Reward preview"
                      className="w-full h-full object-contain bg-muted/50"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={clearImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary"
                >
                  <Upload className="h-8 w-8" />
                  <span className="text-xs">Click to upload</span>
                </button>
              )}
            </div>

            {/* Name & Rarity */}
            <div className="col-span-2 sm:col-span-1 space-y-4">
              <div>
                <Label htmlFor="reward-name" className="text-sm">Name</Label>
                <Input
                  id="reward-name"
                  value={value.rewardName}
                  onChange={(e) => onChange({ ...value, rewardName: e.target.value })}
                  placeholder={value.rewardType === 'avatar' ? 'Champion Warrior' : 'Challenge Master'}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Rarity</Label>
                <Select
                  value={value.rewardRarity}
                  onValueChange={(v: any) => onChange({ ...value, rewardRarity: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RARITY_OPTIONS.map(rarity => (
                      <SelectItem key={rarity.value} value={rarity.value}>
                        <span className={rarity.color}>{rarity.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRarity && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "w-fit",
                    selectedRarity.color,
                    selectedRarity.value === 'legendary' && 'border-primary bg-primary/10',
                    selectedRarity.value === 'epic' && 'border-purple-500 bg-purple-500/10',
                    selectedRarity.value === 'rare' && 'border-blue-500 bg-blue-500/10',
                    selectedRarity.value === 'uncommon' && 'border-green-500 bg-green-500/10'
                  )}
                >
                  {selectedRarity.label} {value.rewardType === 'avatar' ? 'Avatar' : 'Badge'}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="reward-description" className="text-sm">Description (optional)</Label>
            <Textarea
              id="reward-description"
              value={value.rewardDescription}
              onChange={(e) => onChange({ ...value, rewardDescription: e.target.value })}
              placeholder="Awarded to those who complete this challenge"
              rows={2}
              className="mt-1"
            />
          </div>
        </div>
      )}
    </Card>
  );
}

export const defaultRewardData: RewardData = {
  hasReward: false,
  rewardType: 'avatar',
  rewardName: '',
  rewardDescription: '',
  rewardRarity: 'rare',
  rewardImage: null,
  rewardImagePreview: null,
};
