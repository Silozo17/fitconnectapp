import { Link } from 'react-router-dom';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { LocationLeaderboard } from '@/components/gamification/LocationLeaderboard';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHelpBanner } from '@/components/discover/PageHelpBanner';

export default function ClientLeaderboard() {
  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_leaderboard"
        title="Community Rankings"
        description="See how you compare with other users in your area"
      />
      <div className="space-y-6">
        {/* Simple Header - no card */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">
              See how you stack up against other members
            </p>
          </div>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard/client/settings?tab=preferences">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Main Leaderboard - no wrapper card */}
        <LocationLeaderboard />
      </div>
    </ClientDashboardLayout>
  );
}
