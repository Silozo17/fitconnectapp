import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MessageSquare, Calendar, MoreVertical, TrendingUp, Eye, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "active" | "pending" | "inactive";
  planType: string;
  sessionsCompleted: number;
  nextSession?: string;
  progress?: number;
}

interface ClientCardProps {
  client: Client;
  onMessage: (clientId: string) => void;
  onSchedule: (clientId: string) => void;
}

const statusColors = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export function ClientCard({ client, onMessage, onSchedule }: ClientCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={client.avatar} alt={client.name} />
              <AvatarFallback className="bg-primary/20 text-primary">
                {client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem onClick={() => navigate(`/dashboard/coach/clients/${client.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMessage(client.id)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSchedule(client.id)}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline" className={statusColors[client.status]}>
            {client.status}
          </Badge>
          <Badge variant="secondary" className="bg-secondary/50">
            {client.planType}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-2 rounded-lg bg-background">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              Sessions
            </div>
            <p className="text-lg font-semibold text-foreground">{client.sessionsCompleted}</p>
          </div>
          <div className="p-2 rounded-lg bg-background">
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <TrendingUp className="h-3 w-3" />
              Progress
            </div>
            <p className="text-lg font-semibold text-foreground">{client.progress || 0}%</p>
          </div>
        </div>

        {client.nextSession && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Next: {client.nextSession}</span>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onMessage(client.id)}
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSchedule(client.id)}
          >
            <Calendar className="h-4 w-4 mr-1" />
            Schedule
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
