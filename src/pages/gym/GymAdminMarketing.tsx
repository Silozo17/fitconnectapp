import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useCampaigns, usePromotions, useCampaignMutations, usePromotionMutations } from "@/hooks/gym/useGymMarketing";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Megaphone, 
  Tag, 
  Mail, 
  MessageSquare,
  Bell,
  Edit,
  Trash2,
  Calendar,
  Users,
  Percent,
  Copy
} from "lucide-react";
import { format } from "date-fns";

const CAMPAIGN_TYPES = [
  { value: "email", label: "Email", icon: Mail },
  { value: "sms", label: "SMS", icon: MessageSquare },
  { value: "push", label: "Push Notification", icon: Bell },
];

const AUDIENCE_TYPES = [
  { value: "all_members", label: "All Members" },
  { value: "active", label: "Active Members" },
  { value: "inactive", label: "Inactive Members" },
  { value: "leads", label: "Leads" },
];

const PROMOTION_TYPES = [
  { value: "percentage", label: "Percentage Discount" },
  { value: "fixed", label: "Fixed Amount" },
  { value: "free_trial", label: "Free Trial" },
];

export default function GymAdminMarketing() {
  const { gymId } = useParams();
  const { gym } = useGym();
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editingPromotion, setEditingPromotion] = useState<any>(null);

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(gymId);
  const { data: promotions = [], isLoading: promotionsLoading } = usePromotions(gymId);
  const { createCampaign, updateCampaign, deleteCampaign } = useCampaignMutations(gymId);
  const { createPromotion, updatePromotion, deletePromotion } = usePromotionMutations(gymId);

  // Campaign form state
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    description: "",
    campaign_type: "email",
    target_audience: "all_members",
    subject: "",
    body: "",
  });

  // Promotion form state
  const [promotionForm, setPromotionForm] = useState({
    name: "",
    description: "",
    promotion_type: "percentage",
    discount_value: "",
    promo_code: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: "",
    max_redemptions: "",
    is_active: true,
    terms_conditions: "",
  });

  const handleOpenCampaignDialog = (campaign?: any) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name,
        description: campaign.description || "",
        campaign_type: campaign.campaign_type,
        target_audience: campaign.target_audience,
        subject: campaign.content?.subject || "",
        body: campaign.content?.body || "",
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({
        name: "",
        description: "",
        campaign_type: "email",
        target_audience: "all_members",
        subject: "",
        body: "",
      });
    }
    setIsCampaignDialogOpen(true);
  };

  const handleOpenPromotionDialog = (promotion?: any) => {
    if (promotion) {
      setEditingPromotion(promotion);
      setPromotionForm({
        name: promotion.name,
        description: promotion.description || "",
        promotion_type: promotion.promotion_type,
        discount_value: promotion.discount_value?.toString() || "",
        promo_code: promotion.promo_code || "",
        start_date: promotion.start_date,
        end_date: promotion.end_date || "",
        max_redemptions: promotion.max_redemptions?.toString() || "",
        is_active: promotion.is_active,
        terms_conditions: promotion.terms_conditions || "",
      });
    } else {
      setEditingPromotion(null);
      setPromotionForm({
        name: "",
        description: "",
        promotion_type: "percentage",
        discount_value: "",
        promo_code: "",
        start_date: format(new Date(), "yyyy-MM-dd"),
        end_date: "",
        max_redemptions: "",
        is_active: true,
        terms_conditions: "",
      });
    }
    setIsPromotionDialogOpen(true);
  };

  const handleSaveCampaign = async () => {
    if (!gymId) return;

    const payload = {
      gym_id: gymId,
      name: campaignForm.name,
      description: campaignForm.description || null,
      campaign_type: campaignForm.campaign_type,
      target_audience: campaignForm.target_audience,
      content: {
        subject: campaignForm.subject,
        body: campaignForm.body,
      },
      status: "draft",
      scheduled_at: null,
      sent_at: null,
      completed_at: null,
      audience_filter: null,
      created_by: null,
    };

    if (editingCampaign) {
      await updateCampaign.mutateAsync({ id: editingCampaign.id, ...payload });
    } else {
      await createCampaign.mutateAsync(payload);
    }

    setIsCampaignDialogOpen(false);
  };

  const handleSavePromotion = async () => {
    if (!gymId) return;

    const payload = {
      gym_id: gymId,
      name: promotionForm.name,
      description: promotionForm.description || null,
      promotion_type: promotionForm.promotion_type,
      discount_value: promotionForm.discount_value ? parseFloat(promotionForm.discount_value) : null,
      promo_code: promotionForm.promo_code || null,
      start_date: promotionForm.start_date,
      end_date: promotionForm.end_date || null,
      max_redemptions: promotionForm.max_redemptions ? parseInt(promotionForm.max_redemptions) : null,
      is_active: promotionForm.is_active,
      terms_conditions: promotionForm.terms_conditions || null,
      applicable_plans: null,
    };

    if (editingPromotion) {
      await updatePromotion.mutateAsync({ id: editingPromotion.id, ...payload });
    } else {
      await createPromotion.mutateAsync(payload);
    }

    setIsPromotionDialogOpen(false);
  };

  const handleDeleteCampaign = async (id: string) => {
    if (confirm("Delete this campaign?")) {
      await deleteCampaign.mutateAsync(id);
    }
  };

  const handleDeletePromotion = async (id: string) => {
    if (confirm("Delete this promotion?")) {
      await deletePromotion.mutateAsync(id);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const getCampaignStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      scheduled: "bg-blue-500/10 text-blue-600",
      active: "bg-green-500/10 text-green-600",
      completed: "bg-primary/10 text-primary",
      cancelled: "bg-destructive/10 text-destructive",
    };
    return <Badge className={styles[status] || ""}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketing</h1>
        <p className="text-muted-foreground">Create campaigns and promotions to grow your gym</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-sm text-muted-foreground">Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Tag className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{promotions.filter(p => p.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Promos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0)}
                </p>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Percent className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {promotions.reduce((sum, p) => sum + p.current_redemptions, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Redemptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenCampaignDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </div>

          {campaignsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No campaigns yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create email, SMS, or push notification campaigns
                </p>
                <Button onClick={() => handleOpenCampaignDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          {CAMPAIGN_TYPES.find(t => t.value === campaign.campaign_type)?.label}
                          <span>•</span>
                          {AUDIENCE_TYPES.find(a => a.value === campaign.target_audience)?.label}
                        </CardDescription>
                      </div>
                      {getCampaignStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span>Sent: {campaign.stats?.sent || 0}</span>
                      <span>Opened: {campaign.stats?.opened || 0}</span>
                      <span>Clicked: {campaign.stats?.clicked || 0}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCampaignDialog(campaign)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Promotions Tab */}
        <TabsContent value="promotions" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => handleOpenPromotionDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              New Promotion
            </Button>
          </div>

          {promotionsLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading promotions...</div>
          ) : promotions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">No promotions yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create discounts and promo codes for new members
                </p>
                <Button onClick={() => handleOpenPromotionDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Promotion
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {promotions.map((promo) => (
                <Card key={promo.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{promo.name}</CardTitle>
                      <Badge variant={promo.is_active ? "default" : "secondary"}>
                        {promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {promo.promotion_type === "percentage"
                          ? `${promo.discount_value}% off`
                          : promo.promotion_type === "fixed"
                          ? `£${promo.discount_value} off`
                          : "Free Trial"}
                      </span>
                    </div>
                    {promo.promo_code && (
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {promo.promo_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyPromoCode(promo.promo_code!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(promo.start_date), "MMM d")}
                      {promo.end_date && ` - ${format(new Date(promo.end_date), "MMM d")}`}
                    </div>
                    {promo.max_redemptions && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {promo.current_redemptions} / {promo.max_redemptions} used
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenPromotionDialog(promo)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePromotion(promo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Dialog */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? "Edit Campaign" : "Create Campaign"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Campaign Name</Label>
              <Input
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                placeholder="e.g., New Year Special"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={campaignForm.campaign_type}
                  onValueChange={(v) => setCampaignForm({ ...campaignForm, campaign_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Audience</Label>
                <Select
                  value={campaignForm.target_audience}
                  onValueChange={(v) => setCampaignForm({ ...campaignForm, target_audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_TYPES.map((a) => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                placeholder="Email subject line"
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={campaignForm.body}
                onChange={(e) => setCampaignForm({ ...campaignForm, body: e.target.value })}
                placeholder="Write your message..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCampaignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCampaign}
              disabled={!campaignForm.name || createCampaign.isPending || updateCampaign.isPending}
            >
              {editingCampaign ? "Update" : "Create"} Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotion Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? "Edit Promotion" : "Create Promotion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Promotion Name</Label>
              <Input
                value={promotionForm.name}
                onChange={(e) => setPromotionForm({ ...promotionForm, name: e.target.value })}
                placeholder="e.g., Summer Sale"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={promotionForm.promotion_type}
                  onValueChange={(v) => setPromotionForm({ ...promotionForm, promotion_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMOTION_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {promotionForm.promotion_type === "percentage" ? "Discount %" : "Amount (£)"}
                </Label>
                <Input
                  type="number"
                  value={promotionForm.discount_value}
                  onChange={(e) => setPromotionForm({ ...promotionForm, discount_value: e.target.value })}
                  placeholder={promotionForm.promotion_type === "percentage" ? "e.g., 20" : "e.g., 10"}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Promo Code (optional)</Label>
              <Input
                value={promotionForm.promo_code}
                onChange={(e) => setPromotionForm({ ...promotionForm, promo_code: e.target.value.toUpperCase() })}
                placeholder="e.g., SUMMER2024"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={promotionForm.start_date}
                  onChange={(e) => setPromotionForm({ ...promotionForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Date (optional)</Label>
                <Input
                  type="date"
                  value={promotionForm.end_date}
                  onChange={(e) => setPromotionForm({ ...promotionForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Max Redemptions (optional)</Label>
              <Input
                type="number"
                value={promotionForm.max_redemptions}
                onChange={(e) => setPromotionForm({ ...promotionForm, max_redemptions: e.target.value })}
                placeholder="Leave empty for unlimited"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={promotionForm.is_active}
                onCheckedChange={(c) => setPromotionForm({ ...promotionForm, is_active: c })}
              />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromotionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSavePromotion}
              disabled={!promotionForm.name || createPromotion.isPending || updatePromotion.isPending}
            >
              {editingPromotion ? "Update" : "Create"} Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
