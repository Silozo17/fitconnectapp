import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { ChallengeCard } from '@/components/gamification/ChallengeCard';
import { useAvailableChallenges, useMyChallenges } from '@/hooks/useChallenges';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Target, CheckCircle2, Flame } from 'lucide-react';

export default function ClientChallenges() {
  const { data: availableChallenges, isLoading: availableLoading } = useAvailableChallenges();
  const { data: myChallenges, isLoading: myLoading } = useMyChallenges();
  
  const activeChallenges = myChallenges?.filter(c => c.status === 'active') || [];
  const completedChallenges = myChallenges?.filter(c => c.status === 'completed') || [];
  const notJoinedChallenges = availableChallenges?.filter(c => !c.my_participation) || [];
  
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="text-muted-foreground">Join challenges and compete with others</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="bg-primary/20 rounded-full p-2"><Flame className="h-5 w-5 text-primary" /></div><div><div className="text-2xl font-bold">{activeChallenges.length}</div><div className="text-xs text-muted-foreground">Active</div></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="bg-green-500/20 rounded-full p-2"><CheckCircle2 className="h-5 w-5 text-green-500" /></div><div><div className="text-2xl font-bold">{completedChallenges.length}</div><div className="text-xs text-muted-foreground">Completed</div></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="bg-blue-500/20 rounded-full p-2"><Target className="h-5 w-5 text-blue-500" /></div><div><div className="text-2xl font-bold">{notJoinedChallenges.length}</div><div className="text-xs text-muted-foreground">Available</div></div></div></CardContent></Card>
          <Card><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="bg-yellow-500/20 rounded-full p-2"><Trophy className="h-5 w-5 text-yellow-500" /></div><div><div className="text-2xl font-bold">{myChallenges?.length || 0}</div><div className="text-xs text-muted-foreground">Total Joined</div></div></div></CardContent></Card>
        </div>
        
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="available">Available ({notJoinedChallenges.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {myLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
            ) : activeChallenges.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Flame className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" /><h3 className="font-semibold mb-1">No Active Challenges</h3><p className="text-sm text-muted-foreground">Join a challenge to start competing!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{activeChallenges.map((p) => <ChallengeCard key={p.id} challenge={{ ...p.challenge, my_participation: p }} showJoinButton={false} showProgress={true} />)}</div>
            )}
          </TabsContent>
          
          <TabsContent value="available">
            {availableLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
            ) : notJoinedChallenges.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" /><h3 className="font-semibold mb-1">No Challenges Available</h3><p className="text-sm text-muted-foreground">Check back later for new challenges!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{notJoinedChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} showJoinButton={true} />)}</div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {myLoading ? (
              <div className="grid gap-4 md:grid-cols-2">{[...Array(2)].map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
            ) : completedChallenges.length === 0 ? (
              <Card><CardContent className="py-12 text-center"><Trophy className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" /><h3 className="font-semibold mb-1">No Completed Challenges</h3><p className="text-sm text-muted-foreground">Complete your active challenges to see them here!</p></CardContent></Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{completedChallenges.map((p) => <ChallengeCard key={p.id} challenge={{ ...p.challenge, my_participation: p }} showJoinButton={false} showProgress={true} />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
