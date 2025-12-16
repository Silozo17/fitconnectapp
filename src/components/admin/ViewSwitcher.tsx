import { useEffect } from "react";
import { useAdminView } from "@/contexts/AdminContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User, Briefcase } from "lucide-react";

const ViewSwitcher = () => {
  const { viewMode, setViewMode } = useAdminView();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync viewMode with current route
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/admin")) {
      setViewMode("admin");
    } else if (path.startsWith("/dashboard/coach")) {
      setViewMode("coach");
    } else if (path.startsWith("/dashboard/client")) {
      setViewMode("client");
    }
  }, [location.pathname, setViewMode]);

  const handleViewChange = (value: "admin" | "client" | "coach") => {
    setViewMode(value);
    
    // Navigate to the appropriate dashboard
    switch (value) {
      case "admin":
        navigate("/dashboard/admin");
        break;
      case "client":
        navigate("/dashboard/client");
        break;
      case "coach":
        navigate("/dashboard/coach");
        break;
    }
  };

  return (
    <Select value={viewMode} onValueChange={handleViewChange}>
      <SelectTrigger className="w-[180px] bg-card border-border">
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Admin View</span>
          </div>
        </SelectItem>
        <SelectItem value="coach">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-500" />
            <span>Coach View</span>
          </div>
        </SelectItem>
        <SelectItem value="client">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span>Client View</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ViewSwitcher;
