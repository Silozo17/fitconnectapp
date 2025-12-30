import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  Trash2,
  Edit3,
  Users,
  Image as ImageIcon,
  ExternalLink,
  AlertTriangle,
  Loader2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  useMyShowcaseItems,
  useEligibleClients,
  useCreateShowcase,
  useUpdateShowcase,
  useDeleteShowcase,
  useCreateExternalShowcase,
  useRequestShowcaseConsent,
  OutcomeShowcase,
  ConsentStatus,
} from "@/hooks/useOutcomeShowcase";

export default function CoachOutcomeShowcase() {
  const { t } = useTranslation();
  const { data: showcases = [], isLoading: showcasesLoading } = useMyShowcaseItems();
  const { data: eligibleClients = [], isLoading: clientsLoading } = useEligibleClients();
  const createShowcase = useCreateShowcase();
  const updateShowcase = useUpdateShowcase();
  const deleteShowcase = useDeleteShowcase();
  const createExternalShowcase = useCreateExternalShowcase();
  const requestConsent = useRequestShowcaseConsent();

  const [editingItem, setEditingItem] = useState<OutcomeShowcase | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: "",
    title: "",
    description: "",
    weightLost: "",
    duration: "",
    bodyFatChange: "",
    isAnonymized: false,
  });

  // External form state
  const [externalForm, setExternalForm] = useState({
    clientName: "",
    displayName: "",
    description: "",
    weightLost: "",
    duration: "",
    bodyFatChange: "",
    consentAcknowledged: false,
  });

  const handleTogglePublish = (item: OutcomeShowcase) => {
    // Only allow publishing if consent is granted or it's external
    if (!item.isExternal && item.consentStatus !== "granted") {
      return;
    }
    updateShowcase.mutate({
      showcaseId: item.id,
      isPublished: !item.isPublished,
    });
  };

  const handleDelete = (id: string) => {
    deleteShowcase.mutate(id);
  };

  const handleRequestConsent = (item: OutcomeShowcase) => {
    requestConsent.mutate({
      showcaseId: item.id,
      clientId: item.clientId,
    });
  };

  const getConsentStatusBadge = (status: ConsentStatus, isExternal: boolean) => {
    if (isExternal) return null;
    
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Consent Pending
          </Badge>
        );
      case "requested":
        return (
          <Badge variant="secondary" className="text-xs">
            <Send className="w-3 h-3 mr-1" />
            Request Sent
          </Badge>
        );
      case "granted":
        return (
          <Badge variant="default" className="text-xs bg-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Consent Granted
          </Badge>
        );
      case "denied":
        return (
          <Badge variant="destructive" className="text-xs">
            <XCircle className="w-3 h-3 mr-1" />
            Denied
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleAddShowcase = () => {
    if (!selectedClient) return;
    const client = eligibleClients.find((c) => c.clientId === selectedClient);
    if (!client) return;

    createShowcase.mutate({
      clientId: client.clientId,
      consentId: client.consent?.id,
      displayName: client.clientName.split(" ")[0],
      stats: client.progressStats ? {
        weightChange: client.progressStats.weightChange,
        duration: client.progressStats.startDate && client.progressStats.latestDate
          ? `${Math.round((client.progressStats.latestDate.getTime() - client.progressStats.startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))} weeks`
          : undefined,
      } : undefined,
    }, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        setSelectedClient("");
      },
    });
  };

  const handleOpenEdit = (item: OutcomeShowcase) => {
    setEditingItem(item);
    setEditForm({
      displayName: item.displayName || "",
      title: item.title || "",
      description: item.description || "",
      weightLost: item.stats?.weightLost || item.stats?.weightChange ? `${item.stats.weightChange || item.stats.weightLost}` : "",
      duration: item.stats?.duration || "",
      bodyFatChange: item.stats?.bodyFatChange || "",
      isAnonymized: item.isAnonymized,
    });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    updateShowcase.mutate({
      showcaseId: editingItem.id,
      displayName: editForm.displayName || null,
      title: editForm.title || null,
      description: editForm.description || null,
      stats: {
        weightLost: editForm.weightLost || null,
        duration: editForm.duration || null,
        bodyFatChange: editForm.bodyFatChange || null,
      },
      isAnonymized: editForm.isAnonymized,
    }, {
      onSuccess: () => {
        setEditingItem(null);
      },
    });
  };

  const handleAddExternal = () => {
    if (!externalForm.clientName || !externalForm.consentAcknowledged) return;

    createExternalShowcase.mutate({
      externalClientName: externalForm.clientName,
      displayName: externalForm.displayName || externalForm.clientName.split(" ")[0],
      description: externalForm.description || undefined,
      stats: {
        weightLost: externalForm.weightLost || null,
        duration: externalForm.duration || null,
        bodyFatChange: externalForm.bodyFatChange || null,
      },
    }, {
      onSuccess: () => {
        setIsExternalModalOpen(false);
        setExternalForm({
          clientName: "",
          displayName: "",
          description: "",
          weightLost: "",
          duration: "",
          bodyFatChange: "",
          consentAcknowledged: false,
        });
      },
    });
  };

  const publishedCount = showcases.filter((s) => s.isPublished).length;
  const isLoading = showcasesLoading || clientsLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              {t("showcase.title", "Client Transformations")}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t("showcase.subtitle", "Showcase your clients' success stories")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsExternalModalOpen(true)}>
              <ExternalLink className="w-4 h-4 mr-2" />
              {t("showcase.addExternal", "Add External")}
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {t("showcase.addShowcase", "Add Showcase")}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{showcases.length}</p>
              <p className="text-xs text-muted-foreground">{t("showcase.totalShowcases", "Total Showcases")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">{t("showcase.published", "Published")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{eligibleClients.length}</p>
              <p className="text-xs text-muted-foreground">{t("showcase.eligible", "Eligible Clients")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{showcases.filter(s => s.isExternal).length}</p>
              <p className="text-xs text-muted-foreground">{t("showcase.external", "External")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Showcases List */}
        {showcases.length === 0 ? (
          <EmptyState
            icon={Camera}
            title={t("showcase.emptyTitle", "No Showcases Yet")}
            description={t("showcase.emptyDesc", "Add client transformations to showcase your success stories")}
            action={{
              label: t("showcase.addFirst", "Add First Showcase"),
              onClick: () => setIsAddModalOpen(true),
              icon: Plus,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {showcases.map((item) => (
              <Card key={item.id} variant="glass" className="overflow-hidden">
                {/* Photo Section */}
                <div className="relative aspect-[16/9] bg-secondary/50 flex items-center justify-center">
                  {item.beforePhotoUrl && item.afterPhotoUrl ? (
                    <div className="flex w-full h-full">
                      <img src={item.beforePhotoUrl} alt="Before" className="flex-1 object-cover" />
                      <img src={item.afterPhotoUrl} alt="After" className="flex-1 object-cover" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("showcase.noPhotos", "No photos")}</p>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.isExternal && (
                      <Badge variant="outline" className="bg-background/80">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        {t("showcase.external", "External")}
                      </Badge>
                    )}
                    <Badge
                      variant={item.isPublished ? "default" : "secondary"}
                    >
                      {item.isPublished ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          {t("showcase.live", "Live")}
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          {t("showcase.draft", "Draft")}
                        </>
                      )}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        {item.displayName || (item.isExternal ? item.externalClientName : "Client")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {item.isExternal ? item.externalClientName : item.title || t("showcase.platformClient", "Platform Client")}
                      </p>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>

                  {/* Consent Status */}
                  {!item.isExternal && (
                    <div className="flex items-center gap-2">
                      {getConsentStatusBadge(item.consentStatus, item.isExternal)}
                      {item.consentStatus === "pending" && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => handleRequestConsent(item)}
                          disabled={requestConsent.isPending}
                        >
                          {requestConsent.isPending ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3 mr-1" />
                          )}
                          Request Consent
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  {item.stats && Object.keys(item.stats).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(item.stats.weightLost || item.stats.weightChange) && (
                        <Badge variant="outline" className="text-xs">
                          {item.stats.weightLost || `${item.stats.weightChange > 0 ? '+' : ''}${item.stats.weightChange} kg`}
                        </Badge>
                      )}
                      {item.stats.duration && (
                        <Badge variant="outline" className="text-xs">{item.stats.duration}</Badge>
                      )}
                      {item.stats.bodyFatChange && (
                        <Badge variant="outline" className="text-xs">{item.stats.bodyFatChange}</Badge>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.isPublished}
                        onCheckedChange={() => handleTogglePublish(item)}
                        disabled={!item.isExternal && item.consentStatus !== "granted"}
                        aria-label={t("showcase.togglePublish", "Toggle publish")}
                      />
                      <Label className="text-xs text-muted-foreground">
                        {item.isPublished 
                          ? t("showcase.published", "Published") 
                          : (!item.isExternal && item.consentStatus !== "granted")
                            ? t("showcase.awaitingConsent", "Awaiting consent")
                            : t("showcase.unpublished", "Unpublished")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Showcase Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("showcase.addShowcase", "Add Showcase")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("showcase.selectClient", "Select Client")}</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("showcase.chooseClient", "Choose a client...")} />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleClients.map((client) => (
                      <SelectItem key={client.clientId} value={client.clientId}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {client.clientName}
                          {client.consent ? (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {t("showcase.hasConsent", "Consent given")}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs ml-2">
                              {t("showcase.consentPending", "Consent pending")}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button 
                onClick={handleAddShowcase} 
                disabled={!selectedClient || createShowcase.isPending}
              >
                {createShowcase.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("showcase.add", "Add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Showcase Modal */}
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("showcase.editShowcase", "Edit Transformation")}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("showcase.displayName", "Display Name")}</Label>
                <Input
                  value={editForm.displayName}
                  onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                  placeholder={t("showcase.displayNamePlaceholder", "e.g., John S.")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("showcase.title", "Title")}</Label>
                <Input
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder={t("showcase.titlePlaceholder", "e.g., 12-Week Transformation")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("showcase.description", "Description / Testimonial")}</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder={t("showcase.descriptionPlaceholder", "Client testimonial or description...")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>{t("showcase.weightLost", "Weight Lost")}</Label>
                  <Input
                    value={editForm.weightLost}
                    onChange={(e) => setEditForm({ ...editForm, weightLost: e.target.value })}
                    placeholder="-15 kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("showcase.duration", "Duration")}</Label>
                  <Input
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="12 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("showcase.bodyFat", "Body Fat")}</Label>
                  <Input
                    value={editForm.bodyFatChange}
                    onChange={(e) => setEditForm({ ...editForm, bodyFatChange: e.target.value })}
                    placeholder="-8%"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="anonymize"
                  checked={editForm.isAnonymized}
                  onCheckedChange={(checked) => setEditForm({ ...editForm, isAnonymized: checked })}
                />
                <Label htmlFor="anonymize" className="text-sm">
                  {t("showcase.anonymize", "Anonymize client identity")}
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingItem(null)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleSaveEdit} disabled={updateShowcase.isPending}>
                {updateShowcase.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("common.save", "Save Changes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* External Transformation Modal */}
        <Dialog open={isExternalModalOpen} onOpenChange={setIsExternalModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("showcase.addExternal", "Add External Transformation")}</DialogTitle>
              <DialogDescription>
                {t("showcase.externalDesc", "Add a transformation for a client not on the platform.")}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t("showcase.clientName", "Client Name")} *</Label>
                <Input
                  value={externalForm.clientName}
                  onChange={(e) => setExternalForm({ ...externalForm, clientName: e.target.value })}
                  placeholder={t("showcase.clientNamePlaceholder", "Full name")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("showcase.displayName", "Display Name")}</Label>
                <Input
                  value={externalForm.displayName}
                  onChange={(e) => setExternalForm({ ...externalForm, displayName: e.target.value })}
                  placeholder={t("showcase.displayNamePlaceholder", "e.g., John S.")}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("showcase.description", "Description / Testimonial")}</Label>
                <Textarea
                  value={externalForm.description}
                  onChange={(e) => setExternalForm({ ...externalForm, description: e.target.value })}
                  placeholder={t("showcase.descriptionPlaceholder", "Client testimonial or description...")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>{t("showcase.weightLost", "Weight Lost")}</Label>
                  <Input
                    value={externalForm.weightLost}
                    onChange={(e) => setExternalForm({ ...externalForm, weightLost: e.target.value })}
                    placeholder="-15 kg"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("showcase.duration", "Duration")}</Label>
                  <Input
                    value={externalForm.duration}
                    onChange={(e) => setExternalForm({ ...externalForm, duration: e.target.value })}
                    placeholder="12 weeks"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("showcase.bodyFat", "Body Fat")}</Label>
                  <Input
                    value={externalForm.bodyFatChange}
                    onChange={(e) => setExternalForm({ ...externalForm, bodyFatChange: e.target.value })}
                    placeholder="-8%"
                  />
                </div>
              </div>

              {/* Consent Disclaimer */}
              <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 space-y-3">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      {t("showcase.consentTitle", "Consent Acknowledgement Required")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("showcase.consentDisclaimer", "I confirm that I have obtained explicit written consent from this individual to use their transformation data and photos on FitConnect. I understand that FitConnect is not responsible for any claims arising from the use of transformation content without proper consent. I accept full responsibility for ensuring compliance with data protection regulations.")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-7">
                  <Checkbox
                    id="consent-acknowledge"
                    checked={externalForm.consentAcknowledged}
                    onCheckedChange={(checked) => 
                      setExternalForm({ ...externalForm, consentAcknowledged: checked === true })
                    }
                  />
                  <Label htmlFor="consent-acknowledge" className="text-sm cursor-pointer">
                    {t("showcase.acknowledgeConsent", "I acknowledge and accept responsibility")}
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExternalModalOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                onClick={handleAddExternal}
                disabled={!externalForm.clientName || !externalForm.consentAcknowledged || createExternalShowcase.isPending}
              >
                {createExternalShowcase.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t("showcase.addTransformation", "Add Transformation")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
