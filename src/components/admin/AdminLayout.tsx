import { ReactNode, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-dvh bg-background flex w-full overflow-hidden">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col xl:ml-64 min-w-0 overflow-hidden">
        <AdminHeader onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 pb-24 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
