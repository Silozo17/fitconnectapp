import { useState } from "react";
import { Plus, Trash2, CheckCircle, Loader2, Award, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useMyQualifications,
  useCreateQualification,
  useDeleteQualification,
} from "@/hooks/useCoachQualifications";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function CoachQualificationsManager() {
  const { user } = useAuth();
  const { data: qualifications = [], isLoading } = useMyQualifications();
  const createMutation = useCreateQualification();
  const deleteMutation = useDeleteQualification();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newQualification, setNewQualification] = useState({
    name: "",
    issuing_authority: "",
    issue_date: "",
    expiry_date: "",
    document_number: "",
  });

  // Get coach profile ID
  const { data: coachProfile } = useQuery({
    queryKey: ["coach-profile-id", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async () => {
    if (!newQualification.name.trim() || !coachProfile?.id) return;

    await createMutation.mutateAsync({
      coach_id: coachProfile.id,
      name: newQualification.name.trim(),
      issuing_authority: newQualification.issuing_authority.trim() || undefined,
      issue_date: newQualification.issue_date || undefined,
      expiry_date: newQualification.expiry_date || undefined,
      document_number: newQualification.document_number.trim() || undefined,
    });

    setNewQualification({
      name: "",
      issuing_authority: "",
      issue_date: "",
      expiry_date: "",
      document_number: "",
    });
    setIsDialogOpen(false);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(parseISO(dateStr), "MMM yyyy");
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Qualifications & Certifications
            </CardTitle>
            <CardDescription className="mt-1">
              Add your professional qualifications. Upload verification documents to get them verified.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Qualification</DialogTitle>
                <DialogDescription>
                  Add a new certification or qualification. You can verify it later by uploading documents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="qual-name">Qualification Name *</Label>
                  <Input
                    id="qual-name"
                    placeholder="e.g., Level 3 Personal Training"
                    value={newQualification.name}
                    onChange={(e) => setNewQualification(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qual-authority">Issuing Authority</Label>
                  <Input
                    id="qual-authority"
                    placeholder="e.g., CIMSPA, REPs, NASM"
                    value={newQualification.issuing_authority}
                    onChange={(e) => setNewQualification(prev => ({ ...prev, issuing_authority: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="qual-issue">Issue Date</Label>
                    <Input
                      id="qual-issue"
                      type="date"
                      value={newQualification.issue_date}
                      onChange={(e) => setNewQualification(prev => ({ ...prev, issue_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="qual-expiry">Expiry Date</Label>
                    <Input
                      id="qual-expiry"
                      type="date"
                      value={newQualification.expiry_date}
                      onChange={(e) => setNewQualification(prev => ({ ...prev, expiry_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qual-number">Certificate/Document Number</Label>
                  <Input
                    id="qual-number"
                    placeholder="Optional"
                    value={newQualification.document_number}
                    onChange={(e) => setNewQualification(prev => ({ ...prev, document_number: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!newQualification.name.trim() || createMutation.isPending}
                >
                  {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Qualification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {qualifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>No qualifications added yet</p>
            <p className="text-sm mt-1">Add your certifications to display them on your profile</p>
          </div>
        ) : (
          <div className="space-y-3">
            {qualifications.map((qual) => (
              <div
                key={qual.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-foreground">
                      {qual.name}
                    </span>
                    {qual.is_verified ? (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-primary/30 text-primary bg-primary/5 gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                    {qual.issuing_authority && (
                      <span>{qual.issuing_authority}</span>
                    )}
                    {qual.issue_date && (
                      <span>
                        {formatDate(qual.issue_date)}
                        {qual.expiry_date && ` - ${formatDate(qual.expiry_date)}`}
                      </span>
                    )}
                    {qual.document_number && (
                      <span className="font-mono text-xs">{qual.document_number}</span>
                    )}
                  </div>

                  {!qual.is_verified && qual.verification_source === null && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a verification document in the Verification tab to get this verified
                    </p>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => deleteMutation.mutate(qual.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
