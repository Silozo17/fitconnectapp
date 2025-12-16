import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  MoreVertical,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  UserCheck,
  Clock,
  Loader2,
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
import { useCoachClients, CoachClient } from "@/hooks/useCoachClients";

const CoachClients = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  
  // Modal states
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isScheduleSessionOpen, setIsScheduleSessionOpen] = useState(false);
  const [isAssignPlanOpen, setIsAssignPlanOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<CoachClient | null>(null);

  // Fetch real data
  const { data: clients = [], isLoading, error } = useCoachClients();

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const fullName = `${client.client_profile?.first_name || ''} ${client.client_profile?.last_name || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || client.status === statusFilter;
      const matchesPlan = planFilter === "all" || (client.plan_type?.toLowerCase().includes(planFilter.toLowerCase()) ?? false);
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [clients, searchQuery, statusFilter, planFilter]);

  const stats = useMemo(() => ({
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    pending: clients.filter(c => c.status === 'pending').length,
  }), [clients]);

  const uniquePlans = useMemo(() => {
    const plans = clients.map(c => c.plan_type).filter(Boolean) as string[];
    return [...new Set(plans)];
  }, [clients]);

  const handleScheduleSession = (client: CoachClient) => {
    setSelectedClient(client);
    setIsScheduleSessionOpen(true);
  };

  const handleAssignPlan = (client: CoachClient) => {
    setSelectedClient(client);
    setIsAssignPlanOpen(true);
  };

  const handleAddNote = (client: CoachClient) => {
    setSelectedClient(client);
    setIsAddNoteOpen(true);
  };

  const getInitials = (client: CoachClient) => {
    const first = client.client_profile?.first_name?.[0] || '';
    const last = client.client_profile?.last_name?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = (client: CoachClient) => {
    const first = client.client_profile?.first_name || '';
    const last = client.client_profile?.last_name || '';
    return `${first} ${last}`.trim() || 'Unknown Client';
  };

  if (error) {
    return (
      <DashboardLayout title="Clients" description="Manage your coaching clients.">
        <div className="card-elevated p-12 text-center">
          <p className="text-destructive">Error loading clients: {error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

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
          <p className="text-2xl font-display font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-4 h-4 text-success" />
            <p className="text-sm text-muted-foreground">Active</p>
          </div>
          <p className="text-2xl font-display font-bold text-success">{stats.active}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-warning" />
            <p className="text-sm text-muted-foreground">Pending</p>
          </div>
          <p className="text-2xl font-display font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <p className="text-sm text-muted-foreground">This Month</p>
          </div>
          <p className="text-2xl font-display font-bold text-accent">
            {clients.filter(c => {
              const startDate = c.start_date ? new Date(c.start_date) : null;
              if (!startDate) return false;
              const now = new Date();
              return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients by name..."
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
          {uniquePlans.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card-elevated p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Clients List */}
      {!isLoading && (
        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Plan</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Start Date</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Goals</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-4">
                      <Link to={`/dashboard/coach/clients/${client.client_id}`} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {getInitials(client)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">
                            {getFullName(client)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {client.client_profile?.weight_kg ? `${client.client_profile.weight_kg}kg` : 'No data'}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-foreground">{client.plan_type || '-'}</span>
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
                      <span className="text-muted-foreground">
                        {client.start_date ? new Date(client.start_date).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {client.client_profile?.fitness_goals?.slice(0, 2).map((goal, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {goal}
                          </Badge>
                        )) || <span className="text-muted-foreground">-</span>}
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
                              <Link to={`/dashboard/coach/clients/${client.client_id}`}>View Profile</Link>
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

          {filteredClients.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {clients.length === 0 ? "No clients yet" : "No clients match your filters"}
              </p>
              <Button onClick={() => setIsAddClientOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          )}
        </div>
      )}

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
        clientName={selectedClient ? getFullName(selectedClient) : undefined}
        clientId={selectedClient?.client_id}
      />
      
      <AssignPlanModal 
        open={isAssignPlanOpen} 
        onOpenChange={(open) => {
          setIsAssignPlanOpen(open);
          if (!open) setSelectedClient(null);
        }}
        clientName={selectedClient ? getFullName(selectedClient) : undefined}
        clientId={selectedClient?.client_id}
      />
      
      <AddNoteModal 
        open={isAddNoteOpen} 
        onOpenChange={(open) => {
          setIsAddNoteOpen(open);
          if (!open) setSelectedClient(null);
        }}
        clientName={selectedClient ? getFullName(selectedClient) : undefined}
        clientId={selectedClient?.client_id}
      />
    </DashboardLayout>
  );
};

export default CoachClients;