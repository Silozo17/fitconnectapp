import { useState } from "react";
import { Helmet } from "react-helmet-async";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  usePlatformFeatures, 
  useTierFeatures, 
  useCoachFeatureOverrides,
  useSetFeatureOverride,
  useRemoveFeatureOverride 
} from "@/hooks/useAdminData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sliders, Plus, Trash2, User, Shield } from "lucide-react";
import { toast } from "sonner";

const AdminFeatures = () => {
  const { data: features, isLoading } = usePlatformFeatures();
  const { data: tierFeatures } = useTierFeatures();
  const { data: allOverrides } = useCoachFeatureOverrides("");
  const setOverride = useSetFeatureOverride();
  const removeOverride = useRemoveFeatureOverride();

  const [selectedCoach, setSelectedCoach] = useState<string>("");
  const [isOverrideDialogOpen, setIsOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    coachId: "",
    featureId: "",
    value: "",
    reason: "",
  });

  // Fetch coaches for override selection
  const { data: coaches } = useQuery({
    queryKey: ["coaches-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("id, display_name, subscription_tier")
        .order("display_name");
      if (error) throw error;
      return data;
    },
  });

  const getFeatureValueDisplay = (value: any) => {
    if (typeof value === "boolean") {
      return value ? (
        <Badge variant="default" className="bg-green-500/10 text-green-500">Enabled</Badge>
      ) : (
        <Badge variant="secondary">Disabled</Badge>
      );
    }
    if (typeof value === "number") {
      return <Badge variant="outline">{value}</Badge>;
    }
    return <Badge variant="outline">{String(value)}</Badge>;
  };

  const handleAddOverride = async () => {
    if (!overrideForm.coachId || !overrideForm.featureId) {
      toast.error("Please select a coach and feature");
      return;
    }

    let parsedValue: any = overrideForm.value;
    const feature = features?.find((f: any) => f.id === overrideForm.featureId);
    
    if (feature?.feature_type === "boolean") {
      parsedValue = overrideForm.value === "true";
    } else if (feature?.feature_type === "number") {
      parsedValue = Number(overrideForm.value);
    }

    await setOverride.mutateAsync({
      coachId: overrideForm.coachId,
      featureId: overrideForm.featureId,
      value: parsedValue,
      reason: overrideForm.reason,
    });

    setIsOverrideDialogOpen(false);
    setOverrideForm({ coachId: "", featureId: "", value: "", reason: "" });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </AdminLayout>
    );
  }

  const tiers = ["free", "starter", "pro", "enterprise"];

  return (
    <>
      <Helmet>
        <title>Feature Control | Admin</title>
      </Helmet>

      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Feature Control</h1>
              <p className="text-muted-foreground mt-1">Manage platform features and coach access</p>
            </div>
          </div>

          <Tabs defaultValue="matrix" className="space-y-4">
            <TabsList>
              <TabsTrigger value="matrix">Feature Matrix</TabsTrigger>
              <TabsTrigger value="overrides">Coach Overrides</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sliders className="h-5 w-5" />
                    Feature Access by Tier
                  </CardTitle>
                  <CardDescription>
                    View which features are available for each subscription tier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[300px]">Feature</TableHead>
                          {tiers.map((tier) => (
                            <TableHead key={tier} className="text-center capitalize">{tier}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {features?.map((feature: any) => (
                          <TableRow key={feature.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{feature.name}</p>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </div>
                            </TableCell>
                            {tiers.map((tier) => {
                              const tf = tierFeatures?.find(
                                (tf: any) => tf.tier === tier && tf.feature_id === feature.id
                              );
                              return (
                                <TableCell key={tier} className="text-center">
                                  {getFeatureValueDisplay(tf?.value)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    To edit feature values, go to the Pricing Plans page.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overrides" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Coach Feature Overrides
                      </CardTitle>
                      <CardDescription>
                        Grant or restrict specific features for individual coaches
                      </CardDescription>
                    </div>
                    <Dialog open={isOverrideDialogOpen} onOpenChange={setIsOverrideDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Override
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Feature Override</DialogTitle>
                          <DialogDescription>
                            Grant or restrict a specific feature for a coach
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label>Coach</Label>
                            <Select 
                              value={overrideForm.coachId}
                              onValueChange={(value) => setOverrideForm(prev => ({ ...prev, coachId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a coach" />
                              </SelectTrigger>
                              <SelectContent>
                                {coaches?.map((coach: any) => (
                                  <SelectItem key={coach.id} value={coach.id}>
                                    {coach.display_name || "Unknown"} ({coach.subscription_tier})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Feature</Label>
                            <Select 
                              value={overrideForm.featureId}
                              onValueChange={(value) => setOverrideForm(prev => ({ ...prev, featureId: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a feature" />
                              </SelectTrigger>
                              <SelectContent>
                                {features?.map((feature: any) => (
                                  <SelectItem key={feature.id} value={feature.id}>
                                    {feature.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Value</Label>
                            {features?.find((f: any) => f.id === overrideForm.featureId)?.feature_type === "boolean" ? (
                              <Select 
                                value={overrideForm.value}
                                onValueChange={(value) => setOverrideForm(prev => ({ ...prev, value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select value" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">Enabled</SelectItem>
                                  <SelectItem value="false">Disabled</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                value={overrideForm.value}
                                onChange={(e) => setOverrideForm(prev => ({ ...prev, value: e.target.value }))}
                                placeholder="Enter value"
                              />
                            )}
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Reason (optional)</Label>
                            <Input 
                              value={overrideForm.reason}
                              onChange={(e) => setOverrideForm(prev => ({ ...prev, reason: e.target.value }))}
                              placeholder="Why is this override being applied?"
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsOverrideDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddOverride}>Add Override</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {allOverrides && allOverrides.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Coach</TableHead>
                          <TableHead>Feature</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allOverrides.map((override: any) => (
                          <TableRow key={override.id}>
                            <TableCell>
                              {coaches?.find((c: any) => c.id === override.coach_id)?.display_name || "Unknown"}
                            </TableCell>
                            <TableCell>{override.platform_features?.name}</TableCell>
                            <TableCell>{getFeatureValueDisplay(override.value)}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {override.reason || "-"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {override.expires_at 
                                ? new Date(override.expires_at).toLocaleDateString() 
                                : "Never"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => removeOverride.mutate(override.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No feature overrides configured</p>
                      <p className="text-sm">Add overrides to grant or restrict features for specific coaches</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </>
  );
};

export default AdminFeatures;