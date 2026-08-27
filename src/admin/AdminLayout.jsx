import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

/**
 * AdminLayout — Wraps all /admin/* routes.
 * Uses its own Sidebar instead of the public Navbar/Footer.
 */
export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-surface-950">
      <AdminSidebar />
      <main className="ml-48 flex-1 min-w-0 p-6 lg:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
