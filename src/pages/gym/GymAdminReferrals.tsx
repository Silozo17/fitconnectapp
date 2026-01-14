import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useGymReferralRewards, useReferralStats, useReferralMutations } from "@/hooks/gym/useGymReferrals";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Gift,
  Users,
  Coins,
  TrendingUp,
  CheckCircle,
  Clock,
  Award
} from "lucide-react";
import { format } from "date-fns";
import { GymAdminLayout } from "@/components/gym/admin/GymAdminLayout";

export default function GymAdminReferrals() {
  const { gymId } = useParams();
  const { gym } = useGym();
  const [awardingReward, setAwardingReward] = useState<any>(null);
  const [creditsAmount, setCreditsAmount] = useState<string>("1");

  const { data: rewards = [], isLoading } = useGymReferralRewards(gymId);
  const { data: stats } = useReferralStats(gymId);
  const { awardReferral } = useReferralMutations(gymId);

  const handleAward = () => {
    if (!awardingReward) return;
    
    awardReferral.mutate(
      { rewardId: awardingReward.id, creditsAmount: parseInt(creditsAmount) || 1 },
      {
        onSuccess: () => {
          setAwardingReward(null);
          setCreditsAmount("1");
        },
      }
    );
  };

  const pendingRewards = rewards.filter(r => r.status === "pending");
  const awardedRewards = rewards.filter(r => r.status === "awarded");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case "awarded":
        return <Badge variant="outline" className="bg-green-500/10 text-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Awarded</Badge>;
      case "expired":
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMemberName = (member: any) => {
    if (!member?.user_profiles) return "Unknown";
    const { first_name, last_name } = member.user_profiles;
    return `${first_name || ""} ${last_name || ""}`.trim() || "Unknown";
  };

  return (
    <GymAdminLayout gymId={gymId!} gymName={gym?.name || "Loading..."}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Referral Programme</h1>
          <p className="text-muted-foreground">Manage member referrals and rewards</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Referrals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.awarded || 0}</p>
                  <p className="text-sm text-muted-foreground">Awarded</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Coins className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalCreditsAwarded || 0}</p>
                  <p className="text-sm text-muted-foreground">Credits Given</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Rewards */}
        {pendingRewards.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Pending Rewards
              </CardTitle>
              <CardDescription>
                Review and award credits to members who referred new signups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRewards.map((reward) => (
                  <div
                    key={reward.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Award className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {getMemberName(reward.referrer)} referred {getMemberName(reward.referred)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(reward.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(reward.status)}
                      <Button onClick={() => setAwardingReward(reward)}>
                        <Coins className="h-4 w-4 mr-2" />
                        Award Credits
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Referrals History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading referrals...</div>
            ) : rewards.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No referrals yet</h3>
                <p className="text-muted-foreground">
                  When members refer friends, referrals will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Referrer</th>
                      <th className="text-left p-4 font-medium">Referred Member</th>
                      <th className="text-left p-4 font-medium">Date</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Credits</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {rewards.map((reward) => (
                      <tr key={reward.id}>
                        <td className="p-4">{getMemberName(reward.referrer)}</td>
                        <td className="p-4">{getMemberName(reward.referred)}</td>
                        <td className="p-4">
                          {format(new Date(reward.created_at), "MMM d, yyyy")}
                        </td>
                        <td className="p-4">{getStatusBadge(reward.status)}</td>
                        <td className="p-4">
                          {reward.reward_value ? (
                            <span className="flex items-center gap-1">
                              <Coins className="h-4 w-4 text-yellow-500" />
                              {reward.reward_value}
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="p-4">
                          {reward.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAwardingReward(reward)}
                            >
                              Award
                            </Button>
                          )}
                          {reward.status === "awarded" && reward.awarded_at && (
                            <span className="text-sm text-muted-foreground">
                              Awarded {format(new Date(reward.awarded_at), "MMM d")}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Award Dialog */}
        <Dialog open={!!awardingReward} onOpenChange={() => setAwardingReward(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Award Referral Credits</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Award credits to <strong>{getMemberName(awardingReward?.referrer)}</strong> for
                referring <strong>{getMemberName(awardingReward?.referred)}</strong>
              </p>
              <div className="space-y-2">
                <Label>Credits to Award</Label>
                <Input
                  type="number"
                  min="1"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAwardingReward(null)}>
                Cancel
              </Button>
              <Button onClick={handleAward} disabled={awardReferral.isPending}>
                <Coins className="h-4 w-4 mr-2" />
                Award {creditsAmount} Credits
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </GymAdminLayout>
  );
}
