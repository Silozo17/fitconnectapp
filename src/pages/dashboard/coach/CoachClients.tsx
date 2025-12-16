import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  UserCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AddClientModal } from "@/components/dashboard/clients/AddClientModal";
import { ScheduleSessionModal } from "@/components/dashboard/clients/ScheduleSessionModal";
import { AssignPlanModal } from "@/components/dashboard/clients/AssignPlanModal";
import { AddNoteModal } from "@/components/dashboard/clients/AddNoteModal";

// Mock data
const mockClients = [
  { id: "1", name: "John Smith", email: "john@example.com", avatar: "JS", status: "active", plan: "Personal Training", sessionsCompleted: 24, nextSession: "Today, 2:00 PM", progress: 78 },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", avatar: "SJ", status: "active", plan: "Nutrition + Training", sessionsCompleted: 16, nextSession: "Tomorrow", progress: 65 },
  { id: "3", name: "Mike Davis", email: "mike@example.com", avatar: "MD", status: "active", plan: "Boxing", sessionsCompleted: 32, nextSession: "Wed, 10:00 AM", progress: 92 },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", avatar: "EW", status: "pending", plan: "Personal Training", sessionsCompleted: 0, nextSession: "Awaiting confirmation", progress: 0 },
  { id: "5", name: "David Brown", email: "david@example.com", avatar: "DB", status: "inactive", plan: "MMA Training", sessionsCompleted: 12, nextSession: "-", progress: 45 },
];

const CoachClients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  
  // Modal states
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    const matchesPlan = planFilter === "all" || client.plan.toLowerCase().includes(planFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleScheduleSession = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setIsScheduleSessionOpen(true);
  };

  const handleAssignPlan = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setIsAssignPlanOpen(true);
  };

  const handleAddNote = (client: typeof mockClients[0]) => {
    setSelectedClient(client);
    setIsAddNoteOpen(true);
  };

  const uniquePlans = [...new Set(mockClients.map(c => c.plan))];

  return (
    <DashboardLayout title="Clients" description="Manage your coaching clients.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage and track your client relationships</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">{mockClients.length}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-success" />
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <p className="text-2xl font-display font-bold text-success">{mockClients.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-display font-bold text-warning">{mockClients.filter(c => c.status === 'pending').length}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <p className="text-sm text-muted-foreground">Avg Progress</p>
          </div>
          <p className="text-2xl font-display font-bold text-accent">
            {Math.round(mockClients.reduce((acc, c) => acc + c.progress, 0) / mockClients.length)}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Plan Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              {uniquePlans.map(plan => (
                <SelectItem key={plan} value={plan.toLowerCase()}>{plan}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Clients List */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Plan</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Sessions</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Next Session</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Progress</th>
                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="p-4">
                    <Link to={`/dashboard/coach/clients/${client.id}`} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                        {client.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground hover:text-primary transition-colors">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-foreground">{client.plan}</span>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={client.status === 'active' ? 'default' : client.status === 'pending' ? 'secondary' : 'outline'}
                      className={
                        client.status === 'active' ? 'bg-success/20 text-success border-success/30' :
                        client.status === 'pending' ? 'bg-warning/20 text-warning border-warning/30' :
                        'bg-muted text-muted-foreground'
                      }
                    >
                      {client.status}
                    </Badge>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-foreground">{client.sessionsCompleted}</span>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <span className="text-muted-foreground">{client.nextSession}</span>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{client.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Message">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Schedule Session"
                        onClick={() => handleScheduleSession(client)}
                      >
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/coach/clients/${client.id}`}>View Profile</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAssignPlan(client)}>
                            Assign Plan
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddNote(client)}>
                            Add Notes
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Remove Client</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredClients.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No clients found</p>
            <Button onClick={() => setIsAddClientOpen(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Client
            </Button>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddClientModal 
        open={isAddClientOpen} 
        onOpenChange={setIsAddClientOpen} 
      />
      
      <ScheduleSessionModal 
        open={isScheduleSessionOpen} 
        onOpenChange={(open) => {
          setIsScheduleSessionOpen(open);
          if (!open) setSelectedClient(null);
        }}
        clientName={selectedClient?.name}
      />
      
      <AssignPlanModal 
        open={isAssignPlanOpen} 
        onOpenChange={(open) => {
          setIsAssignPlanOpen(open);
          if (!open) setSelectedClient(null);
        }}
        clientName={selectedClient?.name}
      />
      
      <AddNoteModal 
        open={isAddNoteOpen} 
        onOpenChange={(open) => {
          setIsAddNoteOpen(open);
          if (!open) setSelectedClient(null);
        }}
        clientName={selectedClient?.name}
      />
    </DashboardLayout>
  );
};

export default CoachClients;