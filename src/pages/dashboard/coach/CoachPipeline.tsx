import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCoachPipeline, Lead, LeadStage } from "@/hooks/useCoachPipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  UserPlus,
  MessageSquare,
  Send,
  CheckCircle,
  MoreVertical,
  Trash2,
  StickyNote,
  MapPin,
  Target,
  Loader2,
  ChevronRight,
  Eye,
  FileText,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ProspectProfileSheet from "@/components/messaging/ProspectProfileSheet";

const STAGES: { key: LeadStage; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'new_lead', label: 'New Leads', icon: <UserPlus className="w-4 h-4" />, color: 'bg-blue-500' },
  { key: 'conversation_started', label: 'In Conversation', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-amber-500' },
  { key: 'offer_sent', label: 'Offer Sent', icon: <Send className="w-4 h-4" />, color: 'bg-purple-500' },
  { key: 'deal_closed', label: 'Deal Closed', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500' },
];

const CoachPipeline = () => {
  const { leadsByStage, isLoading, updateStage, updateNotes, deleteLead } = useCoachPipeline();
  const [notesModal, setNotesModal] = useState<{ lead: Lead; notes: string } | null>(null);
  const [profileSheet, setProfileSheet] = useState<{ clientId: string; name: string; avatar?: string } | null>(null);

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const f = firstName?.[0] || '';
    const l = lastName?.[0] || '';
    return (f + l).toUpperCase() || '?';
  };

  const getFullName = (lead: Lead) => {
    const first = lead.client_profile?.first_name || '';
    const last = lead.client_profile?.last_name || '';
    return `${first} ${last}`.trim() || 'Unknown';
  };

  const handleMoveToStage = async (lead: Lead, newStage: LeadStage) => {
    try {
      await updateStage.mutateAsync({ leadId: lead.id, stage: newStage });
      toast({ title: "Lead updated", description: `Moved to ${STAGES.find(s => s.key === newStage)?.label}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead", variant: "destructive" });
    }
  };

  const handleSaveNotes = async () => {
    if (!notesModal) return;
    try {
      await updateNotes.mutateAsync({ leadId: notesModal.lead.id, notes: notesModal.notes });
      toast({ title: "Notes saved" });
      setNotesModal(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save notes", variant: "destructive" });
    }
  };

  const handleDelete = async (lead: Lead) => {
    try {
      await deleteLead.mutateAsync(lead.id);
      toast({ title: "Lead removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove lead", variant: "destructive" });
    }
  };

  const renderLeadCard = (lead: Lead) => {
    const name = getFullName(lead);
    const stageIndex = STAGES.findIndex(s => s.key === lead.stage);
    
    return (
      <Card key={lead.id} className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => setProfileSheet({
                clientId: lead.client_id,
                name,
                avatar: lead.client_profile?.avatar_url || undefined,
              })}
              className="flex-shrink-0"
            >
              <Avatar className="w-10 h-10 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                <AvatarImage src={lead.client_profile?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {getInitials(lead.client_profile?.first_name, lead.client_profile?.last_name)}
                </AvatarFallback>
              </Avatar>
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm truncate">{name}</h4>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Open lead menu">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setProfileSheet({
                      clientId: lead.client_id,
                      name,
                      avatar: lead.client_profile?.avatar_url || undefined,
                    })}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/coach/messages/${lead.client_id}`}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setNotesModal({ lead, notes: lead.notes || '' })}>
                      <StickyNote className="w-4 h-4 mr-2" />
                      Edit Notes
                    </DropdownMenuItem>
                    {stageIndex < STAGES.length - 1 && (
                      <DropdownMenuItem onClick={() => handleMoveToStage(lead, STAGES[stageIndex + 1].key)}>
                        <ChevronRight className="w-4 h-4 mr-2" />
                        Move to {STAGES[stageIndex + 1].label}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDelete(lead)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {lead.client_profile?.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  {lead.client_profile.location}
                </div>
              )}

              {lead.client_profile?.fitness_goals && lead.client_profile.fitness_goals.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {lead.client_profile.fitness_goals.slice(0, 2).map((goal, i) => (
                    <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0">
                      {goal}
                    </Badge>
                  ))}
                  {lead.client_profile.fitness_goals.length > 2 && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      +{lead.client_profile.fitness_goals.length - 2}
                    </Badge>
                  )}
                </div>
              )}

              {lead.notes && (
                <p className="text-xs text-muted-foreground truncate mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 flex-shrink-0" />
                  {lead.notes}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </span>
                {lead.source && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    {lead.source.replace('_', ' ')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <DashboardLayout
      title="Sales Pipeline"
      description="Track and manage your leads from first contact to client conversion"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <div key={stage.key} className="flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg ${stage.color} flex items-center justify-center text-white`}>
                  {stage.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{stage.label}</h3>
                  <span className="text-xs text-muted-foreground">
                    {leadsByStage[stage.key].length} leads
                  </span>
                </div>
              </div>

              <div className="flex-1 min-h-[200px] p-2 rounded-lg bg-muted/30 border border-dashed border-border">
                {leadsByStage[stage.key].length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    No leads
                  </div>
                ) : (
                  leadsByStage[stage.key].map(renderLeadCard)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes Modal */}
      <Dialog open={!!notesModal} onOpenChange={() => setNotesModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Notes</DialogTitle>
          </DialogHeader>
          <Textarea
            value={notesModal?.notes || ''}
            onChange={(e) => notesModal && setNotesModal({ ...notesModal, notes: e.target.value })}
            placeholder="Add notes about this lead..."
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotesModal(null)}>Cancel</Button>
            <Button onClick={handleSaveNotes} disabled={updateNotes.isPending}>
              {updateNotes.isPending ? "Saving..." : "Save Notes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Sheet */}
      <ProspectProfileSheet
        open={!!profileSheet}
        onOpenChange={() => setProfileSheet(null)}
        clientProfileId={profileSheet?.clientId || null}
        participantName={profileSheet?.name || ''}
        participantAvatar={profileSheet?.avatar}
      />
    </DashboardLayout>
  );
};

export default CoachPipeline;
