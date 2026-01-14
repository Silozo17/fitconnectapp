import { useState } from "react";
import { useMyMessages, useSendMessage } from "@/hooks/gym/useGymMemberPortal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { MessageSquare, Send, Mail, MailOpen, Plus } from "lucide-react";

export function MemberMessages() {
  const { data: messages, isLoading } = useMyMessages();
  const sendMessage = useSendMessage();
  const [composeOpen, setComposeOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  const handleSend = async () => {
    if (!subject.trim() || !content.trim()) return;
    
    await sendMessage.mutateAsync({
      subject,
      content,
    });
    
    setSubject("");
    setContent("");
    setComposeOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <CardDescription>Communication with gym staff</CardDescription>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Message to Staff</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <Textarea
                placeholder="Your message..."
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button 
                className="w-full" 
                onClick={handleSend}
                disabled={sendMessage.isPending || !subject.trim() || !content.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                {sendMessage.isPending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {messages && messages.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {messages.map((message) => (
                <Card key={message.id} className={!message.is_read ? "border-primary/50 bg-primary/5" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        {message.is_read ? (
                          <MailOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                        ) : (
                          <Mail className="h-5 w-5 text-primary mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium">{message.subject}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(message.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                      </div>
                      {!message.is_read && (
                        <Badge variant="secondary" className="shrink-0">New</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No messages yet</p>
            <p className="text-sm">Start a conversation with the gym staff</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
