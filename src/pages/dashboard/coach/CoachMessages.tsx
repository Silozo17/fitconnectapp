import { useState } from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data
const conversations = [
  { 
    id: "1", 
    name: "John Smith", 
    avatar: "JS", 
    lastMessage: "See you at 2pm!", 
    time: "2 min ago", 
    unread: 2,
    online: true 
  },
  { 
    id: "2", 
    name: "Sarah Johnson", 
    avatar: "SJ", 
    lastMessage: "Thanks for the meal plan", 
    time: "1 hour ago", 
    unread: 0,
    online: true 
  },
  { 
    id: "3", 
    name: "Mike Davis", 
    avatar: "MD", 
    lastMessage: "Can we reschedule tomorrow?", 
    time: "3 hours ago", 
    unread: 1,
    online: false 
  },
  { 
    id: "4", 
    name: "Emma Wilson", 
    avatar: "EW", 
    lastMessage: "Great session today!", 
    time: "Yesterday", 
    unread: 0,
    online: false 
  },
  { 
    id: "5", 
    name: "David Brown", 
    avatar: "DB", 
    lastMessage: "Looking forward to it", 
    time: "2 days ago", 
    unread: 0,
    online: false 
  },
];

const mockMessages = [
  { id: 1, sender: "them", text: "Hi! I wanted to ask about tomorrow's session", time: "10:30 AM" },
  { id: 2, sender: "me", text: "Hey John! Sure, what would you like to know?", time: "10:32 AM", status: "read" },
  { id: 3, sender: "them", text: "I was wondering if we could focus more on upper body exercises. My legs are still a bit sore from last time 😅", time: "10:35 AM" },
  { id: 4, sender: "me", text: "Absolutely! We can definitely adjust the plan. I'll prepare some upper body circuits for tomorrow.", time: "10:38 AM", status: "read" },
  { id: 5, sender: "them", text: "Perfect, thanks! Also, should I bring any specific equipment?", time: "10:40 AM" },
  { id: 6, sender: "me", text: "Just comfortable clothes and water. I'll have everything else ready. See you at 2pm!", time: "10:42 AM", status: "delivered" },
  { id: 7, sender: "them", text: "See you at 2pm!", time: "10:43 AM" },
];

const CoachMessages = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout title="Messages" description="Chat with your clients.">
      <div className="flex flex-col h-[calc(100vh-180px)]">
        <h1 className="font-display text-2xl font-bold text-foreground mb-4">Messages</h1>

        <div className="flex-1 card-elevated overflow-hidden flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-border flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors text-left",
                    selectedConversation.id === conv.id && "bg-secondary"
                  )}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {conv.avatar}
                    </div>
                    {conv.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-success border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground truncate">{conv.name}</span>
                      <span className="text-xs text-muted-foreground">{conv.time}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <Badge className="bg-primary text-primary-foreground shrink-0">
                      {conv.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {selectedConversation.avatar}
                  </div>
                  {selectedConversation.online && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedConversation.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.online ? "Online" : "Last seen recently"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Info className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex",
                    message.sender === "me" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      message.sender === "me"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    )}
                  >
                    <p>{message.text}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-1",
                      message.sender === "me" ? "justify-end" : "justify-start"
                    )}>
                      <span className={cn(
                        "text-xs",
                        message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {message.time}
                      </span>
                      {message.sender === "me" && (
                        message.status === "read" ? (
                          <CheckCheck className="w-3 h-3 text-primary-foreground/70" />
                        ) : (
                          <Check className="w-3 h-3 text-primary-foreground/70" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-5 h-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1"
                />
                <Button className="bg-primary text-primary-foreground" size="icon">
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachMessages;
