import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Plus, Loader2, Users, MapPin, Clock, Edit, Trash2, Eye } from "lucide-react";
import {
  useMyGroupClasses,
  useCreateGroupClass,
  useUpdateGroupClass,
  useDeleteGroupClass,
  useGroupClassWaitlist,
  GroupClass,
} from "@/hooks/useCoachGroupClasses";
import { formatCurrency, type CurrencyCode } from "@/lib/currency";

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
        }
      : defaultFormData
  );

  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule">{t("groupClasses.form.schedule")}</Label>
          <Input
            id="schedule"
            value={formData.schedule_info}
            onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
            placeholder={t("groupClasses.form.schedulePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">{t("groupClasses.form.location")}</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={t("groupClasses.form.locationPlaceholder")}
          />
        </div>
      </div>

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
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{groupClass.title}</h4>
                      {!groupClass.is_active && (
                        <Badge variant="secondary">{t("groupClasses.inactive")}</Badge>
                      )}
                    </div>
                    {groupClass.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {groupClass.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
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
                  {groupClass.schedule_info && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {groupClass.schedule_info}
                    </span>
                  )}
                  {groupClass.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {groupClass.location}
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
