import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useCelebration } from '@/contexts/CelebrationContext';
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
  const { t } = useTranslation("client");
  const { t: tCommon } = useTranslation("common");
  const { user } = useAuth();
  const { showFirstTimeAchievement } = useCelebration();
  
  const createProgress = useCreateProgress({
    onFirstPhoto: () => showFirstTimeAchievement('first_photo'),
  });
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

      toast.success(t("progress.successMessage"));
      reset();
      setPhotos([]);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(t("progress.failedToLog"));
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
          <DialogTitle className="text-foreground">{t("progress.logProgress")}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 bg-secondary">
              <TabsTrigger value="weight" className="gap-2">
                <Scale className="h-4 w-4" />
                {t("progress.weight")}
              </TabsTrigger>
              <TabsTrigger value="measurements" className="gap-2">
                <Ruler className="h-4 w-4" />
                {t("progress.body")}
              </TabsTrigger>
              <TabsTrigger value="photos" className="gap-2">
                <Camera className="h-4 w-4" />
                {t("progress.photosCount")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weight" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-primary">{t("progress.weightKg")}</Label>
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
                  <Label htmlFor="bodyFat" className="text-yellow-400">{t("progress.bodyFatPercent")}</Label>
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
              <p className="text-sm text-muted-foreground mb-4">{t("progress.measurementsInCm")}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chest">{t("progress.fields.chest")}</Label>
                  <Input
                    id="chest"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('chest', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">{t("progress.fields.waist")}</Label>
                  <Input
                    id="waist"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('waist', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">{t("progress.fields.hips")}</Label>
                  <Input
                    id="hips"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('hips', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shoulders">{t("progress.fields.shoulders")}</Label>
                  <Input
                    id="shoulders"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('shoulders', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="biceps">{t("progress.fields.biceps")}</Label>
                  <Input
                    id="biceps"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('biceps', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">{t("progress.fields.thighs")}</Label>
                  <Input
                    id="thighs"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('thighs', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calves">{t("progress.fields.calves")}</Label>
                  <Input
                    id="calves"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
                    {...register('calves', { valueAsNumber: true })}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neck">{t("progress.fields.neck")}</Label>
                  <Input
                    id="neck"
                    type="number"
                    step="0.1"
                    placeholder={t("progress.units.cm")}
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
            <Label htmlFor="notes">{t("progress.notesOptional")}</Label>
            <Textarea
              id="notes"
              placeholder={t("progress.notesPlaceholder")}
              {...register('notes')}
              className="bg-background border-border min-h-[80px]"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              {tCommon("actions.cancel")}
            </Button>
            <Button type="submit" disabled={createProgress.isPending}>
              {createProgress.isPending ? t("progress.saving") : t("progress.logProgress")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
