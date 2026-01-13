import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGymClassTypes } from "@/hooks/gym/useGymClasses";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Dumbbell,
  Clock,
  Users,
  CreditCard,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GymAdminClasses() {
  const { slug } = useParams<{ slug: string }>();
  const { data: classTypes, isLoading } = useGymClassTypes();

  const getDifficultyBadge = (level: string | null) => {
    switch (level) {
      case "beginner":
        return <Badge className="bg-green-100 text-green-800">Beginner</Badge>;
      case "intermediate":
        return <Badge className="bg-amber-100 text-amber-800">Intermediate</Badge>;
      case "advanced":
        return <Badge className="bg-red-100 text-red-800">Advanced</Badge>;
      case "all_levels":
        return <Badge variant="secondary">All Levels</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Class Types</h1>
          <p className="text-muted-foreground">
            Manage the types of classes you offer at your gym.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Class Type
        </Button>
      </div>

      {/* Class Types Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !classTypes || classTypes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No class types yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create your first class type to start scheduling classes.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add Class Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classTypes.map((classType) => (
            <Card key={classType.id} className="relative overflow-hidden">
              {/* Color accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: classType.color }}
              />
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${classType.color}20` }}
                    >
                      <Dumbbell
                        className="h-5 w-5"
                        style={{ color: classType.color }}
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{classType.name}</CardTitle>
                      {getDifficultyBadge(classType.difficulty_level)}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {classType.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {classType.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{classType.default_duration_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{classType.default_capacity} capacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{classType.credits_required} credit{classType.credits_required !== 1 ? "s" : ""}</span>
                  </div>
                </div>

                {classType.equipment_needed && classType.equipment_needed.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {classType.equipment_needed.slice(0, 3).map((item) => (
                      <Badge key={item} variant="outline" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                    {classType.equipment_needed.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{classType.equipment_needed.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {classType.requires_booking ? "Booking required" : "Drop-in allowed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Active</span>
                    <Switch checked={classType.is_active} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
