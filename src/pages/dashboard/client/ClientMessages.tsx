import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ClientDashboardLayout from "@/components/dashboard/ClientDashboardLayout";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParticipantName } from "@/hooks/useParticipantName";

const ClientMessages = () => {
  const { t } = useTranslation('messaging');
  const { id: participantId } = useParams();
  const navigate = useNavigate();
  const { data: participantName } = useParticipantName(participantId);

  return (
    <ClientDashboardLayout title={t('title')} description={t('description')}>
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center gap-2 mb-4">
          {participantId && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => navigate("/dashboard/client/messages")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        </div>

        <div className="flex-1 bg-card border border-border rounded-lg overflow-hidden flex">
          {/* Conversations List */}
          <div
            className={`w-full lg:w-80 border-r border-border flex flex-col ${
              participantId ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">{t('inbox.title')}</h2>
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
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('selectConversation')}
                </h3>
                <p className="text-muted-foreground max-w-sm">
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
