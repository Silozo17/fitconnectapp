import { useState } from "react";
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Palette,
  HelpCircle,
  LogOut,
  Camera,
  Save,
  Plus,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const coachTypes = ["Personal Trainer", "Nutritionist", "Boxing Coach", "MMA Coach", "Yoga Instructor", "CrossFit Coach"];

const CoachSettings = () => {
  const { signOut } = useAuth();
  const [selectedTab, setSelectedTab] = useState("profile");

  // Mock profile data
  const [profile, setProfile] = useState({
    displayName: "Coach Mike",
    email: "mike@example.com",
    phone: "+44 7700 900123",
    bio: "Certified personal trainer with 8 years of experience. Specializing in strength training and nutrition coaching.",
    location: "London, UK",
    experienceYears: 8,
    hourlyRate: 75,
    coachTypes: ["Personal Trainer", "Nutritionist"],
    onlineAvailable: true,
    inPersonAvailable: true,
  });

  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    pushBookings: true,
    pushMessages: true,
    pushReminders: true,
  });

  return (
    <DashboardLayout title="Settings" description="Manage your account settings and preferences.">
      <div className="max-w-4xl">
        <h1 className="font-display text-2xl font-bold text-foreground mb-6">Settings</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 shrink-0">
            <div className="card-elevated p-2 space-y-1">
              {[
                { id: "profile", icon: User, label: "Profile" },
                { id: "services", icon: CreditCard, label: "Services & Pricing" },
                { id: "notifications", icon: Bell, label: "Notifications" },
                { id: "subscription", icon: Shield, label: "Subscription" },
                { id: "account", icon: Shield, label: "Account & Security" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedTab === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6">
            {/* Profile Tab */}
            {selectedTab === "profile" && (
              <>
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">Profile Information</h2>
                  
                  {/* Avatar */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                        CM
                      </div>
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Profile Photo</p>
                      <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        value={profile.displayName}
                        onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="mt-1"
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Bio</Label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label>Years of Experience</Label>
                      <Input
                        type="number"
                        value={profile.experienceYears}
                        onChange={(e) => setProfile({ ...profile, experienceYears: parseInt(e.target.value) })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label className="mb-2 block">Coach Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {coachTypes.map((type) => (
                        <Badge
                          key={type}
                          variant={profile.coachTypes.includes(type) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            profile.coachTypes.includes(type)
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-secondary"
                          }`}
                          onClick={() => {
                            setProfile({
                              ...profile,
                              coachTypes: profile.coachTypes.includes(type)
                                ? profile.coachTypes.filter((t) => t !== type)
                                : [...profile.coachTypes, type],
                            });
                          }}
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-center gap-8">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile.onlineAvailable}
                        onCheckedChange={(checked) => setProfile({ ...profile, onlineAvailable: checked })}
                      />
                      <Label>Available for Online Sessions</Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={profile.inPersonAvailable}
                        onCheckedChange={(checked) => setProfile({ ...profile, inPersonAvailable: checked })}
                      />
                      <Label>Available for In-Person Sessions</Label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button className="bg-primary text-primary-foreground">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Services & Pricing Tab */}
            {selectedTab === "services" && (
              <div className="card-elevated p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-bold text-foreground">Services & Pricing</h2>
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: "Personal Training (60 min)", price: 75, type: "session" },
                    { name: "Nutrition Consultation", price: 50, type: "session" },
                    { name: "Monthly Training Plan", price: 150, type: "plan" },
                    { name: "Group Session (per person)", price: 25, type: "session" },
                  ].map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{service.name}</p>
                        <Badge variant="outline" className="mt-1">{service.type}</Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">£</span>
                          <Input
                            type="number"
                            value={service.price}
                            className="w-20"
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {selectedTab === "notifications" && (
              <div className="card-elevated p-6">
                <h2 className="font-display font-bold text-foreground mb-6">Notification Preferences</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-foreground mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: "emailBookings", label: "Booking confirmations and reminders" },
                        { key: "emailMessages", label: "New messages from clients" },
                        { key: "emailMarketing", label: "Marketing and promotional emails" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label>{item.label}</Label>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked) =>
                              setNotifications({ ...notifications, [item.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="font-medium text-foreground mb-4">Push Notifications</h3>
                    <div className="space-y-4">
                      {[
                        { key: "pushBookings", label: "New booking requests" },
                        { key: "pushMessages", label: "New messages" },
                        { key: "pushReminders", label: "Session reminders" },
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between">
                          <Label>{item.label}</Label>
                          <Switch
                            checked={notifications[item.key as keyof typeof notifications]}
                            onCheckedChange={(checked) =>
                              setNotifications({ ...notifications, [item.key]: checked })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab */}
            {selectedTab === "subscription" && (
              <div className="space-y-6">
                <div className="card-elevated p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-foreground">Current Plan</h2>
                    <Badge className="bg-primary/20 text-primary">Free</Badge>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Upgrade to unlock more features and grow your coaching business.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: "Free", price: 0, features: ["5 clients max", "Basic messaging", "Standard support"] },
                      { name: "Pro", price: 29, features: ["Unlimited clients", "Priority messaging", "Analytics dashboard", "Priority support"], popular: true },
                      { name: "Elite", price: 79, features: ["Everything in Pro", "Custom branding", "API access", "Dedicated support"] },
                    ].map((plan) => (
                      <div
                        key={plan.name}
                        className={`p-4 rounded-lg border ${
                          plan.popular ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        {plan.popular && (
                          <Badge className="bg-primary text-primary-foreground mb-2">Most Popular</Badge>
                        )}
                        <h3 className="font-display font-bold text-foreground">{plan.name}</h3>
                        <p className="text-2xl font-bold text-foreground mt-2">
                          £{plan.price}<span className="text-sm text-muted-foreground">/mo</span>
                        </p>
                        <ul className="mt-4 space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="text-sm text-muted-foreground">✓ {feature}</li>
                          ))}
                        </ul>
                        <Button
                          className="w-full mt-4"
                          variant={plan.name === "Free" ? "outline" : "default"}
                        >
                          {plan.name === "Free" ? "Current Plan" : "Upgrade"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Account & Security Tab */}
            {selectedTab === "account" && (
              <div className="space-y-6">
                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground mb-6">Account Security</h2>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Password</p>
                        <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                      </div>
                      <Button variant="outline">Change Password</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline">Enable</Button>
                    </div>
                  </div>
                </div>

                <div className="card-elevated p-6">
                  <h2 className="font-display font-bold text-foreground text-destructive mb-4">Danger Zone</h2>
                  <p className="text-muted-foreground mb-4">
                    Permanently delete your account and all associated data.
                  </p>
                  <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground">
                    Delete Account
                  </Button>
                </div>

                <Button variant="outline" onClick={() => signOut()} className="w-full">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CoachSettings;
