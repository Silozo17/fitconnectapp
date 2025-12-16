import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { LocationLeaderboard } from '@/components/gamification/LocationLeaderboard';
import { ShareAchievementButton } from '@/components/gamification/ShareAchievementButton';
import { useMyRank } from '@/hooks/useLeaderboard';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Calendar, MapPin, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function ClientLeaderboard() {
  const { data: myRank } = useMyRank();
  
  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Compete with other members in your area</p>
          </div>
          <Link to="/dashboard/client/settings">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Leaderboard Settings
            </Button>
          </Link>
        </div>
        
        {myRank && myRank.rank && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-primary/20 rounded-full p-3"><Crown className="h-6 w-6 text-primary" /></div>
                  <div>
                    <div className="text-sm text-muted-foreground">Your Global Rank</div>
                    <div className="text-2xl font-bold">#{myRank.rank}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">out of {myRank.total} members</div>
                    <div className="text-lg font-medium text-primary">{myRank.xp?.toLocaleString()} XP</div>
                  </div>
                  <ShareAchievementButton 
                    achievement={{
                      type: 'rank',
                      title: 'on the Global Leaderboard',
                      description: `I'm competing with ${myRank.total} other fitness enthusiasts!`,
                      value: myRank.rank,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <Tabs defaultValue="location" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              By Location
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              By Time Period
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="location">
            <LocationLeaderboard timeFrame="alltime" />
          </TabsContent>
          
          <TabsContent value="time">
            <LocationLeaderboard timeFrame="weekly" />
          </TabsContent>
        </Tabs>
      </div>
    </ClientDashboardLayout>
  );
}
