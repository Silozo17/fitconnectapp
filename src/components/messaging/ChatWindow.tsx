import { useState, useRef, useEffect, useCallback } from "react";
import { useMessages, getQuickSendMetadata } from "@/hooks/useMessages";
import { format } from "date-fns";
import { Send, Loader2, ArrowLeft, Check, CheckCheck, User, Briefcase, Shield, MapPin, PanelRightOpen, PanelRightClose, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useAdminView } from "@/contexts/AdminContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

import TypingIndicator, { useTypingBroadcast } from "./TypingIndicator";
import ProspectProfileSheet from "./ProspectProfileSheet";
import QuickSendMessageCard from "./QuickSendMessageCard";
import ChatQuickActions from "./ChatQuickActions";
import { UserAvatar } from "@/components/shared/UserAvatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { Rarity } from "@/lib/avatar-utils";
import { useCoachLinkPrefix } from "@/hooks/useCoachLinkPrefix";

interface ParticipantInfo {
  name: string;
  avatar: string | null;
  avatarSlug?: string | null;
  avatarRarity?: Rarity | null;
  type: "client" | "coach" | "admin";
  location?: string | null;
  username?: string | null;
}

interface ChatWindowProps {
  participantId: string;
  participantName?: string;
  participantAvatar?: string | null;
  participantType?: "client" | "coach" | "admin";
  participantLocation?: string | null;
  showSidePanel?: boolean;
  onToggleSidePanel?: () => void;
  onQuickSendClick?: () => void;
}

const ChatWindow = ({ 
  participantId, 
  participantName,
  participantAvatar,
  participantType,
  participantLocation,
  showSidePanel = false,
  onToggleSidePanel,
  onQuickSendClick
}: ChatWindowProps) => {
  const { t } = useTranslation('messaging');
  const { messages, loading, error, sendMessage, currentProfileId, softRefreshConversations } = useMessages(participantId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [participantUserId, setParticipantUserId] = useState<string | null>(null);
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo>({
    name: participantName || "Conversation",
    avatar: participantAvatar || null,
    avatarSlug: null,
    avatarRarity: null,
    type: participantType || "client",
    location: participantLocation || null,
    username: null
  });
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { activeProfileType } = useAdminView();
  const { broadcastTyping } = useTypingBroadcast(currentProfileId || "", participantId);
  const coachLinkPrefix = useCoachLinkPrefix();

  const basePath = activeProfileType === "admin" 
    ? "/dashboard/admin/messages" 
    : activeProfileType === "coach" 
      ? "/dashboard/coach/messages" 
      : "/dashboard/client/messages";

  // Fetch participant info if not provided
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      if (participantName && participantAvatar !== undefined) return;
      
      // Try coach profile first (with avatar)
      const { data: coachData } = await supabase
        .from("coach_profiles")
        .select("user_id, display_name, profile_image_url, location, username, selected_avatar_id, avatars:selected_avatar_id(slug, rarity)")
        .eq("id", participantId)
        .single();

      if (coachData?.display_name) {
        setIsDeleted(false);
        setParticipantUserId(coachData.user_id);
        setParticipantInfo({
          name: coachData.display_name,
          avatar: coachData.profile_image_url,
          avatarSlug: (coachData.avatars as any)?.slug || null,
          avatarRarity: (coachData.avatars as any)?.rarity as Rarity || null,
          type: "coach",
          location: coachData.location,
          username: coachData.username
        });
        return;
      }

      // Try client profile (with avatar)
      const { data: clientData } = await supabase
        .from("client_profiles")
        .select("user_id, first_name, last_name, avatar_url, location, selected_avatar_id, avatars:selected_avatar_id(slug, rarity)")
        .eq("id", participantId)
        .single();

      if (clientData) {
        setIsDeleted(false);
        setParticipantUserId(clientData.user_id);
        setParticipantInfo({
          name: `${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client",
          avatar: clientData.avatar_url,
          avatarSlug: (clientData.avatars as any)?.slug || null,
          avatarRarity: (clientData.avatars as any)?.rarity as Rarity || null,
          type: "client",
          location: clientData.location,
          username: null
        });
        return;
      }

      // Try admin profile
      const { data: adminData } = await supabase
        .from("admin_profiles")
        .select("user_id, display_name, first_name, last_name, avatar_url")
        .eq("id", participantId)
        .single();

      if (adminData) {
        setIsDeleted(false);
        setParticipantUserId(adminData.user_id);
        setParticipantInfo({
          name: adminData.display_name || `${adminData.first_name || ""} ${adminData.last_name || ""}`.trim() || "Admin",
          avatar: adminData.avatar_url,
          avatarSlug: null,
          avatarRarity: null,
          type: "admin",
          location: null,
          username: null
        });
        return;
      }

      // No profile found - user has been deleted
      setIsDeleted(true);
      setParticipantUserId(null);
      setParticipantInfo({
        name: t('chatWindow.deletedUser'),
        avatar: null,
        avatarSlug: null,
        avatarRarity: null,
        type: "client",
        location: null,
        username: null
      });
    };

    fetchParticipantInfo();
  }, [participantId, participantName, participantAvatar]);

  // Update from props if provided
  useEffect(() => {
    if (participantName) {
      setParticipantInfo(prev => ({
        ...prev,
        name: participantName,
        avatar: participantAvatar ?? prev.avatar,
        type: participantType ?? prev.type,
        location: participantLocation ?? prev.location
      }));
    }
  }, [participantName, participantAvatar, participantType, participantLocation]);

  // Direct scroll function using container scrollTop
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Scroll on initial load when messages are ready
  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages.length, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
      // Force scroll after send using requestAnimationFrame
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
    setSending(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim() && currentProfileId) {
      broadcastTyping();
    }
  };

  const getTypeIcon = (type: "client" | "coach" | "admin") => {
    switch (type) {
      case "coach":
        return <Briefcase className="w-4 h-4" />;
      case "admin":
        return <Shield className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <p className="text-destructive font-medium mb-2">{t('chatWindow.unableToLoad')}</p>
        <p className="text-muted-foreground text-sm">{error}</p>
      </div>
    );
  }

  // Determine if we should use ProspectProfileSheet (coach viewing client)
  const shouldUseProspectSheet = activeProfileType === "coach" && participantInfo.type === "client";

  // Check if coach to show side panel toggle
  const isCoachView = activeProfileType === "coach";

  return (
    <div className="flex flex-col h-full w-full min-w-0 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border/50 backdrop-blur-sm bg-card/50 flex items-center gap-3">
            <Link to={basePath} className="lg:hidden">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            
            {/* Clickable header for profile view */}
            <button
              onClick={() => setProfileOpen(true)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity flex-1 pt-3"
            >
              <UserAvatar
                src={participantInfo.avatar}
                avatarSlug={participantInfo.avatarSlug}
                avatarRarity={participantInfo.avatarRarity}
                name={participantInfo.name}
                variant="squircle"
                size="xs"
              />
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-foreground">{participantInfo.name}</h2>
                  <span className="text-muted-foreground">
                    {getTypeIcon(participantInfo.type)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t('chatWindow.tapToViewProfile')}</p>
              </div>
            </button>

            {/* Quick Send button for coaches - mobile only */}
            {isCoachView && onQuickSendClick && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onQuickSendClick}
                className="lg:hidden"
              >
                <Zap className="h-5 w-5" />
              </Button>
            )}

            {/* Side panel toggle for coaches */}
            {isCoachView && onToggleSidePanel && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onToggleSidePanel}
                className="hidden lg:flex"
              >
                {showSidePanel ? (
                  <PanelRightClose className="h-5 w-5" />
                ) : (
                  <PanelRightOpen className="h-5 w-5" />
                )}
              </Button>
            )}
          </div>

          {/* Messages */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 min-h-0">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>{t('chatWindow.noMessages')}</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMine = message.sender_id === currentProfileId;
                const quickSendMetadata = getQuickSendMetadata(message.metadata);
                
                // Render interactive card for Quick Send messages
                if (quickSendMetadata) {
                  return (
                    <QuickSendMessageCard
                      key={message.id}
                      message={message}
                      isMine={isMine}
                      currentProfileId={currentProfileId || ''}
                      onStatusUpdate={softRefreshConversations}
                    />
                  );
                }
                
                // Regular text message
                return (
                  <div
                    key={message.id}
                    className={cn("flex", isMine ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[70%] rounded-2xl px-4 py-2",
                        isMine
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "glass-item bg-white/[0.06] text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1",
                          isMine ? "justify-end" : "justify-start"
                        )}
                      >
                        <span
                          className={cn(
                            "text-xs",
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}
                        >
                          {format(new Date(message.created_at), "HH:mm")}
                        </span>
                        {isMine && (
                          message.read_at ? (
                            <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                          ) : (
                            <Check className="w-3 h-3 text-primary-foreground/50" />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            
            {/* Typing Indicator */}
            {currentProfileId && (
              <TypingIndicator 
                conversationPartnerId={participantId} 
                currentUserId={currentProfileId} 
              />
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions for coaches */}
          {isCoachView && currentProfileId && !isDeleted && (
            <ChatQuickActions
              coachId={currentProfileId}
              participantUserId={participantUserId || undefined}
              onSendMessage={sendMessage}
              externalDrawerOpen={quickActionsOpen}
              onExternalDrawerChange={setQuickActionsOpen}
            />
          )}

          {/* Input */}
          {isDeleted ? (
            <div className="p-4 border-t border-border/50 glass-item">
              <p className="text-sm text-muted-foreground text-center">
                {t('chatWindow.deletedUserNotice')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSend} className="p-4 border-t border-border/50 backdrop-blur-sm bg-card/50">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  placeholder={t('typeMessage')}
                  className="flex-1 bg-background border-border"
                  disabled={sending}
                />
                <Button type="submit" disabled={sending || !newMessage.trim()}>
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </form>
          )}

      {/* Profile Sheet - Use ProspectProfileSheet for coaches viewing clients */}
      {shouldUseProspectSheet ? (
        <ProspectProfileSheet
          open={profileOpen}
          onOpenChange={setProfileOpen}
          clientProfileId={participantId}
          participantName={participantInfo.name}
          participantAvatar={participantInfo.avatar}
        />
      ) : (
        <Sheet open={profileOpen} onOpenChange={setProfileOpen}>
          <SheetContent side="right" className="w-[320px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>{t('chatWindow.profile')}</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 flex flex-col items-center text-center pt-8">
              <UserAvatar
                src={participantInfo.avatar}
                avatarSlug={participantInfo.avatarSlug}
                avatarRarity={participantInfo.avatarRarity}
                name={participantInfo.name}
                variant="squircle"
                size="sm"
              />
              
              <h3 className="text-xl font-semibold text-foreground">
                {participantInfo.name}
              </h3>
              
              <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
                {getTypeIcon(participantInfo.type)}
                <span className="capitalize">{participantInfo.type}</span>
              </div>
              
              {participantInfo.location && (
                <div className="flex items-center gap-1 mt-2 text-muted-foreground text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{participantInfo.location}</span>
                </div>
              )}
              
              {participantInfo.type === "coach" && (
                <div className="mt-6 w-full">
                  <Link
                    to={`${coachLinkPrefix}/${participantInfo.username || participantId}`}
                    className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-center hover:bg-primary/90 transition-colors"
                    onClick={() => setProfileOpen(false)}
                  >
                    {t('chatWindow.viewFullProfile')}
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

export default ChatWindow;