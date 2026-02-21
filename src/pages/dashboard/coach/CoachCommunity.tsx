import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Loader2, Trash2, Crown, Tag } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { DashboardSectionHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCoachCommunities, useCreateCommunity, useDeleteCommunity } from "@/hooks/useCommunity";
import { useCoachProfileId } from "@/hooks/useCoachProfileId";
import { useTranslation } from "@/hooks/useTranslation";
import { toast } from "sonner";

const CoachCommunity = () => {
  const { t } = useTranslation("coach");
  const navigate = useNavigate();
  const { data: coachProfileId } = useCoachProfileId();
  const { data: communities = [], isLoading } = useCoachCommunities();
  const createCommunity = useCreateCommunity();
  const deleteCommunity = useDeleteCommunity();

  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [accessType, setAccessType] = useState<"free" | "paid" | "subscription">("free");
  const [price, setPrice] = useState("");
  const [monthlyPrice, setMonthlyPrice] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [trialDays, setTrialDays] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxMembers, setMaxMembers] = useState("");

  const resetForm = () => {
    setName(""); setDescription(""); setIsPublic(true); setAccessType("free");
    setPrice(""); setMonthlyPrice(""); setCurrency("GBP"); setTrialDays("");
    setDiscountCode(""); setDiscountPercent(""); setMaxMembers("");
  };

  const handleCreate = async () => {
    if (!name.trim() || !coachProfileId) return;
    try {
      await createCommunity.mutateAsync({
        coach_id: coachProfileId,
        name: name.trim(),
        description: description.trim() || undefined,
        is_public: isPublic,
        access_type: accessType,
        price: accessType === "paid" && price ? parseFloat(price) : undefined,
        monthly_price: accessType === "subscription" && monthlyPrice ? parseFloat(monthlyPrice) : undefined,
        currency,
        trial_days: accessType === "subscription" && trialDays ? parseInt(trialDays) : undefined,
        discount_code: discountCode.trim() || undefined,
        discount_percent: discountPercent ? parseInt(discountPercent) : undefined,
        max_members: maxMembers ? parseInt(maxMembers) : undefined,
      } as any);
      toast.success(t("community.created"));
      setShowCreate(false);
      resetForm();
    } catch { toast.error(t("community.createFailed")); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCommunity.mutateAsync(deleteId);
      toast.success(t("community.deleted"));
    } catch { toast.error(t("community.deleteFailed")); }
    setDeleteId(null);
  };

  const formatPrice = (community: any) => {
    if (community.access_type === "paid" && community.price) return `${community.currency} ${community.price}`;
    if (community.access_type === "subscription" && community.monthly_price) return `${community.currency} ${community.monthly_price}/mo`;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardSectionHeader
          title={t("community.title")}
          description={t("community.description")}
          action={<Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />{t("community.createCommunity")}</Button>}
        />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
        ) : communities.length === 0 ? (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold text-lg">{t("community.noCommunities")}</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-md">{t("community.noCommunitiesDesc")}</p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 mr-2" />{t("community.createFirst")}</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Card key={community.id} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/dashboard/coach/community/${community.id}`)}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground">{community.name}</h3>
                        <Badge variant={community.is_active ? "default" : "secondary"} className="rounded-full text-xs">{community.is_active ? t("community.active") : t("community.inactive")}</Badge>
                        {community.is_public && <Badge variant="outline" className="rounded-full text-xs">{t("community.public")}</Badge>}
                        {community.access_type !== "free" && (
                          <Badge variant="secondary" className="rounded-full text-xs"><Crown className="h-3 w-3 mr-1" />{community.access_type === "paid" ? t("community.oneTime") : t("community.subscription")}</Badge>
                        )}
                      </div>
                      {community.description && <p className="text-sm text-muted-foreground line-clamp-2">{community.description}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0" onClick={(e) => { e.stopPropagation(); setDeleteId(community.id); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{community.member_count} {t("community.members")}</span>
                    {formatPrice(community) && <span className="flex items-center gap-1.5 font-medium text-foreground"><Tag className="h-3.5 w-3.5" />{formatPrice(community)}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => { setShowCreate(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{t("community.createCommunity")}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t("community.communityName")}</Label>
              <Input placeholder={t("community.namePlaceholder")} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t("community.communityDescription")}</Label>
              <Textarea placeholder={t("community.descriptionPlaceholder")} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>{t("community.public")}</Label><p className="text-xs text-muted-foreground">{t("community.publicDesc")}</p></div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>

            {/* Pricing Section */}
            <div className="border-t border-border/50 pt-4 space-y-4">
              <h3 className="font-semibold text-sm">{t("community.pricing")}</h3>
              <div className="space-y-2">
                <Label>{t("community.accessType")}</Label>
                <Select value={accessType} onValueChange={(v: any) => setAccessType(v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">{t("community.free")}</SelectItem>
                    <SelectItem value="paid">{t("community.oneTimePayment")}</SelectItem>
                    <SelectItem value="subscription">{t("community.monthlySubscription")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {accessType === "paid" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>{t("community.price")}</Label>
                    <Input type="number" min="0" step="0.01" placeholder="29.99" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("community.currency")}</Label>
                    <Select value={currency} onValueChange={setCurrency}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="PLN">PLN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {accessType === "subscription" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("community.monthlyPrice")}</Label>
                      <Input type="number" min="0" step="0.01" placeholder="9.99" value={monthlyPrice} onChange={(e) => setMonthlyPrice(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("community.currency")}</Label>
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="PLN">PLN</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("community.trialDays")}</Label>
                    <Input type="number" min="0" placeholder="7" value={trialDays} onChange={(e) => setTrialDays(e.target.value)} />
                  </div>
                </>
              )}

              {accessType !== "free" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>{t("community.discountCode")}</Label>
                      <Input placeholder="LAUNCH20" value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("community.discountPercent")}</Label>
                      <Input type="number" min="0" max="100" placeholder="20" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>{t("community.maxMembers")}</Label>
                <Input type="number" min="0" placeholder={t("community.unlimited")} value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>{t("community.cancel")}</Button>
            <Button onClick={handleCreate} disabled={createCommunity.isPending || !name.trim()}>
              {createCommunity.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("community.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("community.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("community.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("community.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("community.delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default CoachCommunity;
