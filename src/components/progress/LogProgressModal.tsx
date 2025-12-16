import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressPhotoUpload } from './ProgressPhotoUpload';
import { useCreateProgress } from '@/hooks/useClientProgress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Scale, Ruler, Camera } from 'lucide-react';

interface LogProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
}

interface ProgressFormData {
  weight_kg: number | null;
  body_fat_percentage: number | null;
  notes: string;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  biceps: number | null;
  thighs: number | null;
  calves: number | null;
  shoulders: number | null;
  neck: number | null;
}

export const LogProgressModal = ({ open, onOpenChange, clientId }: LogProgressModalProps) => {
  const { user } = useAuth();
  const createProgress = useCreateProgress();
  const [photos, setPhotos] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('weight');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProgressFormData>({
    defaultValues: {
      weight_kg: null,
      body_fat_percentage: null,
      notes: '',
      chest: null,
      waist: null,
      hips: null,
      biceps: null,
      thighs: null,
      calves: null,
      shoulders: null,
      neck: null,
    },
  });

  const onSubmit = async (data: ProgressFormData) => {
    try {
      const measurements: Record<string, number> = {};
      if (data.chest) measurements.chest = data.chest;
      if (data.waist) measurements.waist = data.waist;
      if (data.hips) measurements.hips = data.hips;
      if (data.biceps) measurements.biceps = data.biceps;
      if (data.thighs) measurements.thighs = data.thighs;
      if (data.calves) measurements.calves = data.calves;
      if (data.shoulders) measurements.shoulders = data.shoulders;
      if (data.neck) measurements.neck = data.neck;

      await createProgress.mutateAsync({
        client_id: clientId,
        weight_kg: data.weight_kg,
        body_fat_percentage: data.body_fat_percentage,
        measurements: Object.keys(measurements).length > 0 ? measurements : null,
        notes: data.notes || null,
        photo_urls: photos.length > 0 ? photos : [],
        recorded_at: new Date().toISOString().split('T')[0],
      });

      toast.success('Progress logged successfully!');
      reset();
      setPhotos([]);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to log progress');
    }
  };

  const handleClose = () => {
    reset();
    setPhotos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px] bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Log Progress</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-secondary">
              <TabsTrigger value="weight" className="gap-2">
                <Scale className="h-4 w-4" />
                Weight
              </TabsTrigger>
              <TabsTrigger value="measurements" className="gap-2">
                <Ruler className="h-4 w-4" />
                Body
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2">
                <Camera className="h-4 w-4" />
                Photos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-primary">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 75.5"
                    {...register('weight_kg', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat" className="text-yellow-400">Body Fat %</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    placeholder="e.g., 18.5"
                    {...register('body_fat_percentage', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="measurements" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground mb-4">All measurements in centimeters (cm)</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chest">Chest</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('chest', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Waist</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('waist', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Hips</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('hips', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shoulders">Shoulders</Label>
                  <Input
                    id="shoulders"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('shoulders', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biceps">Biceps</Label>
                  <Input
                    id="biceps"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('biceps', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Thighs</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('thighs', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calves">Calves</Label>
                  <Input
                    id="calves"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('calves', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neck">Neck</Label>
                  <Input
                    id="neck"
                    type="number"
                    step="0.1"
                    placeholder="cm"
                    {...register('neck', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="photos" className="mt-4">
              {user && (
                <ProgressPhotoUpload
                  userId={user.id}
                  photos={photos}
                  onPhotosChange={setPhotos}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Notes - always visible */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="How are you feeling? Any observations..."
              {...register('notes')}
              className="bg-background border-border min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProgress.isPending}>
              {createProgress.isPending ? 'Saving...' : 'Log Progress'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
