import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Loader2, Users, MapPin, Clock, Edit, Trash2, Eye, Video, Globe, Monitor } from "lucide-react";
import {
  useMyGroupClasses,
  useCreateGroupClass,
  useUpdateGroupClass,
  useDeleteGroupClass,
  useGroupClassWaitlist,
  GroupClass,
  EventType,
  EventFormat,
} from "@/hooks/useCoachGroupClasses";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";
import { VenueAutocomplete } from "@/components/shared/VenueAutocomplete";
import { SmartDateInput } from "@/components/ui/smart-date-input";
import { SmartTimeInput } from "@/components/ui/smart-time-input";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "class", label: "Class" },
  { value: "workshop", label: "Workshop" },
  { value: "live_event", label: "Live Event" },
  { value: "online_event", label: "Online Event" },
  { value: "seminar", label: "Seminar" },
  { value: "bootcamp", label: "Bootcamp" },
];

const EVENT_FORMATS: { value: EventFormat; label: string; icon: React.ReactNode }[] = [
  { value: "in_person", label: "In-Person", icon: <MapPin className="h-3 w-3" /> },
  { value: "online", label: "Online", icon: <Monitor className="h-3 w-3" /> },
  { value: "hybrid", label: "Hybrid", icon: <Globe className="h-3 w-3" /> },
];

interface GroupClassFormData {
  title: string;
  description: string;
  schedule_info: string;
  target_audience: string;
  location: string;
  price: string;
  currency: string;
  is_waitlist_open: boolean;
  max_participants: string;
  is_active: boolean;
  event_type: EventType;
  event_format: EventFormat;
  online_link: string;
  start_date: string;
  end_date: string;
  is_recurring: boolean;
}

const defaultFormData: GroupClassFormData = {
  title: "",
  description: "",
  schedule_info: "",
  target_audience: "",
  location: "",
  price: "",
  currency: "GBP",
  is_waitlist_open: true,
  max_participants: "",
  is_active: true,
  event_type: "class",
  event_format: "in_person",
  online_link: "",
  start_date: "",
  end_date: "",
  is_recurring: true,
};

function GroupClassForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
  t,
}: {
  initialData?: GroupClass;
  onSubmit: (data: GroupClassFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  t: (key: string) => string;
}) {
  const [formData, setFormData] = useState<GroupClassFormData>(
    initialData
      ? {
          title: initialData.title,
          description: initialData.description || "",
          schedule_info: initialData.schedule_info || "",
          target_audience: initialData.target_audience || "",
          location: initialData.location || "",
          price: initialData.price?.toString() || "",
          currency: initialData.currency || "GBP",
          is_waitlist_open: initialData.is_waitlist_open,
          max_participants: initialData.max_participants?.toString() || "",
          is_active: initialData.is_active,
          event_type: initialData.event_type || "class",
          event_format: initialData.event_format || "in_person",
          online_link: initialData.online_link || "",
          start_date: initialData.start_date ? initialData.start_date.split("T")[0] : "",
          end_date: initialData.end_date ? initialData.end_date.split("T")[0] : "",
          is_recurring: initialData.is_recurring ?? true,
        }
      : defaultFormData
  );

  const showOnlineLink = formData.event_format === "online" || formData.event_format === "hybrid";
  const showLocation = formData.event_format === "in_person" || formData.event_format === "hybrid";

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Event Type & Format */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t("groupClasses.form.eventType") || "Event Type"}</Label>
          <Select value={formData.event_type} onValueChange={(v) => setFormData({ ...formData, event_type: v as EventType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((et) => (
                <SelectItem key={et.value} value={et.value}>{et.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{t("groupClasses.form.eventFormat") || "Format"}</Label>
          <Select value={formData.event_format} onValueChange={(v) => setFormData({ ...formData, event_format: v as EventFormat })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EVENT_FORMATS.map((ef) => (
                <SelectItem key={ef.value} value={ef.value}>
                  <span className="flex items-center gap-2">{ef.icon} {ef.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">{t("groupClasses.form.classTitle")} *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder={t("groupClasses.form.classTitlePlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t("groupClasses.form.description")}</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder={t("groupClasses.form.descriptionPlaceholder")}
          rows={3}
        />
      </div>

      {/* Recurring toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{t("groupClasses.form.recurring") || "Recurring"}</Label>
          <p className="text-xs text-muted-foreground">{t("groupClasses.form.recurringDesc") || "This is a regularly scheduled class"}</p>
        </div>
        <Switch
          checked={formData.is_recurring}
          onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
        />
      </div>

      {/* Schedule / Date fields */}
      {formData.is_recurring ? (
        <div className="space-y-2">
          <Label htmlFor="schedule">{t("groupClasses.form.schedule")}</Label>
          <Input
            id="schedule"
            value={formData.schedule_info}
            onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
            placeholder={t("groupClasses.form.schedulePlaceholder")}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t("groupClasses.form.startDate") || "Start Date"}</Label>
            <SmartDateInput
              value={formData.start_date}
              onChange={(v) => setFormData({ ...formData, start_date: v })}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("groupClasses.form.endDate") || "End Date"}</Label>
            <SmartDateInput
              value={formData.end_date}
              onChange={(v) => setFormData({ ...formData, end_date: v })}
              min={formData.start_date || new Date().toISOString().split("T")[0]}
            />
          </div>
        </div>
      )}

      {/* Location / Online link */}
      {showLocation && (
        <div className="space-y-2">
          <Label htmlFor="location">{t("groupClasses.form.location")}</Label>
          <VenueAutocomplete
            value={formData.location}
            onVenueChange={(loc) => setFormData({ ...formData, location: loc })}
            placeholder={t("groupClasses.form.locationPlaceholder")}
          />
        </div>
      )}

      {showOnlineLink && (
        <div className="space-y-2">
          <Label htmlFor="onlineLink">{t("groupClasses.form.onlineLink") || "Online Link"}</Label>
          <Input
            id="onlineLink"
            value={formData.online_link}
            onChange={(e) => setFormData({ ...formData, online_link: e.target.value })}
            placeholder="https://zoom.us/j/... or Google Meet link"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="target">{t("groupClasses.form.whoIsThisFor")}</Label>
        <Input
          id="target"
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          placeholder={t("groupClasses.form.whoIsThisForPlaceholder")}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">{t("groupClasses.form.price")}</Label>
          <div className="flex gap-2">
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="GBP">GBP</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="max">{t("groupClasses.form.maxParticipants")}</Label>
          <Input
            id="max"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
            placeholder={t("groupClasses.form.maxParticipantsPlaceholder")}
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{t("groupClasses.form.waitlistOpen")}</Label>
          <p className="text-xs text-muted-foreground">{t("groupClasses.form.waitlistOpenDesc")}</p>
        </div>
        <Switch
          checked={formData.is_waitlist_open}
          onCheckedChange={(checked) => setFormData({ ...formData, is_waitlist_open: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>{t("groupClasses.form.active")}</Label>
          <p className="text-xs text-muted-foreground">{t("groupClasses.form.activeDesc")}</p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          {t("forms.cancel")}
        </Button>
        <Button onClick={() => onSubmit(formData)} disabled={isSubmitting || !formData.title}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? t("groupClasses.form.saveChanges") : t("groupClasses.form.createClassButton")}
        </Button>
      </div>
    </div>
  );
}

function WaitlistViewer({ classId, className, t }: { classId: string; className: string; t: ReturnType<typeof useTranslation>['t'] }) {
  const { data: waitlist = [], isLoading } = useGroupClassWaitlist(classId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          {t("groupClasses.waitlist")} ({waitlist.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("groupClasses.waitlistFor", { name: className })}</DialogTitle>
          <DialogDescription>
            {t("groupClasses.peopleOnWaitlist", { count: waitlist.length })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t("groupClasses.noOneOnWaitlist")}
            </p>
          ) : (
            waitlist.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">#{index + 1}</span>
                  <span className="text-sm font-medium">
                    {entry.client_profiles?.first_name || entry.client_profiles?.username || "Unknown"}
                  </span>
                </div>
                <Badge variant={entry.status === "enrolled" ? "default" : "secondary"}>
                  {entry.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

const eventTypeBadgeColor: Record<EventType, string> = {
  class: "bg-primary/10 text-primary",
  workshop: "bg-amber-500/10 text-amber-600",
  live_event: "bg-red-500/10 text-red-600",
  online_event: "bg-blue-500/10 text-blue-600",
  seminar: "bg-purple-500/10 text-purple-600",
  bootcamp: "bg-green-500/10 text-green-600",
};

const eventTypeLabels: Record<EventType, string> = {
  class: "Class",
  workshop: "Workshop",
  live_event: "Live Event",
  online_event: "Online Event",
  seminar: "Seminar",
  bootcamp: "Bootcamp",
};

const formatLabels: Record<EventFormat, string> = {
  in_person: "In-Person",
  online: "Online",
  hybrid: "Hybrid",
};

export function CoachGroupClassesManager() {
  const { t } = useTranslation("settings");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<GroupClass | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: classes = [], isLoading } = useMyGroupClasses();
  const createClass = useCreateGroupClass();
  const updateClass = useUpdateGroupClass();
  const deleteClass = useDeleteGroupClass();

  const handleCreate = (formData: GroupClassFormData) => {
    createClass.mutate(
      {
        title: formData.title,
        description: formData.description || null,
        schedule_info: formData.schedule_info || null,
        target_audience: formData.target_audience || null,
        location: formData.location || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        is_waitlist_open: formData.is_waitlist_open,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_active: formData.is_active,
        event_type: formData.event_type,
        event_format: formData.event_format,
        online_link: formData.online_link || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_recurring: formData.is_recurring,
        community_id: null,
      },
      {
        onSuccess: () => setIsCreateOpen(false),
      }
    );
  };

  const handleUpdate = (formData: GroupClassFormData) => {
    if (!editingClass) return;

    updateClass.mutate(
      {
        id: editingClass.id,
        title: formData.title,
        description: formData.description || null,
        schedule_info: formData.schedule_info || null,
        target_audience: formData.target_audience || null,
        location: formData.location || null,
        price: formData.price ? parseFloat(formData.price) : null,
        currency: formData.currency,
        is_waitlist_open: formData.is_waitlist_open,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        is_active: formData.is_active,
        event_type: formData.event_type,
        event_format: formData.event_format,
        online_link: formData.online_link || null,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        is_recurring: formData.is_recurring,
      },
      {
        onSuccess: () => setEditingClass(null),
      }
    );
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteClass.mutate(deletingId, {
      onSuccess: () => setDeletingId(null),
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{t("groupClasses.title")}</CardTitle>
            <CardDescription>
              {t("groupClasses.description")}
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {t("groupClasses.addClass")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{t("groupClasses.createClass")}</DialogTitle>
                <DialogDescription>
                  {t("groupClasses.createClassDesc")}
                </DialogDescription>
              </DialogHeader>
              <GroupClassForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreateOpen(false)}
                isSubmitting={createClass.isPending}
                t={t}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">{t("groupClasses.noClassesYet")}</p>
            <p className="text-xs mt-1">{t("groupClasses.createFirstClass")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((groupClass) => (
              <div
                key={groupClass.id}
                className="border border-border rounded-lg p-4 space-y-3"
              >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  {/* Title and description */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{groupClass.title}</h4>
                      {!groupClass.is_active && (
                        <Badge variant="secondary">{t("groupClasses.inactive")}</Badge>
                      )}
                      <Badge className={eventTypeBadgeColor[groupClass.event_type] || "bg-muted text-muted-foreground"} variant="outline">
                        {eventTypeLabels[groupClass.event_type] || groupClass.event_type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {groupClass.event_format === "online" && <Monitor className="h-3 w-3 mr-1" />}
                        {groupClass.event_format === "in_person" && <MapPin className="h-3 w-3 mr-1" />}
                        {groupClass.event_format === "hybrid" && <Globe className="h-3 w-3 mr-1" />}
                        {formatLabels[groupClass.event_format] || groupClass.event_format}
                      </Badge>
                    </div>
                    {groupClass.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {groupClass.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    <WaitlistViewer classId={groupClass.id} className={groupClass.title} t={t} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingClass(groupClass)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingId(groupClass.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {groupClass.is_recurring && groupClass.schedule_info && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {groupClass.schedule_info}
                    </span>
                  )}
                  {!groupClass.is_recurring && groupClass.start_date && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {new Date(groupClass.start_date).toLocaleDateString()}
                      {groupClass.end_date && ` - ${new Date(groupClass.end_date).toLocaleDateString()}`}
                    </span>
                  )}
                  {groupClass.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {groupClass.location}
                    </span>
                  )}
                  {groupClass.online_link && (
                    <span className="flex items-center gap-1">
                      <Video className="h-4 w-4" />
                      Online
                    </span>
                  )}
                  {groupClass.price && (
                    <span className="font-medium text-foreground">
                      {formatCurrency(groupClass.price, (groupClass.currency as CurrencyCode) || 'GBP')}
                    </span>
                  )}
                </div>

                {groupClass.target_audience && (
                  <p className="text-xs text-muted-foreground">
                    <strong>{t("groupClasses.for")}</strong> {groupClass.target_audience}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("groupClasses.editClass")}</DialogTitle>
            <DialogDescription>
              {t("groupClasses.editClassDesc")}
            </DialogDescription>
          </DialogHeader>
          {editingClass && (
            <GroupClassForm
              initialData={editingClass}
              onSubmit={handleUpdate}
              onCancel={() => setEditingClass(null)}
              isSubmitting={updateClass.isPending}
              t={t}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("groupClasses.deleteClass")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("groupClasses.deleteClassDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("forms.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClass.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {t("forms.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
