import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, MapPin, Video, User, CheckCircle, XCircle, AlertCircle, CalendarDays, Link2, ExternalLink, Star, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { RescheduleSessionModal } from "./RescheduleSessionModal";
import { CancelSessionModal } from "./CancelSessionModal";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Session {
  id: string;
  clientName: string;
  sessionType: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  isOnline: boolean;
  location?: string;
  notes?: string;
  videoMeetingUrl?: string;
  rescheduledFrom?: string;
  hasReview?: boolean;
}

interface SessionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: Session | null;
  onRefresh?: () => void;
}

export function SessionDetailModal({ open, onOpenChange, session, onRefresh }: SessionDetailModalProps) {
  const { t } = useTranslation("coach");
  const [notes, setNotes] = useState(session?.notes || "");
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [sendingReviewRequest, setSendingReviewRequest] = useState(false);
  const [reviewExists, setReviewExists] = useState(session?.hasReview ?? false);
  
  const {
    cancelSession,
    rescheduleSession,
    completeSession,
    markNoShow,
    saveNotes,
    createVideoMeeting,
    DEFAULT_CANCELLATION_NOTICE_HOURS,
  } = useSessionManagement();

  useEffect(() => {
    if (session?.notes) {
      setNotes(session.notes);
    }
    setReviewExists(session?.hasReview ?? false);
  }, [session?.notes, session?.hasReview]);

  // Check if review exists for this session
  useEffect(() => {
    const checkReview = async () => {
      if (!session || session.status !== "completed") return;
      
      const { data } = await supabase
        .from("reviews")
        .select("id")
        .eq("session_id", session.id)
        .maybeSingle();
      
      setReviewExists(!!data);
    };
    
    if (open && session) {
      checkReview();
    }
  }, [open, session]);

  if (!session) return null;

  const statusConfig = {
    scheduled: { label: t('sessionDetailModal.status.scheduled'), icon: Calendar, color: "bg-blue-500/20 text-blue-400" },
    completed: { label: t('sessionDetailModal.status.completed'), icon: CheckCircle, color: "bg-green-500/20 text-green-400" },
    cancelled: { label: t('sessionDetailModal.status.cancelled'), icon: XCircle, color: "bg-red-500/20 text-red-400" },
    no_show: { label: t('sessionDetailModal.status.noShow'), icon: AlertCircle, color: "bg-orange-500/20 text-orange-400" },
  };

  const status = statusConfig[session.status];
  const StatusIcon = status.icon;

  const handleMarkComplete = async () => {
    await completeSession.mutateAsync({ sessionId: session.id, notes });
    onRefresh?.();
    onOpenChange(false);
  };

  const handleSaveNotes = async () => {
    await saveNotes.mutateAsync({ sessionId: session.id, notes });
  };

  const handleReschedule = async (newDateTime: string) => {
    await rescheduleSession.mutateAsync({ sessionId: session.id, newDateTime });
    onRefresh?.();
    onOpenChange(false);
  };

  const handleCancel = async (reason: string, forceCancel: boolean) => {
    await cancelSession.mutateAsync({ sessionId: session.id, reason, forceCancel });
    onRefresh?.();
    onOpenChange(false);
  };

  const handleMarkNoShow = async () => {
    await markNoShow.mutateAsync(session.id);
    onRefresh?.();
    onOpenChange(false);
  };

  const handleCreateMeeting = async () => {
    await createVideoMeeting.mutateAsync({ sessionId: session.id });
    onRefresh?.();
  };

  const handleRequestReview = async () => {
    setSendingReviewRequest(true);
    try {
      const { error } = await supabase.functions.invoke("send-review-request", {
        body: { sessionId: session.id },
      });
      
      if (error) throw error;
      
      toast.success(t('sessionDetailModal.reviewRequestSent'));
    } catch (err) {
      toast.error(t('sessionDetailModal.reviewRequestFailed'));
    } finally {
      setSendingReviewRequest(false);
    }
  };

  const isLoading = 
    cancelSession.isPending || 
    rescheduleSession.isPending || 
    completeSession.isPending || 
    markNoShow.isPending ||
    saveNotes.isPending ||
    createVideoMeeting.isPending ||
    sendingReviewRequest;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-foreground">
              <span>{t('sessionDetailModal.title')}</span>
              <Badge className={status.color}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{session.clientName}</p>
                <p className="text-sm text-muted-foreground">{session.sessionType}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(session.scheduledAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">
                  {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {" "}({session.duration} min)
                </span>
              </div>
            </div>

            {session.rescheduledFrom && (
              <div className="text-xs text-muted-foreground bg-amber-500/10 px-3 py-2 rounded-md">
                {t('sessionDetailModal.rescheduledFrom')}: {new Date(session.rescheduledFrom).toLocaleString()}
              </div>
            )}

            <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-background border border-border">
              {session.isOnline ? (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-primary" />
                    <span className="text-foreground">{t('sessionDetailModal.onlineSession')}</span>
                  </div>
                  {session.videoMeetingUrl ? (
                    <a href={session.videoMeetingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <ExternalLink className="h-3 w-3" />
                      {t('sessionDetailModal.joinMeeting')}
                    </a>
                  ) : session.status === "scheduled" && (
                    <Button size="sm" variant="outline" onClick={handleCreateMeeting} disabled={createVideoMeeting.isPending} className="h-7 text-xs">
                      <Link2 className="h-3 w-3 mr-1" />
                      {t('sessionDetailModal.createLink')}
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-foreground">{session.location || t('sessionDetailModal.locationTbd')}</span>
                </>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionNotes">{t('sessionDetailModal.sessionNotes')}</Label>
              <Textarea id="sessionNotes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('sessionDetailModal.sessionNotesPlaceholder')} className="bg-background border-border resize-none" rows={4} />
              <Button variant="outline" size="sm" onClick={handleSaveNotes} disabled={isLoading}>
                {t('sessionDetailModal.saveNotes')}
              </Button>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {session.status === "scheduled" && (
              <>
                <Button variant="outline" onClick={() => setShowReschedule(true)} disabled={isLoading} className="w-full sm:w-auto">
                  <CalendarDays className="h-4 w-4 mr-1" />
                  {t('sessionDetailModal.reschedule')}
                </Button>
                <Button variant="destructive" onClick={() => setShowCancel(true)} disabled={isLoading} className="w-full sm:w-auto">
                  {t('sessionDetailModal.cancelSession')}
                </Button>
                <Button variant="secondary" onClick={handleMarkNoShow} disabled={isLoading} className="w-full sm:w-auto">
                  {t('sessionDetailModal.noShow')}
                </Button>
                <Button onClick={handleMarkComplete} disabled={isLoading} className="w-full sm:w-auto">
                  {t('sessionDetailModal.markComplete')}
                </Button>
              </>
            )}
            {session.status === "completed" && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button 
                  variant="outline" 
                  onClick={handleRequestReview} 
                  disabled={isLoading || reviewExists}
                  className="w-full sm:w-auto gap-2"
                >
                  {sendingReviewRequest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                  {reviewExists 
                    ? t('sessionDetailModal.reviewReceived') 
                    : t('sessionDetailModal.requestReview')}
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                  {t('sessionDetailModal.close')}
                </Button>
              </div>
            )}
            {session.status !== "scheduled" && session.status !== "completed" && (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                {t('sessionDetailModal.close')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RescheduleSessionModal
        open={showReschedule}
        onOpenChange={setShowReschedule}
        currentDate={new Date(session.scheduledAt)}
        onReschedule={handleReschedule}
        isLoading={rescheduleSession.isPending}
      />

      <CancelSessionModal
        open={showCancel}
        onOpenChange={setShowCancel}
        sessionDate={new Date(session.scheduledAt)}
        onCancel={handleCancel}
        isLoading={cancelSession.isPending}
        cancellationNoticeHours={DEFAULT_CANCELLATION_NOTICE_HOURS}
      />
    </>
  );
}
