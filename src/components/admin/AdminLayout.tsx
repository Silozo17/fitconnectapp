import { ReactNode, useState, useEffect } from "react";
import { flushSync } from "react-dom";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import PlatformBackground from "@/components/shared/PlatformBackground";
import MobileBottomNav from "@/components/navigation/MobileBottomNav";
import { MOBILE_NAV_CLOSE_EVENT } from "@/lib/mobile-nav";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Listen for global close event (e.g., from ViewSwitcher) and close immediately
  useEffect(() => {
    const handleCloseRequest = () => {
      flushSync(() => setMobileOpen(false));
    };
    window.addEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
    return () => window.removeEventListener(MOBILE_NAV_CLOSE_EVENT, handleCloseRequest);
  }, []);

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
