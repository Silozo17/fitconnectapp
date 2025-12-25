import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, AtSign, MapPin, Loader2 } from "lucide-react";
import { useConnections, SearchResult } from "@/hooks/useConnections";
import { getDisplayLocation } from "@/lib/location-utils";

interface AddConnectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddConnectionModal = ({
  open,
  onOpenChange,
}: AddConnectionModalProps) => {
  const { searchUsers, sendConnectionRequest } = useConnections();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setSearching(false);
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;

    setSending(true);
    const success = await sendConnectionRequest(
      selectedUser.user_id,
      selectedUser.primary_profile_type, // Use primary profile type for connection
      message || undefined,
      {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        display_name: selectedUser.display_name,
        username: selectedUser.username,
        avatar_url: selectedUser.avatar_url,
        profile_image_url: selectedUser.profile_image_url,
      }
    );
    setSending(false);

    if (success) {
      setSearchQuery("");
      setSearchResults([]);
      setSelectedUser(null);
      setMessage("");
      onOpenChange(false);
    }
  };

  const getDisplayName = (result: SearchResult) => {
    return (
      result.display_name ||
      `${result.first_name || ""} ${result.last_name || ""}`.trim() ||
      result.username ||
      "Unknown"
    );
  };

  const getInitials = (result: SearchResult) => {
    const name = getDisplayName(result);
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Add Connection
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by @username or email address..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a username (e.g., @john123) or full email address to find someone
            </p>
          </div>

          {/* Search Results */}
          {searching && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          )}

          {!searching && searchResults.length > 0 && !selectedUser && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.user_id}
                  onClick={() => setSelectedUser(result)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-accent/50 transition-colors text-left"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={result.avatar_url || result.profile_image_url || undefined}
                    />
                    <AvatarFallback>{getInitials(result)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {getDisplayName(result)}
                      </span>
                      {result.profile_types.map((type) => (
                        <Badge key={type} variant="outline" className="text-xs capitalize">
                          {type}
                        </Badge>
                      ))}
                    </div>
                    {result.username && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <AtSign className="w-3 h-3" />
                        <span>{result.username}</span>
                      </div>
                    )}
                    {result.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{getDisplayLocation(result)}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!searching &&
            searchQuery.length >= 2 &&
            searchResults.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No users found matching "{searchQuery}"
              </p>
            )}

          {/* Selected User */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/50 bg-primary/5">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      selectedUser.avatar_url ||
                      selectedUser.profile_image_url ||
                      undefined
                    }
                  />
                  <AvatarFallback>{getInitials(selectedUser)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">
                      {getDisplayName(selectedUser)}
                    </span>
                    {selectedUser.profile_types.map((type) => (
                      <Badge key={type} variant="outline" className="text-xs capitalize">
                        {type}
                      </Badge>
                    ))}
                  </div>
                  {selectedUser.username && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <AtSign className="w-3 h-3" />
                      <span>{selectedUser.username}</span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(null)}
                >
                  Change
                </Button>
              </div>

              <Textarea
                placeholder="Add a message (optional)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />

              <Button
                onClick={handleSendRequest}
                disabled={sending}
                className="w-full"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="w-4 h-4 mr-2" />
                )}
                Send Connection Request
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
