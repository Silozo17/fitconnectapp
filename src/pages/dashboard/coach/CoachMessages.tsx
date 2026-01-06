import { useParams } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import NewConversationModal from "@/components/messaging/NewConversationModal";
import MessageSidePanel from "@/components/messaging/MessageSidePanel";
import QuickSendSheet from "@/components/messaging/QuickSendSheet";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParticipantName } from "@/hooks/useParticipantName";
import { useMessages } from "@/hooks/useMessages";
import { useAdminView } from "@/contexts/AdminContext";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const CoachMessages = () => {
  const { t } = useTranslation('messaging');
  const { id: participantId } = useParams();
  const { data: participantName = "" } = useParticipantName(participantId);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [showQuickSendSheet, setShowQuickSendSheet] = useState(false);
  const { sendMessage } = useMessages(participantId);
  const { activeProfileType } = useAdminView();

  const handleSendMessage = async (msg: string) => {
    const success = await sendMessage(msg);
    return success;
  };

  return (
    <DashboardLayout title={t('title')} description={t('description')}>
      <PageHelpBanner
        pageKey="coach_messages"
        title="Client Messages"
        description="Communicate with clients and send quick updates"
      />
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Client <span className="gradient-text">Messages</span>
          </h1>
          <Button onClick={() => setShowNewConversation(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {t('newMessage')}
          </Button>
        </div>

        <div className="relative flex-1 glass-card rounded-3xl overflow-hidden flex shadow-float">
          {/* White accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-white/20 via-white/10 to-transparent z-10" />
          {/* Conversations List - Hidden on mobile when in chat */}
          <div className={`w-full lg:w-80 border-r border-border/50 flex flex-col ${participantId ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-border/50">
              <h2 className="font-semibold text-foreground">{t('inbox.title')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList activeConversationId={participantId} />
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${!participantId ? "hidden lg:flex" : "flex"}`}>
            {participantId ? (
              <ChatWindow 
                participantId={participantId} 
                participantName={participantName}
                showSidePanel={showSidePanel}
                onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
                onQuickSendClick={() => setShowQuickSendSheet(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t('selectConversation')}</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  {t('selectConversationDescription')}
                </p>
                <Button onClick={() => setShowNewConversation(true)} className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('startConversation')}
                </Button>
              </div>
            )}
          </div>

          {/* Side Panel - Desktop only */}
          {participantId && showSidePanel && (
            <div className="hidden lg:block border-l border-border/50">
              <MessageSidePanel
                participantId={participantId}
                clientId={participantId}
                onSendMessage={handleSendMessage}
                onClose={() => setShowSidePanel(false)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick Send Sheet for coaches */}
      {participantId && activeProfileType === "coach" && (
        <QuickSendSheet
          open={showQuickSendSheet}
          onOpenChange={setShowQuickSendSheet}
          participantId={participantId}
          clientId={participantId}
          onSendMessage={handleSendMessage}
        />
      )}

      <NewConversationModal 
        open={showNewConversation} 
        onOpenChange={setShowNewConversation} 
      />
    </DashboardLayout>
  );
};

export default CoachMessages;
