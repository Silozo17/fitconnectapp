import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import ClientRequests from "@/components/dashboard/coach/ClientRequests";

const CoachClients = () => {
  const { t } = useTranslation("coach");
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
      <DashboardLayout title={t("clients.pageTitle")} description={t("clients.pageDescription")}>
        <div className="card-elevated p-12 text-center">
          <p className="text-destructive">{t("clients.errorLoading")}: {error.message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={t("clients.pageTitle")} description={t("clients.pageDescription")}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{t("clients.pageTitle")}</h1>
          <p className="text-muted-foreground">{t("clients.pageDescription")}</p>
        </div>
        <Button onClick={() => setIsAddClientOpen(true)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          {t("clients.addClient")}
        </Button>
      </div>

      {/* Pending Client Requests */}
      <div className="mb-6">
        <ClientRequests />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground truncate">{stats.total}</p>
          <p className="text-sm text-muted-foreground truncate">{t("stats.totalClients")}</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-success shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-success truncate">{stats.active}</p>
          <p className="text-sm text-muted-foreground truncate">{t("clients.active")}</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-warning truncate">{stats.pending}</p>
          <p className="text-sm text-muted-foreground truncate">{t("clients.pending")}</p>
        </div>
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent shrink-0" />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-accent truncate">
            {clients.filter(c => {
              const startDate = c.start_date ? new Date(c.start_date) : null;
              if (!startDate) return false;
              const now = new Date();
              return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
          <p className="text-sm text-muted-foreground truncate">{t("stats.thisMonth")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("clients.searchClients")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t("common:status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("clients.allStatus")}</SelectItem>
              <SelectItem value="active">{t("clients.active")}</SelectItem>
              <SelectItem value="pending">{t("clients.pending")}</SelectItem>
              <SelectItem value="inactive">{t("clients.inactive")}</SelectItem>
            </SelectContent>
          </Select>
          {uniquePlans.length > 0 && (
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder={t("common:planType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("clients.allPlans")}</SelectItem>
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
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Clients List */}
      {!isLoading && (
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("clients.tableHeaders.client")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">{t("clients.tableHeaders.plan")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">{t("clients.tableHeaders.status")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">{t("clients.tableHeaders.startDate")}</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">{t("clients.tableHeaders.goals")}</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">{t("clients.tableHeaders.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <Link to={`/dashboard/coach/clients/${client.client_id}`} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {getInitials(client)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground hover:text-primary transition-colors">
                            {getFullName(client)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {client.client_profile?.weight_kg ? `${client.client_profile.weight_kg}kg` : t("clients.noData")}
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
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title={t("clients.message")}
                          onClick={() => {
                            // Navigate to messages with this client
                            window.location.href = `/dashboard/coach/messages/${client.client_id}`;
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title={t("clients.scheduleSession")}
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
                              <Link to={`/dashboard/coach/clients/${client.client_id}`}>{t("clients.viewProfile")}</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAssignPlan(client)}>
                              {t("clients.assignPlan")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAddNote(client)}>
                              {t("clients.addNotes")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">{t("clients.removeClient")}</DropdownMenuItem>
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
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground mb-4">
                {clients.length === 0 ? t("clients.noClients") : t("clients.noClientsMatch")}
              </p>
              <Button onClick={() => setIsAddClientOpen(true)} variant="outline" className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" />
                {t("clients.addFirstClient")}
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