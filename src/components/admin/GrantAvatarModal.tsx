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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAllAvatars, useGrantMultipleAvatars } from "@/hooks/useAdminAvatars";
import { getAvatarImageUrl } from "@/hooks/useAvatars";
import { RARITY_CONFIG } from "@/lib/avatar-config";
import { Search, Gift, Loader2, Lock, CheckSquare, Square } from "lucide-react";
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
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Set<string>>(new Set());
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: avatars, isLoading } = useAllAvatars();
  const grantAvatars = useGrantMultipleAvatars();

  const filteredAvatars = useMemo(() => {
    if (!avatars) return [];
    
    return avatars.filter((avatar) => {
      const matchesSearch = avatar.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" || avatar.category === category;
      const notUnlocked = !unlockedAvatarIds.has(avatar.id);
      return matchesSearch && matchesCategory && notUnlocked;
    });
  }, [avatars, search, category, unlockedAvatarIds]);

  const selectedAvatars = useMemo(() => {
    return avatars?.filter((a) => selectedAvatarIds.has(a.id)) || [];
  }, [avatars, selectedAvatarIds]);

  const toggleAvatar = (avatarId: string) => {
    setSelectedAvatarIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(avatarId)) {
        newSet.delete(avatarId);
      } else {
        newSet.add(avatarId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedAvatarIds(new Set(filteredAvatars.map(a => a.id)));
  };

  const clearAll = () => {
    setSelectedAvatarIds(new Set());
  };

  const handleGrant = async () => {
    if (selectedAvatarIds.size === 0) return;

    await grantAvatars.mutateAsync({
      userId,
      avatarIds: Array.from(selectedAvatarIds),
      reason: reason || undefined,
    });

    setSelectedAvatarIds(new Set());
    setReason("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedAvatarIds(new Set());
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
            Grant Avatars to {userName}
          </DialogTitle>
          <DialogDescription>
            Select one or more avatars to grant. Only avatars the user doesn't have are shown.
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

          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll} disabled={filteredAvatars.length === 0}>
                <CheckSquare className="h-4 w-4 mr-1" /> Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearAll} disabled={selectedAvatarIds.size === 0}>
                <Square className="h-4 w-4 mr-1" /> Clear All
              </Button>
            </div>
            {selectedAvatarIds.size > 0 && (
              <Badge variant="secondary">{selectedAvatarIds.size} selected</Badge>
            )}
          </div>

          {/* Avatar Grid */}
          <ScrollArea className="h-[280px] border rounded-lg p-2">
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
                  const isSelected = selectedAvatarIds.has(avatar.id);

                  return (
                    <button
                      key={avatar.id}
                      onClick={() => toggleAvatar(avatar.id)}
                      className={cn(
                        "relative p-2 rounded-lg border-2 transition-all text-left",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-transparent hover:border-muted-foreground/30 bg-muted/50"
                      )}
                    >
                      <div className="absolute top-1 right-1">
                        <Checkbox checked={isSelected} className="pointer-events-none" />
                      </div>
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

          {/* Selected Avatars Preview */}
          {selectedAvatars.length > 0 && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Selected ({selectedAvatars.length}):</p>
              <div className="flex flex-wrap gap-2">
                {selectedAvatars.slice(0, 6).map((avatar) => (
                  <Badge key={avatar.id} variant="secondary" className="gap-1">
                    <img
                      src={getAvatarImageUrl(avatar.slug)}
                      alt={avatar.name}
                      className="h-4 w-4 rounded"
                    />
                    {avatar.name}
                  </Badge>
                ))}
                {selectedAvatars.length > 6 && (
                  <Badge variant="outline">+{selectedAvatars.length - 6} more</Badge>
                )}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Why are you granting these avatars? (for audit log)"
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
            disabled={selectedAvatarIds.size === 0 || grantAvatars.isPending}
          >
            {grantAvatars.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Grant {selectedAvatarIds.size > 0 ? `${selectedAvatarIds.size} Avatar${selectedAvatarIds.size > 1 ? 's' : ''}` : 'Avatar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
