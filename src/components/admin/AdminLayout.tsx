import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import PlatformBackground from "@/components/shared/PlatformBackground";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <PlatformBackground showAmbientGlow={false} />
      <div className="h-dvh flex w-full overflow-hidden relative">
        <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
        <div className="flex-1 flex flex-col xl:ml-64 min-w-0 overflow-hidden">
          <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 pt-5 lg:p-6 lg:pt-7 pb-mobile-nav overflow-x-hidden overflow-y-auto mt-header-safe xl:mt-0">
            {children}
          </main>
        </div>
      </div>
      <MobileBottomNav variant="admin" />
    </>
  );
};

export default AdminLayout;
