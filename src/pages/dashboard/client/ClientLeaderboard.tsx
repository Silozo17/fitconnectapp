import { Link } from 'react-router-dom';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { LocationLeaderboard } from '@/components/gamification/LocationLeaderboard';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHelpBanner } from '@/components/discover/PageHelpBanner';
import { DashboardSectionHeader } from '@/components/shared/DashboardSectionHeader';

export default function ClientLeaderboard() {
  return (
    <ClientDashboardLayout>
      <PageHelpBanner
        pageKey="client_leaderboard"
        title="Community Rankings"
        description="See how you compare with other users in your area"
      />
      
      {/* Page Header with gradient - matches ClientOverview pattern */}
      <DashboardSectionHeader
        title="Community Leaderboard"
        description="See how you stack up against other members"
        action={
          <Button variant="ghost" size="icon" className="rounded-xl" asChild>
            <Link to="/dashboard/client/settings?tab=preferences">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        }
        className="mb-6"
      />

      {/* Main Leaderboard - no wrapper card, 44px bottom margin for section spacing */}
      <div className="mb-11">
        <LocationLeaderboard />
      </div>
    </ClientDashboardLayout>
  );
}
