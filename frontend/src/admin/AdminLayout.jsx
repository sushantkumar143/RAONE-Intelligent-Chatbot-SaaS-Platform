import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Building2,
  LogOut,
  Shield,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/companies', label: 'Companies', icon: Building2 },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('raone_admin_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('raone_admin_token');
    localStorage.removeItem('raone_admin_user');
    navigate('/login');
  };

  return (
    <div className="h-screen bg-dark-950 flex overflow-hidden">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full w-64 bg-dark-900/80 backdrop-blur-xl border-r border-red-500/10 transition-all duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-red-500/10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col"
          >
            <span className="text-lg font-bold text-white">RAONE</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-red-400 font-bold">Admin Panel</span>
          </motion.div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Admin Info + Logout */}
        <div className="p-3 border-t border-red-500/10">
          <div className="px-4 py-3 mb-2">
            <p className="text-sm font-medium text-white truncate">{adminUser.username || 'Admin'}</p>
            <p className="text-xs text-red-400 truncate">Super Administrator</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 flex-shrink-0 bg-dark-900/50 backdrop-blur-xl border-b border-red-500/10 flex items-center px-6 gap-4 z-10">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 flex justify-center items-center">
            <span
              className="text-lg font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 hidden md:block"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Administration Console
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10">
            <Shield className="w-4 h-4 text-red-400" />
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">Admin</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
