import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  Save,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";

interface ShowcaseItem {
  id: string;
  clientId: string;
  clientName: string;
  displayName: string;
  beforePhoto: string | null;
  afterPhoto: string | null;
  stats: {
    weightLost?: string;
    duration?: string;
    bodyFatChange?: string;
  };
  testimonial?: string;
  isPublished: boolean;
  position: number;
}

// Mock data - in production, this would come from a hook
const mockShowcases: ShowcaseItem[] = [
  {
    id: "1",
    clientId: "c1",
    clientName: "John Smith",
    displayName: "John S.",
    beforePhoto: null,
    afterPhoto: null,
    stats: { weightLost: "-15 kg", duration: "12 weeks", bodyFatChange: "-8%" },
    testimonial: "Working with this coach changed my life!",
    isPublished: true,
    position: 1,
  },
  {
    id: "2",
    clientId: "c2",
    clientName: "Sarah Johnson",
    displayName: "Anonymous",
    beforePhoto: null,
    afterPhoto: null,
    stats: { weightLost: "-8 kg", duration: "8 weeks" },
    isPublished: false,
    position: 2,
  },
];

const mockEligibleClients = [
  { id: "c3", name: "Mike Wilson", hasConsent: true },
  { id: "c4", name: "Emma Davis", hasConsent: true },
];

export default function CoachOutcomeShowcase() {
  const { t } = useTranslation();
  const [showcases, setShowcases] = useState<ShowcaseItem[]>(mockShowcases);
  const [editingItem, setEditingItem] = useState<ShowcaseItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const handleTogglePublish = (id: string) => {
    setShowcases((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isPublished: !item.isPublished } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setShowcases((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddShowcase = () => {
    if (!selectedClient) return;
    const client = mockEligibleClients.find((c) => c.id === selectedClient);
    if (!client) return;

    const newItem: ShowcaseItem = {
      id: Date.now().toString(),
      clientId: client.id,
      clientName: client.name,
      displayName: client.name.split(" ")[0],
      beforePhoto: null,
      afterPhoto: null,
      stats: {},
      isPublished: false,
      position: showcases.length + 1,
    };

    setShowcases((prev) => [...prev, newItem]);
    setIsAddModalOpen(false);
    setSelectedClient("");
  };

  const publishedCount = showcases.filter((s) => s.isPublished).length;

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
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t("showcase.addShowcase", "Add Showcase")}
          </Button>
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
              <p className="text-2xl font-bold text-foreground">{mockEligibleClients.length}</p>
              <p className="text-xs text-muted-foreground">{t("showcase.eligible", "Eligible Clients")}</p>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">324</p>
              <p className="text-xs text-muted-foreground">{t("showcase.views", "Total Views")}</p>
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
                  {item.beforePhoto && item.afterPhoto ? (
                    <div className="flex w-full h-full">
                      <div className="flex-1 bg-muted" />
                      <div className="flex-1 bg-muted" />
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("showcase.noPhotos", "No photos")}</p>
                    </div>
                  )}

                  {/* Publish Badge */}
                  <Badge
                    variant={item.isPublished ? "default" : "secondary"}
                    className="absolute top-2 right-2"
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

                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.displayName}</h3>
                      <p className="text-xs text-muted-foreground">{item.clientName}</p>
                    </div>
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                  </div>

                  {/* Stats */}
                  {Object.keys(item.stats).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.stats.weightLost && (
                        <Badge variant="outline" className="text-xs">{item.stats.weightLost}</Badge>
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
                        onCheckedChange={() => handleTogglePublish(item.id)}
                        aria-label={t("showcase.togglePublish", "Toggle publish")}
                      />
                      <Label className="text-xs text-muted-foreground">
                        {item.isPublished ? t("showcase.published", "Published") : t("showcase.unpublished", "Unpublished")}
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingItem(item)}
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
                    {mockEligibleClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {client.name}
                          {client.hasConsent && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {t("showcase.hasConsent", "Consent given")}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {mockEligibleClients.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  {t("showcase.noEligible", "No clients with consent available. Request consent from clients first.")}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button onClick={handleAddShowcase} disabled={!selectedClient}>
                {t("showcase.add", "Add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}