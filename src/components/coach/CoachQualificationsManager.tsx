import { useState, useRef } from "react";
import { Plus, Trash2, CheckCircle, Loader2, Award, Clock, Upload, FileText, ExternalLink } from "lucide-react";
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
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function CoachQualificationsManager() {
  const { user } = useAuth();
  const { data: qualifications = [], isLoading } = useMyQualifications();
  const createMutation = useCreateQualification();
  const deleteMutation = useDeleteQualification();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const uploadDocument = async (file: File): Promise<string | null> => {
    if (!coachProfile?.id) return null;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${coachProfile.id}/${crypto.randomUUID()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('verification-documents')
      .upload(fileName, file);
    
    if (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload document');
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('verification-documents')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, PNG, or WebP files are allowed');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!newQualification.name.trim() || !coachProfile?.id) return;

    setUploading(true);
    
    try {
      let documentUrl: string | undefined;
      
      // Upload document if selected
      if (selectedFile) {
        const url = await uploadDocument(selectedFile);
        if (url) {
          documentUrl = url;
        }
      }

      await createMutation.mutateAsync({
        coach_id: coachProfile.id,
        name: newQualification.name.trim(),
        issuing_authority: newQualification.issuing_authority.trim() || undefined,
        issue_date: newQualification.issue_date || undefined,
        expiry_date: newQualification.expiry_date || undefined,
        document_number: newQualification.document_number.trim() || undefined,
        document_url: documentUrl,
        verification_status: 'pending', // Always pending until admin reviews
      });

      setNewQualification({
        name: "",
        issuing_authority: "",
        issue_date: "",
        expiry_date: "",
        document_number: "",
      });
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsDialogOpen(false);
      
      if (documentUrl) {
        toast.success('Qualification added and sent for verification');
      }
    } catch (error) {
      console.error('Error creating qualification:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return format(parseISO(dateStr), "MMM yyyy");
    } catch {
      return null;
    }
  };

  const getVerificationBadge = (qual: typeof qualifications[0]) => {
    const status = qual.verification_status || (qual.is_verified ? 'approved' : 'pending');
    
    switch (status) {
      case 'approved':
        return (
          <Badge 
            variant="outline" 
            className="text-xs border-primary/30 text-primary bg-primary/5 gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-xs gap-1">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs gap-1">
            <Clock className="h-3 w-3" />
            Pending Verification
          </Badge>
        );
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
              Add your professional qualifications with verification documents to get them verified.
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
                  Add a new certification or qualification. Upload a document to have it verified by our team.
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
                
                {/* Document Upload Section */}
                <div className="space-y-2">
                  <Label>Verification Document</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="qual-doc-upload"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <label htmlFor="qual-doc-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Upload certificate or qualification document
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, JPEG, PNG, or WebP (max 10MB)
                        </p>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Documents are reviewed by our verification team. Qualifications will show a "Verified" badge once approved.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!newQualification.name.trim() || createMutation.isPending || uploading}
                >
                  {(createMutation.isPending || uploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
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
                    {getVerificationBadge(qual)}
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

                  {qual.document_url && (
                    <a 
                      href={qual.document_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline mt-1"
                    >
                      <ExternalLink className="h-3 w-3" /> View Uploaded Document
                    </a>
                  )}

                  {!qual.is_verified && !qual.document_url && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Add a verification document to have this qualification verified
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
