import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

export default function EmbedTimetable() {
  const { gymSlug } = useParams<{ gymSlug: string }>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });

  // Fetch gym by slug
  const { data: gym } = useQuery({
    queryKey: ["gym-by-slug", gymSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gym_profiles")
        .select("id, name, slug, logo_url, primary_color")
        .eq("slug", gymSlug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!gymSlug,
  });

  // Fetch classes
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["embed-classes", gym?.id, weekStart.toISOString()],
    queryFn: async () => {
      if (!gym?.id) return [];

      const { data, error } = await supabase
        .from("gym_classes")
        .select(`
          *,
          class_type:gym_class_types(name, color, description),
          instructor:gym_staff(display_name),
          location:gym_locations(name)
        `)
        .eq("gym_id", gym.id)
        .eq("status", "scheduled")
        .gte("start_time", weekStart.toISOString())
        .lte("start_time", weekEnd.toISOString())
        .order("start_time");

      if (error) throw error;
      return data;
    },
    enabled: !!gym?.id,
  });

  const goToPreviousWeek = () => setSelectedDate(addDays(selectedDate, -7));
  const goToNextWeek = () => setSelectedDate(addDays(selectedDate, 7));
  const goToToday = () => setSelectedDate(new Date());

  // Group classes by day
  const classesByDay: Record<string, typeof classes> = {};
  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayKey = format(day, "yyyy-MM-dd");
    classesByDay[dayKey] = classes.filter(
      (c) => format(new Date(c.start_time), "yyyy-MM-dd") === dayKey
    );
  }

  if (!gym) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 bg-background min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {gym.logo_url && (
            <img src={gym.logo_url} alt={gym.name} className="h-8 w-8 rounded" />
          )}
          <h1 className="text-lg font-bold">{gym.name} - Class Schedule</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
      </p>

      {/* Timetable Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Loading classes...</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => {
            const day = addDays(weekStart, i);
            const dayKey = format(day, "yyyy-MM-dd");
            const dayClasses = classesByDay[dayKey] || [];
            const isToday = format(new Date(), "yyyy-MM-dd") === dayKey;

            return (
              <div key={dayKey} className="min-h-[200px]">
                <div
                  className={`text-center p-2 rounded-t font-medium text-sm ${
                    isToday ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <div>{format(day, "EEE")}</div>
                  <div className="text-xs">{format(day, "d")}</div>
                </div>
                <div className="border border-t-0 rounded-b p-1 space-y-1 min-h-[150px]">
                  {dayClasses.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No classes
                    </div>
                  ) : (
                    dayClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="p-2 rounded text-xs"
                        style={{
                          backgroundColor: cls.class_type?.color || "#e5e7eb",
                          color: "#000",
                        }}
                      >
                        <div className="font-medium">{cls.class_type?.name}</div>
                        <div>{format(new Date(cls.start_time), "h:mm a")}</div>
                        {cls.instructor && (
                          <div className="text-xs opacity-75">
                            {cls.instructor.display_name}
                          </div>
                        )}
                        {cls.capacity && (
                          <div className="text-xs opacity-75">
                            {cls.booked_count || 0}/{cls.capacity} spots
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <a
          href={`/club/${gym.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          Book classes at {gym.name} →
        </a>
      </div>
    </div>
  );
}
