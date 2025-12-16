import { useState } from "react";
import { useAdminView } from "@/contexts/AdminContext";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Shield, User, Briefcase, Check, Plus, Loader2 } from "lucide-react";
import CreateProfileModal from "./CreateProfileModal";

const ViewSwitcher = () => {
  const {
    activeProfileType,
    availableProfiles,
    setActiveProfile,
    isLoadingProfiles,
  } = useAdminView();
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [profileTypeToCreate, setProfileTypeToCreate] = useState<"client" | "coach">("client");

  const handleViewChange = (value: string) => {
    // Check if trying to create a new profile
    if (value === "create-client") {
      setProfileTypeToCreate("client");
      setCreateModalOpen(true);
      return;
    }
    if (value === "create-coach") {
      setProfileTypeToCreate("coach");
      setCreateModalOpen(true);
      return;
    }

    const viewMode = value as "admin" | "client" | "coach";
    const profileId = availableProfiles[viewMode] || null;

    setActiveProfile(viewMode, profileId);

    // Navigate to the appropriate dashboard
    switch (viewMode) {
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

  const handleProfileCreated = () => {
    // After creating a profile, switch to that view
    const profileId = availableProfiles[profileTypeToCreate];
    if (profileId) {
      setActiveProfile(profileTypeToCreate, profileId);
      navigate(`/dashboard/${profileTypeToCreate}`);
    }
  };

  if (isLoadingProfiles) {
    return (
      <div className="w-[180px] h-10 flex items-center justify-center bg-card border border-border rounded-md">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Select value={activeProfileType} onValueChange={handleViewChange}>
        <SelectTrigger className="w-[180px] bg-card border-border">
          <SelectValue placeholder="Select view" />
        </SelectTrigger>
        <SelectContent>
          {/* Admin View - Always available */}
          <SelectItem value="admin">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Admin View</span>
              {availableProfiles.admin && (
                <Check className="w-3 h-3 text-green-500 ml-auto" />
              )}
            </div>
          </SelectItem>

          {/* Coach View */}
          {availableProfiles.coach ? (
            <SelectItem value="coach">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500" />
                <span>Coach View</span>
                <Check className="w-3 h-3 text-green-500 ml-auto" />
              </div>
            </SelectItem>
          ) : (
            <SelectItem value="create-coach">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-orange-500/50" />
                <span className="text-muted-foreground">Coach View</span>
                <Plus className="w-3 h-3 text-muted-foreground ml-auto" />
              </div>
            </SelectItem>
          )}

          {/* Client View */}
          {availableProfiles.client ? (
            <SelectItem value="client">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span>Client View</span>
                <Check className="w-3 h-3 text-green-500 ml-auto" />
              </div>
            </SelectItem>
          ) : (
            <SelectItem value="create-client">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500/50" />
                <span className="text-muted-foreground">Client View</span>
                <Plus className="w-3 h-3 text-muted-foreground ml-auto" />
              </div>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <CreateProfileModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        profileType={profileTypeToCreate}
        onSuccess={handleProfileCreated}
      />
    </>
  );
};

export default ViewSwitcher;
