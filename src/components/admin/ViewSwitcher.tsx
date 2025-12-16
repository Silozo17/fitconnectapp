import { useAdminView } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
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
        <SelectItem value="client">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-500" />
            <span>Client View</span>
          </div>
        </SelectItem>
        <SelectItem value="coach">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-orange-500" />
            <span>Coach View</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ViewSwitcher;
