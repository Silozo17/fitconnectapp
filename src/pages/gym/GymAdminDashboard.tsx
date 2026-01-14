import { useGym } from "@/contexts/GymContext";
import { OwnerDashboard, ManagerDashboard, StaffDashboard } from "@/components/gym/admin/dashboards";

export default function GymAdminDashboard() {
  const { userRole } = useGym();

  // Render dashboard based on role
  switch (userRole) {
    case "owner":
    case "area_manager":
      return <OwnerDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "coach":
    case "marketing":
    case "staff":
    default:
      return <StaffDashboard />;
  }
}
