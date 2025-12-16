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
  const deleteProgress = useDeleteProgress();
  const measurements = entry.measurements as ProgressMeasurements | null;
  const photoUrls = entry.photo_urls as string[] | null;

  const handleDelete = async () => {
    try {
      await deleteProgress.mutateAsync(entry.id);
      toast.success('Progress entry deleted');
    } catch (error) {
      toast.error('Failed to delete entry');
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
                <AlertDialogTitle>Delete Progress Entry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this progress entry. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
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
              <span className="text-sm text-muted-foreground">kg</span>
            </div>
          )}
          {entry.body_fat_percentage && (
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-yellow-400" />
              <span className="text-lg font-bold text-yellow-400">{Number(entry.body_fat_percentage).toFixed(1)}</span>
              <span className="text-sm text-muted-foreground">body fat</span>
            </div>
          )}
        </div>

        {/* Measurements */}
        {measurements && Object.keys(measurements).length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Measurements (cm)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {measurements.chest && <Badge variant="outline">Chest: {measurements.chest}</Badge>}
              {measurements.waist && <Badge variant="outline">Waist: {measurements.waist}</Badge>}
              {measurements.hips && <Badge variant="outline">Hips: {measurements.hips}</Badge>}
              {measurements.shoulders && <Badge variant="outline">Shoulders: {measurements.shoulders}</Badge>}
              {measurements.biceps && <Badge variant="outline">Biceps: {measurements.biceps}</Badge>}
              {measurements.thighs && <Badge variant="outline">Thighs: {measurements.thighs}</Badge>}
              {measurements.calves && <Badge variant="outline">Calves: {measurements.calves}</Badge>}
              {measurements.neck && <Badge variant="outline">Neck: {measurements.neck}</Badge>}
            </div>
          </div>
        )}

        {/* Photos */}
        {photoUrls && photoUrls.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Progress Photos</span>
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
                  <img src={url} alt={`Progress ${index + 1}`} className="w-full h-full object-cover" />
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
