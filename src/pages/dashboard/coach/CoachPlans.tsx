import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Dumbbell,
  Apple,
  Copy,
  Edit,
  Trash2,
  Users,
  Clock,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

// Mock data
const workoutPlans = [
  { 
    id: "1", 
    name: "Beginner Full Body", 
    type: "workout", 
    duration: "4 weeks", 
    level: "Beginner",
    assignedTo: 8,
    exercises: 24,
    createdAt: "Nov 15, 2024"
  },
  { 
    id: "2", 
    name: "Advanced Strength", 
    type: "workout", 
    duration: "8 weeks", 
    level: "Advanced",
    assignedTo: 5,
    exercises: 48,
    createdAt: "Oct 20, 2024"
  },
  { 
    id: "3", 
    name: "HIIT Fat Burner", 
    type: "workout", 
    duration: "6 weeks", 
    level: "Intermediate",
    assignedTo: 12,
    exercises: 36,
    createdAt: "Sep 10, 2024"
  },
  { 
    id: "4", 
    name: "Boxing Conditioning", 
    type: "workout", 
    duration: "4 weeks", 
    level: "Intermediate",
    assignedTo: 3,
    exercises: 20,
    createdAt: "Dec 1, 2024"
  },
];

const nutritionPlans = [
  { 
    id: "5", 
    name: "Weight Loss Plan", 
    type: "nutrition", 
    duration: "12 weeks", 
    calories: "1800 kcal",
    assignedTo: 6,
    meals: 21,
    createdAt: "Nov 1, 2024"
  },
  { 
    id: "6", 
    name: "Muscle Building", 
    type: "nutrition", 
    duration: "8 weeks", 
    calories: "2800 kcal",
    assignedTo: 4,
    meals: 28,
    createdAt: "Oct 15, 2024"
  },
  { 
    id: "7", 
    name: "Maintenance Diet", 
    type: "nutrition", 
    duration: "Ongoing", 
    calories: "2200 kcal",
    assignedTo: 10,
    meals: 14,
    createdAt: "Sep 20, 2024"
  },
];

const templates = [
  { id: "t1", name: "5x5 Strength Program", category: "Strength", downloads: 156 },
  { id: "t2", name: "Push Pull Legs Split", category: "Hypertrophy", downloads: 234 },
  { id: "t3", name: "Couch to 5K", category: "Cardio", downloads: 89 },
  { id: "t4", name: "Keto Meal Plan", category: "Nutrition", downloads: 312 },
];

const CoachPlans = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout title="Training Plans" description="Create and manage your training and nutrition plans.">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Training Plans</h1>
          <p className="text-muted-foreground">Create, manage, and assign workout and nutrition plans</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/coach/plans/new">
            <Button className="bg-primary text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{workoutPlans.length}</p>
              <p className="text-sm text-muted-foreground">Workout Plans</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <Apple className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{nutritionPlans.length}</p>
              <p className="text-sm text-muted-foreground">Nutrition Plans</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">
                {[...workoutPlans, ...nutritionPlans].reduce((acc, plan) => acc + plan.assignedTo, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Active Assignments</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Copy className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-foreground">{templates.length}</p>
              <p className="text-sm text-muted-foreground">Templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workout" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="workout">Workout Plans</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition Plans</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Workout Plans Tab */}
        <TabsContent value="workout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutPlans.map((plan) => (
              <div key={plan.id} className="card-elevated p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Assign</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{plan.level}</Badge>
                  <Badge variant="outline">{plan.duration}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3" /> {plan.exercises} exercises
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {plan.assignedTo}
                  </span>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <Link to="/dashboard/coach/plans/new">
              <div className="card-elevated p-6 border-2 border-dashed border-border hover:border-primary/50 transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">Create New Plan</p>
                <p className="text-sm text-muted-foreground">Build a custom workout plan</p>
              </div>
            </Link>
          </div>
        </TabsContent>

        {/* Nutrition Plans Tab */}
        <TabsContent value="nutrition">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nutritionPlans.map((plan) => (
              <div key={plan.id} className="card-elevated p-6 hover-lift">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                    <Apple className="w-6 h-6 text-success" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                      <DropdownMenuItem><Copy className="w-4 h-4 mr-2" /> Duplicate</DropdownMenuItem>
                      <DropdownMenuItem><Users className="w-4 h-4 mr-2" /> Assign</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive"><Trash2 className="w-4 h-4 mr-2" /> Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline">{plan.calories}</Badge>
                  <Badge variant="outline">{plan.duration}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Apple className="w-3 h-3" /> {plan.meals} meals
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" /> {plan.assignedTo}
                  </span>
                </div>
              </div>
            ))}

            {/* Create New Card */}
            <Link to="/dashboard/coach/plans/new?type=nutrition">
              <div className="card-elevated p-6 border-2 border-dashed border-border hover:border-success/50 transition-colors flex flex-col items-center justify-center min-h-[200px] cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-success" />
                </div>
                <p className="font-medium text-foreground">Create Nutrition Plan</p>
                <p className="text-sm text-muted-foreground">Build a custom meal plan</p>
              </div>
            </Link>
          </div>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <div className="card-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Popular Templates</h3>
              <p className="text-sm text-muted-foreground">Start with a proven template and customize</p>
            </div>
            <div className="divide-y divide-border">
              {templates.map((template) => (
                <div key={template.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      template.category === 'Nutrition' ? 'bg-success/10' : 'bg-primary/10'
                    }`}>
                      {template.category === 'Nutrition' ? (
                        <Apple className="w-5 h-5 text-success" />
                      ) : (
                        <Dumbbell className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{template.name}</p>
                      <p className="text-sm text-muted-foreground">{template.category} • {template.downloads} uses</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Use Template</Button>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default CoachPlans;
