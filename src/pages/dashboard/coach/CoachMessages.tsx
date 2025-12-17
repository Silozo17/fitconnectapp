import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import NewConversationModal from "@/components/messaging/NewConversationModal";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const CoachMessages = () => {
  const { id: participantId } = useParams();
  const [participantName, setParticipantName] = useState<string>("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);

  // Fetch participant name
  useEffect(() => {
    const fetchParticipantName = async () => {
      if (!participantId) return;

      // Try client profile first
      const { data: clientData } = await supabase
        .from("client_profiles")
        .select("first_name, last_name")
        .eq("id", participantId)
        .single();

      if (clientData) {
        setParticipantName(`${clientData.first_name || ""} ${clientData.last_name || ""}`.trim() || "Client");
        return;
      }

      // Try coach profile
      const { data: coachData } = await supabase
        .from("coach_profiles")
        .select("display_name")
        .eq("id", participantId)
        .single();

      if (coachData?.display_name) {
        setParticipantName(coachData.display_name);
      }
    };

    fetchParticipantName();
  }, [participantId]);

  return (
    <DashboardLayout title="Messages" description="Chat with your clients.">
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Messages</h1>
          <Button onClick={() => setShowNewConversation(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 card-elevated overflow-hidden flex">
          {/* Conversations List - Hidden on mobile when in chat */}
          <div className={`w-full lg:w-80 border-r border-border flex flex-col ${participantId ? "hidden lg:flex" : "flex"}`}>
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationList activeConversationId={participantId} />
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${!participantId ? "hidden lg:flex" : "flex"}`}>
            {participantId ? (
              <ChatWindow 
                participantId={participantId} 
                participantName={participantName}
                showSidePanel={showSidePanel}
                onToggleSidePanel={() => setShowSidePanel(!showSidePanel)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground max-w-sm mb-4">
                  Choose a client from the list to start chatting
                </p>
                <Button onClick={() => setShowNewConversation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <NewConversationModal 
        open={showNewConversation} 
        onOpenChange={setShowNewConversation} 
      />
    </DashboardLayout>
  );
};

export default CoachMessages;
