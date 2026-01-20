import { useParams } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DashboardSectionHeader, ContentSection } from "@/components/shared";
import { PageHelpBanner } from "@/components/discover/PageHelpBanner";

const AdminMessages = () => {
  const { id: participantId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <DashboardSectionHeader
          title="Support Inbox"
          description="View and respond to support messages from users and coaches"
        />

        <PageHelpBanner
          pageKey="admin-messages"
          title="Support Messaging"
          description="This is your support inbox. Users who click the help icon will be connected to you here. You can also message any user or coach directly from their profile."
        />

        <ContentSection colorTheme="purple" className="h-[calc(100vh-16rem)]">
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`${participantId ? 'hidden lg:block' : 'w-full lg:w-80'} lg:w-80 border-r border-border flex-shrink-0 overflow-hidden`}>
              <div className="h-full overflow-y-auto">
                <ConversationList activeConversationId={participantId} />
              </div>
            </div>

            {/* Chat Window */}
            <div className={`${participantId ? 'flex-1' : 'hidden lg:flex lg:flex-1'} flex flex-col min-w-0`}>
              {participantId ? (
                <>
                  {/* Mobile back button */}
                  <div className="lg:hidden p-3 border-b border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate("/dashboard/admin/messages")}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to conversations
                    </Button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChatWindow
                      participantId={participantId}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-3">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <p>Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ContentSection>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
