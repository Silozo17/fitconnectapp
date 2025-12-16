import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ConversationList from "@/components/messaging/ConversationList";
import ChatWindow from "@/components/messaging/ChatWindow";
import { Button } from "@/components/ui/button";
import { Dumbbell, MessageSquare, LogOut, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ClientMessages = () => {
  const { id: participantId } = useParams();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState<string>("");

  // Fetch participant name
  useEffect(() => {
    const fetchParticipantName = async () => {
      if (!participantId) return;

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
    <>
      <Helmet>
        <title>Messages | FitConnect</title>
        <meta name="description" content="Chat with your coaches" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard/client")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">
                  FitConnect
                </span>
              </Link>
            </div>

            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col h-[calc(100vh-140px)]">
            <h1 className="font-display text-2xl font-bold text-foreground mb-4">Messages</h1>

            <div className="flex-1 card-elevated overflow-hidden flex">
              {/* Conversations List */}
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
                  <ChatWindow participantId={participantId} participantName={participantName} />
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Choose a coach from the list to start chatting
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ClientMessages;
