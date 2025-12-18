import { useState } from "react";
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
}: {
  initialData?: GroupClass;
  onSubmit: (data: GroupClassFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
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
        <Label htmlFor="title">Class Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Morning HIIT Class"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what the class involves..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="schedule">Schedule</Label>
          <Input
            id="schedule"
            value={formData.schedule_info}
            onChange={(e) => setFormData({ ...formData, schedule_info: e.target.value })}
            placeholder="e.g., Mon/Wed/Fri 7:00 AM"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Central Park, NYC"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="target">Who is this for?</Label>
        <Input
          id="target"
          value={formData.target_audience}
          onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
          placeholder="e.g., All fitness levels welcome"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
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
          <Label htmlFor="max">Max Participants</Label>
          <Input
            id="max"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
            placeholder="Leave empty for unlimited"
            min="1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Waitlist Open</Label>
          <p className="text-xs text-muted-foreground">Allow clients to join the waitlist</p>
        </div>
        <Switch
          checked={formData.is_waitlist_open}
          onCheckedChange={(checked) => setFormData({ ...formData, is_waitlist_open: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Active</Label>
          <p className="text-xs text-muted-foreground">Show this class on your profile</p>
        </div>
        <Switch
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={() => onSubmit(formData)} disabled={isSubmitting || !formData.title}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {initialData ? "Save Changes" : "Create Class"}
        </Button>
      </div>
    </div>
  );
}

function WaitlistViewer({ classId, className }: { classId: string; className: string }) {
  const { data: waitlist = [], isLoading } = useGroupClassWaitlist(classId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4 mr-1" />
          Waitlist ({waitlist.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Waitlist for {className}</DialogTitle>
          <DialogDescription>
            {waitlist.length} {waitlist.length === 1 ? "person" : "people"} on the waitlist
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : waitlist.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No one on the waitlist yet
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
            <CardTitle className="text-lg">Group Classes</CardTitle>
            <CardDescription>
              Offer group sessions and manage waitlists
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create Group Class</DialogTitle>
                <DialogDescription>
                  Set up a new group class for clients to join
                </DialogDescription>
              </DialogHeader>
              <GroupClassForm
                onSubmit={handleCreate}
                onCancel={() => setIsCreateOpen(false)}
                isSubmitting={createClass.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No group classes yet</p>
            <p className="text-xs mt-1">Create your first class to start accepting waitlist signups</p>
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
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    {groupClass.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {groupClass.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <WaitlistViewer classId={groupClass.id} className={groupClass.title} />
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
                    <strong>For:</strong> {groupClass.target_audience}
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
            <DialogTitle>Edit Group Class</DialogTitle>
            <DialogDescription>
              Update your group class details
            </DialogDescription>
          </DialogHeader>
          {editingClass && (
            <GroupClassForm
              initialData={editingClass}
              onSubmit={handleUpdate}
              onCancel={() => setEditingClass(null)}
              isSubmitting={updateClass.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group Class?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this group class and remove all waitlist entries.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClass.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
