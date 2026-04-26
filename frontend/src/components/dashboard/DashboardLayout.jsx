import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Key,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  Sparkles,
  Plus,
  Moon,
  HelpCircle,
  Users,
  CreditCard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import { chatAPI, analyticsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import SubscriptionModal from './SubscriptionModal';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { path: '/dashboard/chat', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard/knowledge', label: 'Knowledge Base', icon: Database },
  { path: '/dashboard/api-keys', label: 'API Keys', icon: Key },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/team', label: 'Team', icon: Users },
  { path: '/dashboard/help', label: 'Help & Support', icon: HelpCircle },
  { path: '/dashboard/profile', label: 'Settings & Billing', icon: Settings },
];

export default function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);
  const [usage, setUsage] = useState(null);
  
  const { user, company, logout } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chatRes = await chatAPI.getConversations();
        setRecentChats(chatRes.data.slice(0, 5));
        
        const usageRes = await analyticsAPI.getUsageWidget();
        setUsage(usageRes.data);
      } catch (error) {
        console.error('Failed to fetch sidebar data', error);
      }
    };
    if (company) fetchData();
  }, [company]);

  const handleNewChat = async () => {
    try {
      const res = await chatAPI.send({ message: "Hello", is_new: true }); // We actually have a POST /conversations endpoint but chatAPI doesn't expose it directly yet. Let's just navigate to /chat which handles new chats implicitly if no ID is selected.
      navigate('/dashboard/chat');
    } catch (error) {
      navigate('/dashboard/chat');
    }
  };

  const handleDarkModeToggle = () => {
    toast('Premium Aesthetic: Dark Mode is locked to On.', {
      icon: '✨',
      style: {
        background: '#18181b',
        color: '#fff',
        border: '1px solid #27272a'
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 top-0 left-0 h-full bg-dark-900/80 backdrop-blur-xl border-r border-white/5 transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl font-bold gradient-text"
            >
              RAONE
            </motion.span>
          )}
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => navigate('/dashboard/chat')}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-medium transition-all bg-white/5 hover:bg-white/10 text-white border border-white/10`}
          >
            <Plus className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Recent Chats */}
        {!collapsed && recentChats.length > 0 && (
          <div className="px-4 py-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recent</p>
            <div className="space-y-1">
              {recentChats.map(chat => (
                <NavLink
                  key={chat.id}
                  to={`/dashboard/chat?id=${chat.id}`}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                      isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{chat.title || 'New Conversation'}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-primary-500/15 text-primary-400 border border-primary-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Usage Widget */}
        {!collapsed && usage && usage.plan !== 'ultra_pro' && (
          <div className="px-5 py-3">
            <div className="flex justify-between items-center text-xs text-gray-400 mb-1.5">
              <span>Knowledge Base</span>
              <span>{usage.documents_count} / {usage.documents_limit}</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  (usage.documents_count / usage.documents_limit) > 0.8 ? 'bg-red-500' : 'bg-primary-500'
                }`}
                style={{ width: `${Math.min((usage.documents_count / usage.documents_limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Premium Upgrade Button */}
        <div className="px-4 py-2 mt-auto">
          <button
            onClick={() => setIsSubscriptionModalOpen(true)}
            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold transition-all ${
              company?.subscription_plan === 'free' || !company?.subscription_plan
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Sparkles className="w-5 h-5 flex-shrink-0" />
            {!collapsed && (
              <span>
                {company?.subscription_plan === 'pro' ? 'Pro Plan' : company?.subscription_plan === 'ultra_pro' ? 'Ultra Pro Plan' : 'Upgrade to Pro'}
              </span>
            )}
          </button>
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-white/5">
          {!collapsed && (
            <div className="px-4 py-3 mb-2">
              <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{company?.name}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="px-3 pb-3 border-b border-white/5">
          <button
            onClick={handleDarkModeToggle}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200 w-full"
          >
            <Moon className="w-5 h-5 flex-shrink-0 text-amber-400" />
            {!collapsed && (
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium text-sm">Dark Mode</span>
                <div className="w-8 h-4 bg-primary-500 rounded-full relative">
                  <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center p-2 m-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="h-16 bg-dark-900/50 backdrop-blur-xl border-b border-white/5 flex items-center px-6 gap-4">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            {(company?.subscription_plan === 'pro' || company?.subscription_plan === 'ultra_pro') ? (
              <div className="flex items-center pl-1 pr-3 py-1 gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_-3px_rgba(251,191,36,0.15)]">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                  {user?.full_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-400 tracking-wider">
                    {company?.subscription_plan === 'ultra_pro' ? 'ULTRA PRO' : 'PRO'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen} 
        onClose={() => setIsSubscriptionModalOpen(false)} 
      />
    </div>
  );
}
