import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Scale, Percent, Ruler, Calendar, Trash2, ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientProgress, ProgressMeasurements, useDeleteProgress } from '@/hooks/useClientProgress';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProgressEntryCardProps {
  entry: ClientProgress;
}

export const ProgressEntryCard = ({ entry }: ProgressEntryCardProps) => {
  const { t } = useTranslation("client");
  const { t: tCommon } = useTranslation("common");
  const deleteProgress = useDeleteProgress();
  const measurements = entry.measurements as ProgressMeasurements | null;
  const photoUrls = entry.photo_urls as string[] | null;

  const handleDelete = async () => {
    try {
      await deleteProgress.mutateAsync(entry.id);
      toast.success(t("progress.entryDeleted"));
    } catch (error) {
      toast.error(t("progress.failedToDelete"));
    }
  };

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {format(parseISO(entry.recorded_at), 'MMMM d, yyyy')}
            </span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("progress.deleteEntry.title")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("progress.deleteEntry.description")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{tCommon("actions.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  {tCommon("actions.delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Main Stats */}
        <div className="flex flex-wrap gap-4 mb-3">
          {entry.weight_kg && (
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-primary">{Number(entry.weight_kg).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{t("progress.units.kg")}</span>
            </div>
          )}
          {entry.body_fat_percentage && (
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">{Number(entry.body_fat_percentage).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">{t("progress.bodyFat").toLowerCase()}</span>
            </div>
          )}
        </div>

        {/* Measurements */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("progress.measurementsCm")}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {measurements.chest && <Badge variant="outline">{t("progress.fields.chest")}: {measurements.chest}</Badge>}
              {measurements.waist && <Badge variant="outline">{t("progress.fields.waist")}: {measurements.waist}</Badge>}
              {measurements.hips && <Badge variant="outline">{t("progress.fields.hips")}: {measurements.hips}</Badge>}
              {measurements.shoulders && <Badge variant="outline">{t("progress.fields.shoulders")}: {measurements.shoulders}</Badge>}
              {measurements.biceps && <Badge variant="outline">{t("progress.fields.biceps")}: {measurements.biceps}</Badge>}
              {measurements.thighs && <Badge variant="outline">{t("progress.fields.thighs")}: {measurements.thighs}</Badge>}
              {measurements.calves && <Badge variant="outline">{t("progress.fields.calves")}: {measurements.calves}</Badge>}
              {measurements.neck && <Badge variant="outline">{t("progress.fields.neck")}: {measurements.neck}</Badge>}
            </div>
          </div>
        )}

        {/* Photos */}
        {photoUrls && photoUrls.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t("progress.progressPhotos")}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {photoUrls.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors"
                >
                  <img src={url} alt={`${t("progress.title")} ${index + 1}`} className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {entry.notes && (
          <div className="text-sm text-muted-foreground italic">
            "{entry.notes}"
          </div>
        )}
      </CardContent>
    </Card>
  );
};
