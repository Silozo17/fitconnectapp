import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCoachPipeline, Lead, LeadStage } from "@/hooks/useCoachPipeline";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  Loader2,
  ChevronRight,
  Eye,
  FileText,
  Plus,
  Users,
  AlertCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import ProspectProfileSheet from "@/components/messaging/ProspectProfileSheet";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-utils";

const STAGES: { key: LeadStage; label: string; icon: React.ReactNode; color: string; borderColor: string }[] = [
  { key: 'new_lead', label: 'New Leads', icon: <UserPlus className="w-4 h-4" />, color: 'bg-blue-500', borderColor: 'border-l-blue-500' },
  { key: 'conversation_started', label: 'In Conversation', icon: <MessageSquare className="w-4 h-4" />, color: 'bg-amber-500', borderColor: 'border-l-amber-500' },
  { key: 'offer_sent', label: 'Offer Sent', icon: <Send className="w-4 h-4" />, color: 'bg-purple-500', borderColor: 'border-l-purple-500' },
  { key: 'deal_closed', label: 'Deal Closed', icon: <CheckCircle className="w-4 h-4" />, color: 'bg-green-500', borderColor: 'border-l-green-500' },
];

const CoachPipeline = () => {
  const { leads, leadsByStage, isLoading, error, coachProfileId, addLead, updateStage, updateNotes, deleteLead } = useCoachPipeline();
  const [notesModal, setNotesModal] = useState<{ lead: Lead; notes: string } | null>(null);
  const [profileSheet, setProfileSheet] = useState<{ clientId: string; name: string; avatar?: string } | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Fetch clients who messaged the coach but aren't in the pipeline
  const { data: availableClients = [], isLoading: loadingClients, refetch: refetchAvailableClients } = useQuery({
    queryKey: ['available-pipeline-clients', coachProfileId, leads.length],
    queryFn: async () => {
      if (!coachProfileId) return [];
      
      // Get all messages where coach is receiver (clients who initiated contact)
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', coachProfileId);
      
      if (msgError) throw msgError;
      
      // Get unique client IDs
      const clientIds = [...new Set(messages?.map(m => m.sender_id) || [])];
      if (clientIds.length === 0) return [];
      
      // Get existing lead client IDs
      const existingLeadClientIds = leads.map(l => l.client_id);
      
      // Filter to only clients not in pipeline
      const availableIds = clientIds.filter(id => !existingLeadClientIds.includes(id));
      if (availableIds.length === 0) return [];
      
      // Fetch client profiles for available IDs with unified avatar and character avatar
      const { data: clients, error: clientError } = await supabase
        .from('client_profiles')
        .select('id, first_name, last_name, location, fitness_goals, avatar_url, selected_avatar_id, user_profiles(avatar_url), avatar:avatars(slug, rarity)')
        .in('id', availableIds);
      
      if (clientError) throw clientError;
      return clients || [];
    },
    enabled: !!coachProfileId,
  });

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

  const getClientName = (client: { first_name?: string | null; last_name?: string | null }) => {
    const first = client.first_name || '';
    const last = client.last_name || '';
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

  const handleAddToPipeline = async (clientId: string) => {
    try {
      await addLead.mutateAsync({ clientId, source: 'manual' });
      toast({ title: "Lead added", description: "Client added to pipeline" });
      refetchAvailableClients();
    } catch (error) {
      toast({ title: "Error", description: "Failed to add lead", variant: "destructive" });
    }
  };

  const renderLeadCard = (lead: Lead) => {
    const name = getFullName(lead);
    const stageIndex = STAGES.findIndex(s => s.key === lead.stage);
    const stage = STAGES[stageIndex];
    // Use unified avatar from user_profiles, fallback to client_profiles avatar
    const avatarUrl = lead.client_profile?.user_profiles?.avatar_url || lead.client_profile?.avatar_url || undefined;
    const avatarSlug = lead.client_profile?.avatar?.slug || undefined;
    const avatarRarity = lead.client_profile?.avatar?.rarity as Rarity | undefined;
    
    return (
      <Card key={lead.id} className={`mb-3 border-l-4 ${stage.borderColor} hover:shadow-md transition-shadow bg-card`}>
        <CardContent className="p-4">
          {/* Header: Avatar + Name + Quick Actions */}
          <div className="flex items-start gap-3">
            <button
              onClick={() => setProfileSheet({
                clientId: lead.client_id,
                name,
                avatar: avatarUrl,
              })}
              className="flex-shrink-0"
            >
              <UserAvatar
                src={avatarUrl}
                avatarSlug={avatarSlug}
                avatarRarity={avatarRarity}
                name={name}
                className="w-14 h-14 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
                showRarityBorder={!!avatarSlug}
              />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-base truncate">{name}</h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Quick Action: Message */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <Link to={`/dashboard/coach/messages/${lead.client_id}`}>
                      <MessageSquare className="w-4 h-4" />
                    </Link>
                  </Button>
                  
                  {/* More Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open lead menu">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setProfileSheet({
                        clientId: lead.client_id,
                        name,
                        avatar: avatarUrl,
                      })}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setNotesModal({ lead, notes: lead.notes || '' })}>
                        <StickyNote className="w-4 h-4 mr-2" />
                        Edit Notes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {stageIndex < STAGES.length - 1 && (
                        <DropdownMenuItem onClick={() => handleMoveToStage(lead, STAGES[stageIndex + 1].key)}>
                          <ChevronRight className="w-4 h-4 mr-2" />
                          Move to {STAGES[stageIndex + 1].label}
                        </DropdownMenuItem>
                      )}
                      {stageIndex > 0 && (
                        <DropdownMenuItem onClick={() => handleMoveToStage(lead, STAGES[stageIndex - 1].key)}>
                          <ChevronRight className="w-4 h-4 mr-2 rotate-180" />
                          Move to {STAGES[stageIndex - 1].label}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
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
              </div>

              {/* Location */}
              {lead.client_profile?.location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{lead.client_profile.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Goals */}
          {lead.client_profile?.fitness_goals && lead.client_profile.fitness_goals.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {lead.client_profile.fitness_goals.slice(0, 3).map((goal, i) => (
                <Badge key={i} variant="secondary" className="text-xs px-2 py-0.5">
                  {goal}
                </Badge>
              ))}
              {lead.client_profile.fitness_goals.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{lead.client_profile.fitness_goals.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Notes */}
          {lead.notes && (
            <div className="mt-3 p-2.5 rounded-md bg-muted/50">
              <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-1.5">
                <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{lead.notes}</span>
              </p>
            </div>
          )}

          {/* Footer: Time + Source */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
            </span>
            {lead.source && (
              <Badge variant="outline" className="text-xs capitalize">
                {lead.source.replace('_', ' ')}
              </Badge>
            )}
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
      {/* Header with Add Button */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowAddLeadModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add to Pipeline
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load pipeline data</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
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

      {/* Add to Pipeline Modal */}
      <Dialog open={showAddLeadModal} onOpenChange={setShowAddLeadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Add to Pipeline
            </DialogTitle>
            <DialogDescription>
              Add clients who have messaged you back to your pipeline
            </DialogDescription>
          </DialogHeader>
          
          {loadingClients ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : availableClients.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No available clients to add</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                All clients who messaged you are already in the pipeline
              </p>
            </div>
          ) : (
            <ScrollArea className="max-h-[400px] pr-4">
              <div className="space-y-2">
                {availableClients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <UserAvatar
                      src={(client as any).user_profiles?.avatar_url || client.avatar_url || undefined}
                      avatarSlug={(client as any).avatar?.slug}
                      avatarRarity={(client as any).avatar?.rarity as Rarity}
                      name={getClientName(client)}
                      className="w-12 h-12"
                      showRarityBorder={!!(client as any).avatar?.slug}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{getClientName(client)}</p>
                      {client.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          {client.location}
                        </p>
                      )}
                      {client.fitness_goals && client.fitness_goals.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {client.fitness_goals.slice(0, 2).map((goal, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {goal}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddToPipeline(client.id)}
                      disabled={addLead.isPending}
                    >
                      {addLead.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLeadModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
