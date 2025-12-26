import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParticipantName } from "@/hooks/useParticipantName";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const ClientMessages = () => {
  const { t } = useTranslation('messaging');
  const { id: participantId } = useParams();
  const navigate = useNavigate();
  const { data: participantName } = useParticipantName(participantId);

  return (
    <ClientDashboardLayout title={t('title')} description={t('description')}>
      <PageHelpBanner
        pageKey="client_messages"
        title="Stay Connected"
        description="Chat with your coaches, share updates, and get feedback"
      />
      <div className="flex flex-col h-full min-h-0">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          {participantId && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => navigate("/dashboard/client/messages")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-foreground font-display">{t('title')}</h1>
        </div>

        {/* Chat Container */}
        <div className="flex-1 glass-card rounded-3xl overflow-hidden flex shadow-float">
          {/* Conversations List */}
          <div
            className={`w-full lg:w-80 border-r border-border/50 flex flex-col ${
              participantId ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="p-5 border-b border-border/50">
              <h2 className="font-semibold text-foreground text-lg">{t('inbox.title')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList activeConversationId={participantId} />
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 flex flex-col ${
              !participantId ? "hidden lg:flex" : "flex"
            }`}
          >
            {participantId ? (
              <ChatWindow participantId={participantId} participantName={participantName} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-5 shadow-glow-sm">
                  <MessageSquare className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 font-display">
                  {t('selectConversation')}
                </h3>
                <p className="text-muted-foreground max-w-sm text-lg">
                  {t('selectConversationDescription')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientDashboardLayout>
  );
};

export default ClientMessages;
