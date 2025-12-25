import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock, MapPin, Video } from "lucide-react";
import { useScheduleSessionWithPackage } from "@/hooks/useScheduleSessionWithPackage";
import { useClientActivePackage } from "@/hooks/usePackages";
import { useCoachProfile } from "@/hooks/useCoachClients";
import { useTranslation } from "@/hooks/useTranslation";
import { PackageCreditsInfo } from "./PackageCreditsInfo";

interface ScheduleSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName?: string;
  clientId?: string;
}

export function ScheduleSessionModal({ open, onOpenChange, clientName, clientId }: ScheduleSessionModalProps) {
  const { t } = useTranslation("coach");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [sessionType, setSessionType] = useState("");
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [usePackageCredits, setUsePackageCredits] = useState(true);

  const { data: coachProfile } = useCoachProfile();
  const { data: activePackage, isLoading: isLoadingPackage } = useClientActivePackage(clientId, coachProfile?.id);
  const scheduleSessionMutation = useScheduleSessionWithPackage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId) return;

    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    
    scheduleSessionMutation.mutate({
      clientId,
      scheduledAt,
      duration: parseInt(duration),
      sessionType,
      isOnline,
      location: isOnline ? undefined : location,
      notes: notes || undefined,
      usePackageCredits: activePackage ? usePackageCredits : false,
    }, {
      onSuccess: () => {
        resetForm();
        onOpenChange(false);
      },
    });
  };

  const resetForm = () => {
    setDate("");
    setTime("");
    setDuration("60");
    setSessionType("");
    setIsOnline(false);
    setLocation("");
    setNotes("");
    setUsePackageCredits(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            {clientName ? t('scheduleSessionModal.titleWithClient', { clientName }) : t('scheduleSessionModal.title')}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">{t('scheduleSessionModal.date')}</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">{t('scheduleSessionModal.time')}</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionType">{t('scheduleSessionModal.sessionType')}</Label>
              <Select value={sessionType} onValueChange={setSessionType} required>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder={t('scheduleSessionModal.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-on-1">{t('scheduleSessionModal.sessionTypes.oneOnOne')}</SelectItem>
                  <SelectItem value="group">{t('scheduleSessionModal.sessionTypes.group')}</SelectItem>
                  <SelectItem value="assessment">{t('scheduleSessionModal.sessionTypes.assessment')}</SelectItem>
                  <SelectItem value="consultation">{t('scheduleSessionModal.sessionTypes.consultation')}</SelectItem>
                  <SelectItem value="nutrition-review">{t('scheduleSessionModal.sessionTypes.nutritionReview')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">{t('scheduleSessionModal.duration')}</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">{t('scheduleSessionModal.durations.30min')}</SelectItem>
                  <SelectItem value="45">{t('scheduleSessionModal.durations.45min')}</SelectItem>
                  <SelectItem value="60">{t('scheduleSessionModal.durations.60min')}</SelectItem>
                  <SelectItem value="90">{t('scheduleSessionModal.durations.90min')}</SelectItem>
                  <SelectItem value="120">{t('scheduleSessionModal.durations.120min')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-primary" />
              <Label htmlFor="isOnline" className="cursor-pointer">{t('scheduleSessionModal.onlineSession')}</Label>
            </div>
            <Switch
              id="isOnline"
              checked={isOnline}
              onCheckedChange={setIsOnline}
            />
          </div>

          {!isOnline && (
            <div className="space-y-2">
              <Label htmlFor="location">{t('scheduleSessionModal.location')}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={t('scheduleSessionModal.locationPlaceholder')}
                  className="pl-10 bg-background border-border"
                />
              </div>
            </div>
          )}

          {/* Package Credits Info */}
          {!isLoadingPackage && (
            <PackageCreditsInfo
              activePackage={activePackage}
              useCredits={usePackageCredits}
              onUseCreditsChange={setUsePackageCredits}
            />
          )}
          
          <div className="space-y-2">
            <Label htmlFor="notes">{t('scheduleSessionModal.sessionNotes')}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('scheduleSessionModal.sessionNotesPlaceholder')}
              className="bg-background border-border resize-none"
              rows={3}
            />
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('scheduleSessionModal.cancel')}
            </Button>
            <Button type="submit" disabled={scheduleSessionMutation.isPending || !clientId || !sessionType}>
              {scheduleSessionMutation.isPending ? t('scheduleSessionModal.scheduling') : t('scheduleSessionModal.schedule')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
