import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRedeemInvitation } from "@/hooks/useCommunityInvitations";

const InviteRedeem = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const redeem = useRedeemInvitation();
  const [attempted, setAttempted] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      // Redirect to auth with return URL
      navigate(`/auth?redirect=/invite/${code}`);
      return;
    }
    if (!attempted && code) {
      setAttempted(true);
      redeem.mutate(code);
    }
  }, [user, authLoading, code, attempted]);

  if (authLoading || redeem.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="py-12 text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Joining community...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redeem.isSuccess) {
    const { communityId, alreadyMember } = redeem.data;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="py-12 text-center space-y-4">
            <CheckCircle2 className="h-10 w-10 mx-auto text-primary" />
            <h2 className="text-lg font-semibold">
              {alreadyMember ? "Already a member!" : "Welcome to the community!"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {alreadyMember
                ? "You're already a member of this community."
                : "You've successfully joined the community."}
            </p>
            <Button onClick={() => navigate(`/dashboard/client/community/${communityId}`)}>
              Go to Community
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redeem.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md rounded-2xl">
          <CardContent className="py-12 text-center space-y-4">
            <XCircle className="h-10 w-10 mx-auto text-destructive" />
            <h2 className="text-lg font-semibold">Invalid or Expired Invite</h2>
            <p className="text-sm text-muted-foreground">
              {redeem.error?.message || "This invite link is no longer valid."}
            </p>
            <Button variant="outline" onClick={() => navigate("/dashboard/client/community")}>
              Browse Communities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default InviteRedeem;
