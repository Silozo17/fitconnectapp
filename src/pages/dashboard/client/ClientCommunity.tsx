import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Plus, Loader2, Crown, Tag, Gift } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DashboardSectionHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useClientCommunities, useDiscoverCommunities, useJoinCommunity, type Community } from "@/hooks/useCommunity";
import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ClientCommunity = () => {
  const { t } = useTranslation("client");
  const navigate = useNavigate();
  const { data: myCommunities = [], isLoading: myLoading } = useClientCommunities();
  const { data: discoverCommunities = [], isLoading: discoverLoading } = useDiscoverCommunities();
  const joinCommunity = useJoinCommunity();
  const [joinTarget, setJoinTarget] = useState<Community | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const myCommunityIds = new Set(myCommunities.map((c) => c.id));
  const availableToJoin = discoverCommunities.filter((c) => !myCommunityIds.has(c.id));

  const handleJoin = async (community: Community) => {
    if (community.access_type !== "free") {
      setJoinTarget(community);
      return;
    }
    try {
      await joinCommunity.mutateAsync(community.id);
      toast.success(t("community.joined"));
    } catch { toast.error(t("community.joinFailed")); }
  };

  const handlePaidJoin = async () => {
    if (!joinTarget) return;
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("community-checkout", {
        body: {
          communityId: joinTarget.id,
          discountCode: discountInput || undefined,
          returnUrl: `${window.location.origin}/dashboard/client/community/${joinTarget.id}?checkout=success`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err: any) {
      console.error("Community checkout error:", err);
      const msg = err?.message || err?.context?.body?.error || t("community.joinFailed");
      toast.error(msg);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatPrice = (community: Community) => {
    if (community.access_type === "paid" && community.price) return `${community.currency} ${community.price}`;
    if (community.access_type === "subscription" && community.monthly_price) return `${community.currency} ${community.monthly_price}/mo`;
    return null;
  };

  const CommunityCard = ({ community, showJoin = false }: { community: Community; showJoin?: boolean }) => (
    <Card
      className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => !showJoin && navigate(`/dashboard/client/community/${community.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground">{community.name}</h3>
              {community.access_type !== "free" && (
                <Badge variant="secondary" className="text-[10px]"><Crown className="h-3 w-3 mr-1" />{community.access_type === "paid" ? t("community.oneTime") : t("community.subscription")}</Badge>
              )}
              {community.trial_days > 0 && community.access_type === "subscription" && (
                <Badge variant="outline" className="text-[10px]"><Gift className="h-3 w-3 mr-1" />{community.trial_days} {t("community.dayTrial")}</Badge>
              )}
            </div>
            {community.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{community.description}</p>}
          </div>
          {showJoin && (
            <Button size="sm" onClick={(e) => { e.stopPropagation(); handleJoin(community); }} disabled={joinCommunity.isPending}>
              {joinCommunity.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              {community.access_type === "free" ? t("community.join") : formatPrice(community) || t("community.join")}
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{community.member_count} {t("community.members")}</span>
          {!showJoin && formatPrice(community) && <span className="flex items-center gap-1.5 font-medium text-foreground"><Tag className="h-3.5 w-3.5" />{formatPrice(community)}</span>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardSectionHeader title={t("community.title")} description={t("community.clientDescription")} />

        <Tabs defaultValue="my">
          <TabsList>
            <TabsTrigger value="my">{t("community.myCommunities")}</TabsTrigger>
            <TabsTrigger value="discover">{t("community.discover")}</TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-4">
            {myLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : myCommunities.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="py-12 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" /><h3 className="font-semibold">{t("community.noCommunities")}</h3><p className="text-muted-foreground text-sm mt-1">{t("community.discoverHint")}</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{myCommunities.map((c) => <CommunityCard key={c.id} community={c} />)}</div>
            )}
          </TabsContent>

          <TabsContent value="discover" className="mt-4">
            {discoverLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
            ) : availableToJoin.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="py-12 text-center"><p className="text-muted-foreground">{t("community.noNewCommunities")}</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{availableToJoin.map((c) => <CommunityCard key={c.id} community={c} showJoin />)}</div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Paid Join Dialog */}
      <Dialog open={!!joinTarget} onOpenChange={(o) => { if (!o) { setJoinTarget(null); setDiscountInput(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{t("community.joinPaid")}</DialogTitle></DialogHeader>
          {joinTarget && (
            <div className="space-y-4 py-2">
              <div>
                <h3 className="font-semibold">{joinTarget.name}</h3>
                {joinTarget.description && <p className="text-sm text-muted-foreground mt-1">{joinTarget.description}</p>}
              </div>
              <div className="p-4 rounded-xl bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{joinTarget.access_type === "subscription" ? t("community.monthlyPrice") : t("community.price")}</span>
                  <span className="font-semibold">{formatPrice(joinTarget)}</span>
                </div>
                {joinTarget.trial_days > 0 && joinTarget.access_type === "subscription" && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{t("community.freeTrial")}</span>
                    <span>{joinTarget.trial_days} {t("community.days")}</span>
                  </div>
                )}
              </div>
              {joinTarget.discount_code && (
                <div className="space-y-2">
                  <Input placeholder={t("community.enterDiscountCode")} value={discountInput} onChange={(e) => setDiscountInput(e.target.value)} />
                  {discountInput && discountInput.toUpperCase() === joinTarget.discount_code?.toUpperCase() && joinTarget.discount_percent && (
                    <p className="text-xs text-primary">{t("community.discountApplied", { percent: joinTarget.discount_percent })}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setJoinTarget(null); setDiscountInput(""); }}>{t("community.cancel")}</Button>
            <Button onClick={handlePaidJoin} disabled={checkoutLoading}>
              {checkoutLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("community.joinNow")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClientCommunity;
