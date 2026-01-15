import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { 
  useAdminGymDetail, 
  useUpdateGymStatus, 
  useUpdateGymVerification,
  useGymMembers,
  useGymPayments,
} from "@/hooks/admin/useAdminGyms";
import { format } from "date-fns";
import { 
  Building2, Users, MapPin, CreditCard, BadgeCheck, 
  X, Pause, Ban, CheckCircle, Mail, Phone, Globe,
  Loader2, Eye, Calendar, PoundSterling
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface GymDetailDrawerProps {
  gymId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GymDetailDrawer({ gymId, open, onOpenChange }: GymDetailDrawerProps) {
  const { data: gym, isLoading } = useAdminGymDetail(gymId);
  const { data: members } = useGymMembers(gymId);
  const { data: payments } = useGymPayments(gymId);
  const updateStatus = useUpdateGymStatus();
  const updateVerification = useUpdateGymVerification();

  if (!gymId) return null;

  const locations = gym?.location_count || 1;
  const monthlyFee = 99 + Math.max(0, locations - 1) * 25;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[540px] overflow-y-auto" showCloseButton={false}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : gym ? (
          <>
            <SheetHeader>
              <div className="flex items-start justify-between gap-4 pt-6">
                <div className="flex items-center gap-4">
                  <UserAvatar
                    src={gym.logo_url}
                    name={gym.name}
                    variant="squircle"
                    size="sm"
                  />
                  <div>
                    <SheetTitle className="text-xl">{gym.name}</SheetTitle>
                    <p className="text-sm text-muted-foreground">{gym.city || "No location"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={gym.status === "active" ? "default" : "secondary"}>
                        {gym.status || "Pending"}
                      </Badge>
                      {gym.is_verified && (
                        <Badge variant="outline" className="bg-primary/10">
                          <BadgeCheck className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 rounded-xl">
                    <X className="h-4 w-4" />
                  </Button>
                </SheetClose>
              </div>
            </SheetHeader>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-2 mt-6">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{gym.member_count || 0}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{locations}</p>
                <p className="text-xs text-muted-foreground">Locations</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <PoundSterling className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">£{monthlyFee}</p>
                <p className="text-xs text-muted-foreground">Monthly</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <Users className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                <p className="text-lg font-bold">{gym.staff?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Admin Actions</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => updateStatus.mutate({ gymId: gym.id, status: "active" })}
                  disabled={gym.status === "active" || updateStatus.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Activate
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => updateStatus.mutate({ gymId: gym.id, status: "suspended" })}
                  disabled={gym.status === "suspended" || updateStatus.isPending}
                >
                  <Pause className="h-4 w-4 mr-2 text-amber-500" />
                  Suspend
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => updateVerification.mutate({ gymId: gym.id, isVerified: !gym.is_verified })}
                  disabled={updateVerification.isPending}
                >
                  <BadgeCheck className="h-4 w-4 mr-2 text-primary" />
                  {gym.is_verified ? "Unverify" : "Verify"}
                </Button>
                <Button 
                  variant="destructive" 
                  className="justify-start"
                  onClick={() => updateStatus.mutate({ gymId: gym.id, status: "banned" })}
                  disabled={gym.status === "banned" || updateStatus.isPending}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Tabs */}
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid grid-cols-4 w-full h-auto gap-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="staff">Staff</TabsTrigger>
                <TabsTrigger value="financials">Financials</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{gym.email || "No email"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{gym.phone || "No phone"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span>{gym.website || "No website"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Subscription</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant={gym.subscription_status === "active" ? "default" : "secondary"}>
                        {gym.subscription_status || "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Fee</span>
                      <span>£99/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Additional Locations</span>
                      <span>{Math.max(0, locations - 1)} × £25</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total Monthly</span>
                      <span>£{monthlyFee}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="members" className="mt-4 space-y-2">
                {members && members.length > 0 ? (
                  members.slice(0, 10).map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{member.first_name} {member.last_name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {member.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No members</p>
                )}
              </TabsContent>

              <TabsContent value="staff" className="mt-4 space-y-2">
                {gym.staff && gym.staff.length > 0 ? (
                  gym.staff.map((staff: any) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{staff.first_name} {staff.last_name}</p>
                        <p className="text-xs text-muted-foreground">{staff.role}</p>
                      </div>
                      <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                        {staff.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No staff</p>
                )}
              </TabsContent>

              <TabsContent value="financials" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Platform Revenue</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subscription Revenue</span>
                      <span>£{monthlyFee}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction Fees (£1/payment)</span>
                      <span>£{payments?.length || 0} this month</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Recent Payments</p>
                  {payments && payments.length > 0 ? (
                    payments.slice(0, 5).map((payment: any) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">£{(payment.amount / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                        <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                          {payment.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No payments</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">Gym not found</div>
        )}
      </SheetContent>
    </Sheet>
  );
}
