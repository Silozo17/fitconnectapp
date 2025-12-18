import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  User,
  MapPin,
  Target,
  Trophy,
  Lock,
  Heart,
  AlertTriangle,
  Ruler,
  Scale,
  Loader2,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useCoachPipeline } from "@/hooks/useCoachPipeline";
import { toast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Rarity } from "@/lib/avatar-config";

interface ProspectProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientProfileId: string | null;
  participantName: string;
  participantAvatar?: string | null;
}

const ProspectProfileSheet = ({
  open,
  onOpenChange,
  clientProfileId,
  participantName,
  participantAvatar,
}: ProspectProfileSheetProps) => {
  const { user } = useAuth();
  const { addLead, coachProfileId } = useCoachPipeline();

  // Fetch all data in parallel for faster loading
  const { data, isLoading: profileLoading } = useQuery({
    queryKey: ['prospect-profile-full', clientProfileId, coachProfileId],
    queryFn: async () => {
      if (!clientProfileId) return null;

      // Fetch all data in parallel
      const [profileResult, badgesResult, clientResult, leadResult] = await Promise.all([
        // Client profile with avatar
        supabase
          .from('client_profiles')
          .select('*, avatars:selected_avatar_id(slug, rarity)')
          .eq('id', clientProfileId)
          .single(),
        // Client badges
        supabase
          .from('client_badges')
          .select(`*, badge:badges(name, icon, description, rarity)`)
          .eq('client_id', clientProfileId)
          .limit(6),
        // Is already a client check
        coachProfileId 
          ? supabase
              .from('coach_clients')
              .select('id')
              .eq('coach_id', coachProfileId)
              .eq('client_id', clientProfileId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
        // Existing lead check
        coachProfileId
          ? supabase
              .from('coach_leads')
              .select('id, stage')
              .eq('coach_id', coachProfileId)
              .eq('client_id', clientProfileId)
              .maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ]);

      return {
        clientProfile: profileResult.data,
        badges: badgesResult.data || [],
        isClient: !!clientResult.data,
        existingLead: leadResult.data,
      };
    },
    enabled: !!clientProfileId && open,
    staleTime: 30000, // Cache for 30 seconds
  });

  const clientProfile = data?.clientProfile;
  const badges = data?.badges || [];
  const isClient = data?.isClient || false;
  const existingLead = data?.existingLead;


  const handleAddToPipeline = async () => {
    if (!clientProfileId) return;
    try {
      await addLead.mutateAsync({ clientId: clientProfileId, source: 'direct_message' });
      toast({
        title: "Added to pipeline",
        description: "This prospect has been added to your sales pipeline.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add to pipeline.",
        variant: "destructive",
      });
    }
  };

  const fullName = clientProfile
    ? `${clientProfile.first_name || ''} ${clientProfile.last_name || ''}`.trim() || participantName
    : participantName;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:w-[440px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Prospect Profile</SheetTitle>
        </SheetHeader>

        {profileLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col items-center text-center mt-8">
              <UserAvatar
                src={clientProfile?.avatar_url || participantAvatar}
                avatarSlug={(clientProfile?.avatars as any)?.slug}
                avatarRarity={(clientProfile?.avatars as any)?.rarity as Rarity}
                name={fullName}
                variant="squircle"
                size="lg"
                showRarityBorder
              />
              <h3 className="text-lg font-semibold text-foreground">{fullName}</h3>
              {isClient && (
                <Badge variant="default" className="mt-1">
                  <User className="w-3 h-3 mr-1" />
                  Your Client
                </Badge>
              )}
            </div>

            {/* Public Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Public Information
              </h4>

              {/* Age */}
              {clientProfile?.age && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{clientProfile.age} years old</span>
                </div>
              )}

              {/* Location */}
              {clientProfile?.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{clientProfile.location}</span>
                </div>
              )}

              {/* Fitness Goals */}
              {clientProfile?.fitness_goals && clientProfile.fitness_goals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Fitness Goals</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-6">
                    {clientProfile.fitness_goals.map((goal, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {badges.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Achievements</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 ml-6">
                    {badges.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center p-2 rounded-lg bg-muted/50 text-center"
                        title={item.badge?.description}
                      >
                        <Trophy className="w-5 h-5 text-primary" />
                        <span className="text-xs text-muted-foreground truncate w-full">
                          {item.badge?.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Private Info Section (Client Only) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Health Information
                </h4>
                {!isClient && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Client Only
                  </Badge>
                )}
              </div>

              {isClient ? (
                <div className="space-y-3">
                  {/* Height & Weight */}
                  <div className="grid grid-cols-2 gap-3">
                    {clientProfile?.height_cm && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Ruler className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{clientProfile.height_cm} cm</span>
                      </div>
                    )}
                    {clientProfile?.weight_kg && (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{clientProfile.weight_kg} kg</span>
                      </div>
                    )}
                  </div>

                  {/* Dietary Restrictions */}
                  {clientProfile?.dietary_restrictions && clientProfile.dietary_restrictions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        Dietary Restrictions
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {clientProfile.dietary_restrictions.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Allergies */}
                  {clientProfile?.allergies && clientProfile.allergies.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4" />
                        Allergies
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {clientProfile.allergies.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Medical Conditions */}
                  {clientProfile?.medical_conditions && clientProfile.medical_conditions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertTriangle className="w-4 h-4" />
                        Medical Conditions
                      </div>
                      <div className="flex flex-wrap gap-1.5 ml-6">
                        {clientProfile.medical_conditions.map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-500/10 text-red-600 border-red-500/30">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                  <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Health information is only visible after this person becomes your client.</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Link
                to={`/dashboard/coach/messages/${clientProfileId}`}
                onClick={() => onOpenChange(false)}
              >
                <Button className="w-full" variant="default">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </Link>

              {!existingLead && !isClient && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={handleAddToPipeline}
                  disabled={addLead.isPending}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {addLead.isPending ? "Adding..." : "Add to Pipeline"}
                </Button>
              )}

              {existingLead && (
                <Link to="/dashboard/coach/pipeline" onClick={() => onOpenChange(false)}>
                  <Button className="w-full" variant="outline">
                    View in Pipeline
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ProspectProfileSheet;
