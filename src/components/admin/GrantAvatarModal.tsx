import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAllAvatars, useGrantAvatar } from "@/hooks/useAdminAvatars";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { RARITY_CONFIG } from "@/lib/avatar-config";
import { Search, Gift, Loader2, Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrantAvatarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  userName: string;
  unlockedAvatarIds: Set<string>;
}

export function GrantAvatarModal({
  open,
  onOpenChange,
  userId,
  userName,
  unlockedAvatarIds,
}: GrantAvatarModalProps) {
  const [selectedAvatarId, setSelectedAvatarId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: avatars, isLoading } = useAllAvatars();
  const grantAvatar = useGrantAvatar();

  const filteredAvatars = useMemo(() => {
    if (!avatars) return [];
    
    return avatars.filter((avatar) => {
      const matchesSearch = avatar.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || avatar.category === category;
      const notUnlocked = !unlockedAvatarIds.has(avatar.id);
      return matchesSearch && matchesCategory && notUnlocked;
    });
  }, [avatars, search, category, unlockedAvatarIds]);

  const selectedAvatar = avatars?.find((a) => a.id === selectedAvatarId);

  const handleGrant = async () => {
    if (!selectedAvatarId) return;

    await grantAvatar.mutateAsync({
      userId,
      avatarId: selectedAvatarId,
      reason: reason || undefined,
    });

    setSelectedAvatarId(null);
    setReason("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedAvatarId(null);
    setReason("");
    setSearch("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Grant Avatar to {userName}
          </DialogTitle>
          <DialogDescription>
            Select an avatar to grant. Only avatars the user doesn't have are shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search avatars..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="free">Free</TabsTrigger>
              <TabsTrigger value="challenge_unlock">Challenge</TabsTrigger>
              <TabsTrigger value="coach_exclusive">Coach</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Avatar Grid */}
          <ScrollArea className="h-[300px] border rounded-lg p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredAvatars.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Lock className="h-8 w-8 mb-2" />
                <p>No avatars available to grant</p>
                <p className="text-sm">User may already have all avatars</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3">
                {filteredAvatars.map((avatar) => {
                  const rarityConfig = RARITY_CONFIG[avatar.rarity as keyof typeof RARITY_CONFIG];
                  const isSelected = selectedAvatarId === avatar.id;

                  return (
                    <button
                      key={avatar.id}
                      onClick={() => setSelectedAvatarId(avatar.id)}
                      className={cn(
                        "relative p-2 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-muted-foreground/30 bg-muted/50"
                      )}
                    >
                      {isSelected && (
                        <div className="absolute top-1 right-1 bg-primary rounded-full p-0.5">
                          <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                      )}
                      <div className="aspect-square rounded-md overflow-hidden mb-2 bg-background">
                        <img
                          src={getAvatarImageUrl(avatar.slug)}
                          alt={avatar.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                      </div>
                      <p className="text-xs font-medium truncate">{avatar.name}</p>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] mt-1", rarityConfig?.color)}
                      >
                        {avatar.rarity}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Selected Avatar Preview */}
          {selectedAvatar && (
            <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <img
                src={getAvatarImageUrl(selectedAvatar.slug)}
                alt={selectedAvatar.name}
                className="h-16 w-16 object-contain rounded-md bg-background"
              />
              <div className="flex-1">
                <p className="font-medium">{selectedAvatar.name}</p>
                <p className="text-sm text-muted-foreground">{selectedAvatar.description}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "mt-1",
                    RARITY_CONFIG[selectedAvatar.rarity as keyof typeof RARITY_CONFIG]?.color
                  )}
                >
                  {selectedAvatar.rarity}
                </Badge>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Why are you granting this avatar? (for audit log)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGrant}
            disabled={!selectedAvatarId || grantAvatar.isPending}
          >
            {grantAvatar.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Grant Avatar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
