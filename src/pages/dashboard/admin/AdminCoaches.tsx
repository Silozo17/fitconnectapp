import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Pencil, Trash2, KeyRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import EditCoachModal from "@/components/admin/EditCoachModal";

interface CoachUser {
  id: string;
  user_id: string;
  display_name: string | null;
  coach_types: string[] | null;
  hourly_rate: number | null;
  subscription_tier: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState<CoachUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoach, setEditingCoach] = useState<CoachUser | null>(null);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coach_profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch coaches");
      console.error(error);
    } else {
      setCoaches(data || []);
    }
    setLoading(false);
  };

  const handleDeleteCoach = async (coachId: string) => {
    if (!confirm("Are you sure you want to delete this coach? This action cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("coach_profiles")
      .delete()
      .eq("id", coachId);

    if (error) {
      toast.error("Failed to delete coach");
      console.error(error);
    } else {
      toast.success("Coach deleted successfully");
      fetchCoaches();
    }
  };

  const handleResetPassword = async (userId: string) => {
    toast.info("Password reset functionality requires edge function setup");
  };

  const filteredCoaches = coaches.filter((coach) => {
    const name = (coach.display_name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coaches Management</h1>
          <p className="text-muted-foreground mt-1">Manage all coach accounts</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>All Coaches ({coaches.length})</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading coaches...</div>
            ) : filteredCoaches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No coaches found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Specialty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoaches.map((coach) => (
                    <TableRow key={coach.id}>
                      <TableCell className="font-medium">
                        {coach.display_name || "Unnamed Coach"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {coach.coach_types?.slice(0, 2).map((type) => (
                            <Badge key={type} variant="outline" className="text-xs">
                              {type}
                            </Badge>
                          ))}
                          {(coach.coach_types?.length || 0) > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{(coach.coach_types?.length || 0) - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {coach.hourly_rate ? `$${coach.hourly_rate}/hr` : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {coach.subscription_tier || "free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coach.onboarding_completed ? "default" : "secondary"}>
                          {coach.onboarding_completed ? "Active" : "Onboarding"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(coach.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingCoach(coach)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResetPassword(coach.user_id)}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteCoach(coach.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Coach
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {editingCoach && (
        <EditCoachModal
          coach={editingCoach}
          open={!!editingCoach}
          onClose={() => setEditingCoach(null)}
          onSaved={fetchCoaches}
        />
      )}
    </AdminLayout>
  );
};

export default AdminCoaches;
