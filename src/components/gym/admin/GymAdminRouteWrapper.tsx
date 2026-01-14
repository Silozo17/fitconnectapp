import React from "react";
import { useParams, Outlet } from "react-router-dom";
import { GymProvider } from "@/contexts/GymContext";
import { GymAdminLayout } from "./GymAdminLayout";

/**
 * Wrapper component that provides GymProvider context for all gym admin routes.
 * This ensures useGym hook works correctly within GymAdminLayout and child pages.
 * Used as a layout route element - renders GymAdminLayout which contains Outlet.
 */
export function GymAdminRouteWrapper() {
  const { gymId } = useParams<{ gymId: string }>();
  
  return (
    <GymProvider initialGymId={gymId}>
      <GymAdminLayout />
    </GymProvider>
  );
}
