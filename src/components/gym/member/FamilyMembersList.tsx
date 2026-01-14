import { useState } from "react";
import { useFamilyMembers, useAddFamilyMember } from "@/hooks/gym/useGymFamily";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserPlus, Baby, User } from "lucide-react";
import { format } from "date-fns";

interface FamilyMembersListProps {
  parentMemberId: string;
}

export function FamilyMembersList({ parentMemberId }: FamilyMembersListProps) {
  const { data: members, isLoading } = useFamilyMembers(parentMemberId);
  const addMember = useAddFamilyMember();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    is_minor: false,
    date_of_birth: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim()) return;

    await addMember.mutateAsync({
      parent_member_id: parentMemberId,
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email || undefined,
      is_minor: formData.is_minor,
      date_of_birth: formData.date_of_birth || undefined,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
    });

    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      is_minor: false,
      date_of_birth: "",
      emergency_contact_name: "",
      emergency_contact_phone: "",
    });
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Family Members
          </CardTitle>
          <CardDescription>Manage linked family accounts</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Family Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label>Minor (Under 18)</Label>
                    <p className="text-xs text-muted-foreground">Requires guardian consent</p>
                  </div>
                </div>
                <Switch
                  checked={formData.is_minor}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_minor: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              </div>

              {!formData.is_minor && (
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              )}

              {formData.is_minor && (
                <>
                  <div className="space-y-2">
                    <Label>Emergency Contact Name</Label>
                    <Input
                      placeholder="Guardian name"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Emergency Contact Phone</Label>
                    <Input
                      type="tel"
                      placeholder="+44 7XXX XXXXXX"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                    />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" disabled={addMember.isPending}>
                {addMember.isPending ? "Adding..." : "Add Family Member"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {members && members.length > 0 ? (
          <div className="space-y-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {member.first_name?.charAt(0) || ""}
                        {member.last_name?.charAt(0) || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {member.first_name} {member.last_name}
                        </h4>
                        {member.is_minor && (
                          <Badge variant="secondary" className="text-xs">
                            <Baby className="h-3 w-3 mr-1" />
                            Minor
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {member.email || (member.date_of_birth && `DOB: ${format(new Date(member.date_of_birth), "PP")}`)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No family members added yet</p>
            <p className="text-sm">Add family members to share your membership</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
