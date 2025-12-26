import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { useAvailableChallenges, useMyChallenges } from '@/hooks/useChallenges';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, CheckCircle2, Flame } from 'lucide-react';
import { PageHelpBanner } from '@/components/discover/PageHelpBanner';

export default function ClientChallenges() {
  const { data: availableChallenges, isLoading: availableLoading } = useAvailableChallenges();
  const { data: myChallenges, isLoading: myLoading } = useMyChallenges();
  
  const activeChallenges = myChallenges?.filter(c => c.status === 'active') || [];
  const completedChallenges = myChallenges?.filter(c => c.status === 'completed') || [];
  const notJoinedChallenges = availableChallenges?.filter(c => !c.my_participation) || [];
  
  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_challenges"
        title="Fitness Challenges"
        description="Join challenges to stay motivated and win rewards"
      />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Join challenges and compete with others</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card variant="glass" className="glass-card rounded-2xl"><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="bg-primary/20 rounded-xl p-2.5"><Flame className="h-5 w-5 text-primary" /></div><div><div className="text-2xl font-bold">{activeChallenges.length}</div><div className="text-xs text-muted-foreground">Active</div></div></div></CardContent></Card>
          <Card variant="glass" className="glass-card rounded-2xl"><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="bg-green-500/20 rounded-xl p-2.5"><CheckCircle2 className="h-5 w-5 text-green-500" /></div><div><div className="text-2xl font-bold">{completedChallenges.length}</div><div className="text-xs text-muted-foreground">Completed</div></div></div></CardContent></Card>
          <Card variant="glass" className="glass-card rounded-2xl"><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="bg-blue-500/20 rounded-xl p-2.5"><Target className="h-5 w-5 text-blue-500" /></div><div><div className="text-2xl font-bold">{notJoinedChallenges.length}</div><div className="text-xs text-muted-foreground">Available</div></div></div></CardContent></Card>
          <Card variant="glass" className="glass-card rounded-2xl"><CardContent className="pt-5 pb-4"><div className="flex items-center gap-3"><div className="bg-yellow-500/20 rounded-xl p-2.5"><Trophy className="h-5 w-5 text-yellow-500" /></div><div><div className="text-2xl font-bold">{myChallenges?.length || 0}</div><div className="text-xs text-muted-foreground">Total Joined</div></div></div></CardContent></Card>
        </div>
        
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-muted/50 backdrop-blur-sm p-1 rounded-2xl">
            <TabsTrigger value="active" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Active ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="available" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Available ({notJoinedChallenges.length})</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm">Completed ({completedChallenges.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {myLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
            ) : activeChallenges.length === 0 ? (
              <Card variant="glass" className="glass-card rounded-3xl"><CardContent className="py-16 text-center"><div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><Flame className="h-8 w-8 text-primary/70" /></div><h3 className="font-semibold mb-1">No Active Challenges</h3><p className="text-sm text-muted-foreground">Join a challenge to start competing!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{activeChallenges.map((p) => <ChallengeCard key={p.id} challenge={{ ...p.challenge, my_participation: p }} showJoinButton={false} showProgress={true} />)}</div>
            )}
          </TabsContent>
          
          <TabsContent value="available">
            {availableLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
            ) : notJoinedChallenges.length === 0 ? (
              <Card variant="glass" className="glass-card rounded-3xl"><CardContent className="py-16 text-center"><div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4"><Target className="h-8 w-8 text-blue-500/70" /></div><h3 className="font-semibold mb-1">No Challenges Available</h3><p className="text-sm text-muted-foreground">Check back later for new challenges!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{notJoinedChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} showJoinButton={true} />)}</div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {myLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-3xl" />)}</div>
            ) : completedChallenges.length === 0 ? (
              <Card variant="glass" className="glass-card rounded-3xl"><CardContent className="py-16 text-center"><div className="w-16 h-16 rounded-3xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4"><Trophy className="h-8 w-8 text-yellow-500/70" /></div><h3 className="font-semibold mb-1">No Completed Challenges</h3><p className="text-sm text-muted-foreground">Complete your active challenges to see them here!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{completedChallenges.map((p) => <ChallengeCard key={p.id} challenge={{ ...p.challenge, my_participation: p }} showJoinButton={false} showProgress={true} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
