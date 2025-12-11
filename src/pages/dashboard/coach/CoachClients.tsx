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
  ChevronDown,
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

  const filteredClients = mockClients.filter((client) => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout title="Clients" description="Manage your coaching clients.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground">Manage and track your client relationships</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-display font-bold text-foreground">{mockClients.length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Active</p>
          <p className="text-2xl font-display font-bold text-success">{mockClients.filter(c => c.status === 'active').length}</p>
        </div>
        <div className="card-elevated p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-display font-bold text-warning">{mockClients.filter(c => c.status === 'pending').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
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
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Clients List */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sessions</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Session</th>
                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Progress</th>
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
                  <td className="p-4">
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
                  <td className="p-4">
                    <span className="text-foreground">{client.sessionsCompleted}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-muted-foreground">{client.nextSession}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{client.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Calendar className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Assign Plan</DropdownMenuItem>
                          <DropdownMenuItem>Add Notes</DropdownMenuItem>
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
            <p className="text-muted-foreground">No clients found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CoachClients;
