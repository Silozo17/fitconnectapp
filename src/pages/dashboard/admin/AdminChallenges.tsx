import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Trophy, Users, Calendar, Target, 
  MoreHorizontal, Edit, Trash2, Sparkles, Loader2, Gift 
} from 'lucide-react';
import { format, isPast, isFuture, isWithinInterval } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CreateChallengeModal } from '@/components/admin/CreateChallengeModal';
import { CHALLENGE_TYPES } from '@/hooks/useChallenges';

interface ChallengeReward {
  id: string;
  name: string;
  rarity: string;
  image_url: string | null;
}

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  xp_reward: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  visibility: string;
  target_audience: string;
  max_participants: number | null;
  participant_count?: number;
  reward_type: 'badge' | 'avatar' | null;
  avatar_reward?: ChallengeReward | null;
  badge_reward?: ChallengeReward | null;
}

export default function AdminChallenges() {
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editChallenge, setEditChallenge] = useState<Challenge | null>(null);
  
  const queryClient = useQueryClient();
  
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['admin-challenges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *, 
          challenge_participants(count),
          avatar_reward:avatar_reward_id(id, name, rarity, image_url),
          badge_reward:badge_reward_id(id, name, rarity, image_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map(c => ({
        ...c,
        participant_count: (c.challenge_participants as any)?.[0]?.count || 0,
        avatar_reward: c.avatar_reward as ChallengeReward | null,
        badge_reward: c.badge_reward as ChallengeReward | null,
      })) as Challenge[];
    },
  });
  
  const deleteChallenge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('challenges').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-challenges'] });
      toast.success('Challenge deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete challenge'),
  });
  
  const getChallengeStatus = (challenge: Challenge) => {
    const now = new Date();
    const start = new Date(challenge.start_date);
    const end = new Date(challenge.end_date);
    
    if (!challenge.is_active) return { label: 'Inactive', variant: 'secondary' as const };
    if (isFuture(start)) return { label: 'Upcoming', variant: 'outline' as const };
    if (isPast(end)) return { label: 'Ended', variant: 'secondary' as const };
    return { label: 'Active', variant: 'default' as const };
  };
  
  const filteredChallenges = challenges?.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchesAudience = audienceFilter === 'all' || c.target_audience === audienceFilter;
    return matchesSearch && matchesAudience;
  });
  
  const activeChallenges = filteredChallenges?.filter(c => {
    const now = new Date();
    return c.is_active && isWithinInterval(now, { start: new Date(c.start_date), end: new Date(c.end_date) });
  }) || [];
  
  const upcomingChallenges = filteredChallenges?.filter(c => {
    return c.is_active && isFuture(new Date(c.start_date));
  }) || [];
  
  const pastChallenges = filteredChallenges?.filter(c => {
    return !c.is_active || isPast(new Date(c.end_date));
  }) || [];
  
  const ChallengeRow = ({ challenge }: { challenge: Challenge }) => {
    const status = getChallengeStatus(challenge);
    const typeInfo = CHALLENGE_TYPES.find(t => t.value === challenge.challenge_type);
    
    return (
      <div className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{challenge.title}</h3>
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant="outline" className="capitalize">{challenge.target_audience}</Badge>
              {(challenge.avatar_reward || challenge.badge_reward) && (
                <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary gap-1">
                  <Gift className="h-3 w-3" />
                  {challenge.reward_type === 'avatar' ? 'Avatar' : 'Badge'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {challenge.target_value} {challenge.target_unit}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(challenge.start_date), 'MMM d')} - {format(new Date(challenge.end_date), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {challenge.participant_count} participants
              </span>
              <span className="text-primary font-medium">{challenge.xp_reward} XP</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditChallenge(challenge)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setDeleteId(challenge.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };
  
  return (
    <AdminLayout>
      <Helmet>
        <title>Challenges | Admin Dashboard</title>
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="text-muted-foreground">Create and manage platform challenges</p>
      </div>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{challenges?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Challenges</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeChallenges.length}</p>
                  <p className="text-xs text-muted-foreground">Active Now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingChallenges.length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Users className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {challenges?.reduce((sum, c) => sum + (c.participant_count || 0), 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Participants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="clients">Clients Only</SelectItem>
                <SelectItem value="coaches">Coaches Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Challenge
          </Button>
        </div>
        
        {/* Challenges List */}
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({upcomingChallenges.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastChallenges.length})</TabsTrigger>
            <TabsTrigger value="all">All ({filteredChallenges?.length || 0})</TabsTrigger>
          </TabsList>
          
          <Card className="mt-4">
            <TabsContent value="active" className="m-0">
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
                </div>
              ) : activeChallenges.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active challenges</p>
                </div>
              ) : (
                activeChallenges.map(c => <ChallengeRow key={c.id} challenge={c} />)
              )}
            </TabsContent>
            
            <TabsContent value="upcoming" className="m-0">
              {upcomingChallenges.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming challenges</p>
                </div>
              ) : (
                upcomingChallenges.map(c => <ChallengeRow key={c.id} challenge={c} />)
              )}
            </TabsContent>
            
            <TabsContent value="past" className="m-0">
              {pastChallenges.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No past challenges</p>
                </div>
              ) : (
                pastChallenges.map(c => <ChallengeRow key={c.id} challenge={c} />)
              )}
            </TabsContent>
            
            <TabsContent value="all" className="m-0">
              {filteredChallenges?.map(c => <ChallengeRow key={c.id} challenge={c} />)}
            </TabsContent>
          </Card>
        </Tabs>
      </div>
      
      {/* Create/Edit Modal */}
      <CreateChallengeModal 
        open={createOpen || !!editChallenge} 
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setEditChallenge(null);
        }}
        challenge={editChallenge}
      />
      
      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the challenge and remove all participants. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && deleteChallenge.mutate(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteChallenge.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
