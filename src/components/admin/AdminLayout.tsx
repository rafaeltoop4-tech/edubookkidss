import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar />
      <main className="flex-1 p-4 md:p-6 overflow-auto pt-16 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
}
