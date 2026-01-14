import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGym } from "@/contexts/GymContext";
import { useGymLeads, useLeadMutations, useLeadStats, LEAD_STATUSES, LEAD_SOURCES, GymLead } from "@/hooks/gym/useGymLeads";
import { useGymStaff } from "@/hooks/gym/useGymStaff";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Calendar,
  UserPlus,
  TrendingUp,
  Users,
  Target,
  Filter,
  MoreVertical,
  Trash2,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";


const leadFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  source: z.string().default("website"),
  notes: z.string().optional(),
  interest_areas: z.array(z.string()).optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

function LeadCard({ lead, onStatusChange, onEdit, onDelete }: { 
  lead: GymLead; 
  onStatusChange: (id: string, status: string) => void;
  onEdit: (lead: GymLead) => void;
  onDelete: (id: string) => void;
}) {
  const statusConfig = LEAD_STATUSES.find(s => s.value === lead.status);
  const staffName = lead.assigned_staff?.user_profiles 
    ? `${lead.assigned_staff.user_profiles.first_name || ""} ${lead.assigned_staff.user_profiles.last_name || ""}`.trim()
    : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-medium">
              {lead.first_name} {lead.last_name}
            </h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(lead.created_at), "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${statusConfig?.color} text-white`}>
              {statusConfig?.label}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(lead)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a>
            </div>
          )}
          {staffName && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <UserPlus className="h-4 w-4" />
              <span>Assigned to {staffName}</span>
            </div>
          )}
          {lead.next_follow_up_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Follow up: {format(new Date(lead.next_follow_up_at), "MMM d")}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <Select value={lead.status} onValueChange={(value) => onStatusChange(lead.id, value)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

export default function GymAdminLeads() {
  const { gymId } = useParams();
  const { gym } = useGym();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<GymLead | null>(null);

  const { data: leads = [], isLoading } = useGymLeads(gymId, { status: statusFilter });
  const { data: stats } = useLeadStats(gymId);
  const { data: staff = [] } = useGymStaff();
  const { createLead, updateLead, updateLeadStatus, deleteLead } = useLeadMutations(gymId);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      source: "website",
      notes: "",
    },
  });

  const filteredLeads = leads.filter(lead => {
    const searchLower = search.toLowerCase();
    return (
      lead.first_name.toLowerCase().includes(searchLower) ||
      (lead.last_name?.toLowerCase() || "").includes(searchLower) ||
      (lead.email?.toLowerCase() || "").includes(searchLower) ||
      (lead.phone || "").includes(search)
    );
  });

  const handleSubmit = (data: LeadFormData) => {
    if (editingLead) {
      updateLead.mutate({ id: editingLead.id, ...data }, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditingLead(null);
          form.reset();
        },
      });
    } else {
      createLead.mutate({ ...data, gym_id: gymId! } as any, {
        onSuccess: () => {
          setIsDialogOpen(false);
          form.reset();
        },
      });
    }
  };

  const handleEdit = (lead: GymLead) => {
    setEditingLead(lead);
    form.reset({
      first_name: lead.first_name,
      last_name: lead.last_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source,
      notes: lead.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = (id: string, status: string) => {
    updateLeadStatus.mutate({ id, status });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLead.mutate(id);
    }
  };

  // Group leads by status for pipeline view
  const leadsByStatus = LEAD_STATUSES.reduce((acc, status) => {
    acc[status.value] = filteredLeads.filter(l => l.status === status.value);
    return acc;
  }, {} as Record<string, GymLead[]>);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Lead Management</h1>
            <p className="text-muted-foreground">Track and convert prospects into members</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingLead(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lead
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingLead ? "Edit Lead" : "Add New Lead"}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LEAD_SOURCES.map((source) => (
                              <SelectItem key={source.value} value={source.value}>
                                {source.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createLead.isPending || updateLead.isPending}>
                      {editingLead ? "Update" : "Create"} Lead
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.total || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.new || 0}</p>
                  <p className="text-sm text-muted-foreground">New Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.converted || 0}</p>
                  <p className="text-sm text-muted-foreground">Converted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pipeline View */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading leads...</div>
        ) : statusFilter === "all" ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {LEAD_STATUSES.slice(0, -1).map((status) => (
                <div key={status.value} className="w-72 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${status.color}`} />
                    <h3 className="font-medium">{status.label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {leadsByStatus[status.value]?.length || 0}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {leadsByStatus[status.value]?.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onStatusChange={handleStatusChange}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                    {(!leadsByStatus[status.value] || leadsByStatus[status.value].length === 0) && (
                      <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                        No leads
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLeads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {filteredLeads.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No leads found
              </div>
            )}
          </div>
        )}
    </div>
  );
}
