import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeDateInput } from "@/components/ui/native-date-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useCoachQualifications,
  useCreateQualification,
  useUpdateQualification,
  useDeleteQualification,
  CoachQualification
} from "@/hooks/useCoachQualifications";
import { Plus, Trash2, Award, CheckCircle, Clock, XCircle, Loader2, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface AdminQualificationsManagerProps {
  coachId: string;
}

export function AdminQualificationsManager({ coachId }: AdminQualificationsManagerProps) {
  const { data: qualifications = [], isLoading } = useCoachQualifications(coachId);
  const createQualification = useCreateQualification();
  const updateQualification = useUpdateQualification();
  const deleteQualification = useDeleteQualification();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [issuingAuthority, setIssuingAuthority] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');

  const resetForm = () => {
    setName("");
    setIssuingAuthority("");
    setIssueDate("");
    setExpiryDate("");
    setDocumentNumber("");
    setVerificationStatus('approved');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    await createQualification.mutateAsync({
      coach_id: coachId,
      name: name.trim(),
      issuing_authority: issuingAuthority.trim() || undefined,
      issue_date: issueDate || undefined,
      expiry_date: expiryDate || undefined,
      document_number: documentNumber.trim() || undefined,
      verification_status: verificationStatus,
    });

    resetForm();
    setAddDialogOpen(false);
  };

  const handleVerificationChange = async (qual: CoachQualification, status: 'pending' | 'approved' | 'rejected') => {
    await updateQualification.mutateAsync({
      id: qual.id,
      verification_status: status,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteQualification.mutateAsync(id);
  };

  const formatDate = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return date;
    }
  };

  const getStatusBadge = (qual: CoachQualification) => {
    const status = qual.verification_status || (qual.is_verified ? 'approved' : 'pending');
    
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" /> Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="gap-1">
            <Clock className="h-3 w-3" /> Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading qualifications...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Award className="h-4 w-4" />
          Qualifications & Certifications
        </h3>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Qualification</DialogTitle>
              <DialogDescription>
                Add a new qualification or certification for this coach.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Qualification Name *</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Level 3 Personal Training"
                />
              </div>
              <div className="space-y-2">
                <Label>Issuing Authority</Label>
                <Input 
                  value={issuingAuthority} 
                  onChange={(e) => setIssuingAuthority(e.target.value)}
                  placeholder="e.g. CIMSPA, NASM"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 min-w-0 overflow-hidden">
                  <Label>Issue Date</Label>
                  <NativeDateInput 
                    value={issueDate} 
                    onChange={setIssueDate}
                  />
                </div>
                <div className="space-y-2 min-w-0 overflow-hidden">
                  <Label>Expiry Date</Label>
                  <NativeDateInput 
                    value={expiryDate} 
                    onChange={setExpiryDate}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certificate Number</Label>
                <Input 
                  value={documentNumber} 
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Certificate or document number"
                />
              </div>
              <div className="space-y-2">
                <Label>Verification Status</Label>
                <Select value={verificationStatus} onValueChange={(v) => setVerificationStatus(v as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!name.trim() || createQualification.isPending}
              >
                {createQualification.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Adding...</>
                ) : "Add Qualification"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {qualifications.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No qualifications added yet.</p>
      ) : (
        <div className="space-y-3">
          {qualifications.map((qual) => (
            <div 
              key={qual.id} 
              className="flex items-start justify-between p-3 bg-muted/50 rounded-lg group"
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{qual.name}</span>
                  {getStatusBadge(qual)}
                </div>
                {qual.issuing_authority && (
                  <p className="text-xs text-muted-foreground">
                    Issued by: {qual.issuing_authority}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {qual.issue_date && (
                    <span>Issue: {formatDate(qual.issue_date)}</span>
                  )}
                  {qual.expiry_date && (
                    <span>Expires: {formatDate(qual.expiry_date)}</span>
                  )}
                  {qual.document_number && (
                    <span>№ {qual.document_number}</span>
                  )}
                </div>
                {qual.document_url && (
                  <a 
                    href={qual.document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" /> View Document
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={qual.verification_status || (qual.is_verified ? 'approved' : 'pending')}
                  onValueChange={(v) => handleVerificationChange(qual, v as any)}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(qual.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
