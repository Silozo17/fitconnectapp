import { useGym } from "@/contexts/GymContext";
import { GymStatsGrid } from "@/components/gym/admin/GymStatsGrid";
import { TodaysClassesList } from "@/components/gym/admin/TodaysClassesList";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CreditCard,
  ExternalLink,
  Plus,
  UserPlus,
} from "lucide-react";

export default function GymAdminDashboard() {
  const { gymId } = useParams<{ gymId: string }>();
  const { gym } = useGym();

  const needsStripeSetup = !gym?.stripe_account_id || gym?.stripe_account_status === "pending";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at {gym?.name} today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/gym-admin/${gymId}/members/new`}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/gym-admin/${gymId}/schedule`}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stripe Setup Alert */}
      {needsStripeSetup && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                Complete your payment setup
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Connect your Stripe account to start accepting membership payments.
              </p>
            </div>
            <Button asChild>
              <Link to={`/gym-admin/${gymId}/billing`}>
                <CreditCard className="mr-2 h-4 w-4" />
                Set Up Payments
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <GymStatsGrid />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Classes */}
        <TodaysClassesList />

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to={`/gym-admin/${gymId}/members`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Add New Member</h4>
                  <p className="text-xs text-muted-foreground">
                    Register a new member and assign a plan
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to={`/gym-admin/${gymId}/classes`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Create Class Type</h4>
                  <p className="text-xs text-muted-foreground">
                    Set up a new class category
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to={`/gym-admin/${gymId}/memberships`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">Manage Plans</h4>
                  <p className="text-xs text-muted-foreground">
                    Edit membership plans and pricing
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            <Link
              to={`/gym-portal/${gymId}`}
              target="_blank"
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">View Public Site</h4>
                  <p className="text-xs text-muted-foreground">
                    See what members see
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
        <div className="flex items-center gap-4">
          <span>Gym ID: {gym?.id?.slice(0, 8)}...</span>
          <span>•</span>
          <span>Status: <Badge variant="outline" className="text-xs">{gym?.status}</Badge></span>
        </div>
        <span>Last updated: {format(new Date(), "PPp")}</span>
      </div>
    </div>
  );
}
