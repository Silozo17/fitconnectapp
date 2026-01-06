import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, startOfDay, format } from "date-fns";

interface ClientQuickViewData {
  profile: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
  };
  healthStats: {
    avgSteps: number;
    avgSleep: number;
    avgHeartRate: number;
    avgCalories: number;
  };
  readiness: {
    score: number;
    level: string;
  } | null;
  training: {
    totalWorkouts: number;
    totalMinutes: number;
    logs: Array<{
      id: string;
      name: string;
      date: string;
      duration: number;
    }>;
  };
  nutrition: {
    avgCalories: number;
    mealsLogged: number;
  };
  progress: {
    latestWeight: number | null;
    weightChange: number | null;
    latestPhoto: string | null;
  };
}

export function useClientQuickViewData(clientId: string | null) {
  return useQuery({
    queryKey: ["client-quick-view", clientId],
    queryFn: async (): Promise<ClientQuickViewData | null> => {
      if (!clientId) return null;

      const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
      const today = new Date();

      // Fetch all data in parallel
      const [
        profileResult,
        healthDataResult,
        trainingResult,
        nutritionResult,
        progressResult,
      ] = await Promise.all([
        // Client profile
        supabase
          .from("client_profiles")
          .select("id, first_name, last_name, avatar_url")
          .eq("id", clientId)
          .single(),

        // Health data (last 7 days)
        supabase
          .from("health_data_sync")
          .select("*")
          .eq("client_id", clientId)
          .gte("recorded_at", sevenDaysAgo.toISOString())
          .lte("recorded_at", today.toISOString()),

        // Training logs (last 7 days)
        supabase
          .from("training_logs")
          .select("id, workout_name, logged_at, duration_minutes")
          .eq("client_id", clientId)
          .gte("logged_at", sevenDaysAgo.toISOString())
          .order("logged_at", { ascending: false }),

        // Food diary (last 7 days)
        supabase
          .from("food_diary")
          .select("id, calories, meal_type, logged_at")
          .eq("client_id", clientId)
          .gte("logged_at", sevenDaysAgo.toISOString()),

        // Progress entries (most recent)
        supabase
          .from("client_progress")
          .select("weight_kg, photo_urls, recorded_at")
          .eq("client_id", clientId)
          .order("recorded_at", { ascending: false })
          .limit(2),
      ]);

      if (profileResult.error || !profileResult.data) {
        throw new Error("Failed to fetch client profile");
      }

      // Process health data for averages
      const healthData = healthDataResult.data || [];
      const stepEntries = healthData.filter((d) => d.data_type === "steps");
      const sleepEntries = healthData.filter((d) => d.data_type === "sleep");
      const heartRateEntries = healthData.filter((d) => d.data_type === "heart_rate");
      const caloriesEntries = healthData.filter((d) => d.data_type === "calories_burned");

      const avgSteps = stepEntries.length > 0
        ? Math.round(stepEntries.reduce((sum, d) => sum + (d.value || 0), 0) / stepEntries.length)
        : 0;
      const avgSleep = sleepEntries.length > 0
        ? Math.round((sleepEntries.reduce((sum, d) => sum + (d.value || 0), 0) / sleepEntries.length) * 10) / 10
        : 0;
      const avgHeartRate = heartRateEntries.length > 0
        ? Math.round(heartRateEntries.reduce((sum, d) => sum + (d.value || 0), 0) / heartRateEntries.length)
        : 0;
      const avgCalories = caloriesEntries.length > 0
        ? Math.round(caloriesEntries.reduce((sum, d) => sum + (d.value || 0), 0) / caloriesEntries.length)
        : 0;

      // Calculate readiness (simplified version)
      let readiness: { score: number; level: string } | null = null;
      if (sleepEntries.length > 0 || heartRateEntries.length > 0) {
        const sleepScore = avgSleep >= 7 ? 90 : avgSleep >= 6 ? 70 : 50;
        const hrScore = avgHeartRate > 0 && avgHeartRate < 70 ? 85 : avgHeartRate < 80 ? 70 : 55;
        const score = Math.round((sleepScore + hrScore) / 2);
        readiness = {
          score,
          level: score >= 80 ? "optimal" : score >= 60 ? "moderate" : "low",
        };
      }

      // Training summary
      const trainingLogs = trainingResult.data || [];
      const training = {
        totalWorkouts: trainingLogs.length,
        totalMinutes: trainingLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
        logs: trainingLogs.slice(0, 5).map((l) => ({
          id: l.id,
          name: l.workout_name || "Workout",
          date: l.logged_at,
          duration: l.duration_minutes || 0,
        })),
      };

      // Nutrition summary
      const nutritionData = nutritionResult.data || [];
      const nutrition = {
        avgCalories: nutritionData.length > 0
          ? Math.round(nutritionData.reduce((sum, d) => sum + (d.calories || 0), 0) / 7)
          : 0,
        mealsLogged: nutritionData.length,
      };

      // Progress
      const progressData = progressResult.data || [];
      const latestProgress = progressData[0];
      const previousProgress = progressData[1];
      const progress = {
        latestWeight: latestProgress?.weight_kg || null,
        weightChange: latestProgress?.weight_kg && previousProgress?.weight_kg
          ? Math.round((latestProgress.weight_kg - previousProgress.weight_kg) * 10) / 10
          : null,
        latestPhoto: latestProgress?.photo_urls?.[0] || null,
      };

      return {
        profile: {
          id: profileResult.data.id,
          firstName: profileResult.data.first_name,
          lastName: profileResult.data.last_name,
          avatarUrl: profileResult.data.avatar_url,
        },
        healthStats: {
          avgSteps,
          avgSleep,
          avgHeartRate,
          avgCalories,
        },
        readiness,
        training,
        nutrition,
        progress,
      };
    },
    enabled: !!clientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
