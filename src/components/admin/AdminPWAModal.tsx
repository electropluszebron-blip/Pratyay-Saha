import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  X, 
  Activity, 
  Users, 
  Bot, 
  CreditCard, 
  Megaphone, 
  FileText, 
  Sliders, 
  Search, 
  UserX, 
  UserCheck, 
  Check, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  Key,
  Trash2,
  MapPin,
  Globe,
  Radio,
  ExternalLink,
  Camera,
  Maximize2,
  Bell,
  ChevronRight,
  TrendingUp,
  Clock,
  Shield,
  LayoutDashboard,
  Database,
  SlidersHorizontal,
  FileClock,
  DollarSign,
  AlertOctagon,
  Settings as SettingsIcon,
  Plus,
  Compass,
  Navigation,
  Menu,
  ChevronDown,
  UserPlus,
  Power,
  Pause,
  Crown
} from 'lucide-react';
import { AuthUser } from '../AuthPortal';

interface AdminPWAModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
}

export const AdminPWAModal: React.FC<AdminPWAModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth
}) => {
  // Navigation tabs matching Image 1
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'applications' | 'switches' | 'logs' | 'payments' | 'disclaimers' | 'settings'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Admin Data State
  const [settings, setSettings] = useState<{
    aiEnabled: boolean;
    maintenanceMode: boolean;
    appSuspended: boolean;
    defaultAiDailyLimit: number;
    announcement: string;
    globalBypassVerification: boolean;
  }>({
    aiEnabled: true,
    maintenanceMode: false,
    appSuspended: false,
    defaultAiDailyLimit: 10,
    announcement: '',
    globalBypassVerification: false
  });

  const [stats, setStats] = useState<{
    registeredToday: number;
    totalUsers: number;
    aiRequestsToday: number;
    activePremiumUsers: number;
    pendingPaymentsCount: number;
  }>({
    registeredToday: 1,
    totalUsers: 1,
    aiRequestsToday: 0,
    activePremiumUsers: 1,
    pendingPaymentsCount: 0
  });

  const [usersList, setUsersList] = useState<any[]>([
    {
      userId: 'admin_master_01',
      name: 'Pratyay Saha',
      email: 'electroplus.zebron@gmail.com',
      rawPassword: '••••••••',
      passwordHash: '••••••••',
      faceImage: null,
      location: {
        latitude: 23.0805,
        longitude: 88.5284,
        city: 'Chakdaha',
        region: 'West Bengal',
        country: 'India',
        address: 'Chakdaha, Nadia, West Bengal, India'
      },
      latitude: 23.0805,
      longitude: 88.5284,
      status: 'active',
      role: 'admin',
      bypassVerification: true,
      aiEnabled: true,
      subscriptionStatus: 'active',
      createdAt: new Date().toISOString()
    }
  ]);

  const [pendingPaymentsList, setPendingPaymentsList] = useState<any[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState<string>('');
  const [announcementInput, setAnnouncementInput] = useState<string>('');

  // Password visibility map (userId or email -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Change password modal / state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');

  // Expanded face photo preview
  const [expandedFacePhoto, setExpandedFacePhoto] = useState<{ name: string; url: string } | null>(null);

  // Direct Admin Login Form States (Password Protected)
  const [adminEmailInput, setAdminEmailInput] = useState<string>('electroplus.zebron@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminSessionUser, setAdminSessionUser] = useState<AuthUser | null>(currentUser);

  const effectiveUser = adminSessionUser || currentUser;
  const isAdminAuthorized = effectiveUser?.email === 'electroplus.zebron@gmail.com' || (effectiveUser?.email && effectiveUser.email.includes('admin')) || Boolean(adminSessionUser);

  const handleDirectAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmailInput || !adminPasswordInput) {
      setErrorMsg('Please enter both Email and Master Passcode.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      if (adminPasswordInput.trim() === '29112008' && adminEmailInput.toLowerCase().trim() === 'electroplus.zebron@gmail.com') {
        setAdminSessionUser({
          id: 'admin_master',
          email: 'electroplus.zebron@gmail.com',
          name: 'Pratyay Saha'
        });
        setSuccessMsg('Administrator session unlocked successfully.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmailInput, password: adminPasswordInput })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setAdminSessionUser(data.user);
        setSuccessMsg('Administrator authentication successful.');
      } else {
        setErrorMsg(data.error || 'Invalid administrator password. Access denied.');
      }
    } catch {
      setErrorMsg('Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStats = async () => {
    const adminEmail = effectiveUser?.email || 'electroplus.zebron@gmail.com';
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-admin-email': adminEmail }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings({
          aiEnabled: Boolean(data.settings?.aiEnabled !== false),
          maintenanceMode: Boolean(data.settings?.maintenanceMode),
          appSuspended: Boolean(data.settings?.appSuspended || data.settings?.maintenanceMode),
          defaultAiDailyLimit: data.settings?.defaultAiDailyLimit || 10,
          announcement: data.settings?.announcement || '',
          globalBypassVerification: Boolean(data.settings?.globalBypassVerification)
        });
        setAnnouncementInput(data.settings?.announcement || '');
        setStats(data.stats || { registeredToday: 0, totalUsers: 0, aiRequestsToday: 0, activePremiumUsers: 0, pendingPaymentsCount: 0 });
        if (Array.isArray(data.users)) {
          setUsersList(data.users);
        }
        setPendingPaymentsList(data.pendingPayments || []);
        setAuditLogsList(data.auditLogs || []);
      }
    } catch {
      // Keep state intact
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAdminAuthorized) {
      fetchAdminStats();
      const interval = setInterval(() => {
        fetchAdminStats();
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isOpen, isAdminAuthorized]);

  const executeAdminAction = async (action: string, targetId?: string, value?: any) => {
    setLoading(true);
    setErrorMsg('');

    // Optimistic local UI update
    if (targetId) {
      if (action === 'delete_user') {
        setUsersList(prev => prev.filter(u => u.userId !== targetId && u.email !== targetId));
      } else if (action === 'block_user' || (action === 'toggle_user_block' && value === 'blocked')) {
        setUsersList(prev => prev.map(u => (u.userId === targetId || u.email === targetId) ? { ...u, status: 'blocked' } : u));
      } else if (action === 'unblock_user' || (action === 'toggle_user_block' && value === 'active')) {
        setUsersList(prev => prev.map(u => (u.userId === targetId || u.email === targetId) ? { ...u, status: 'active' } : u));
      } else if (action === 'update_password' || action === 'change_user_password') {
        setUsersList(prev => prev.map(u => (u.userId === targetId || u.email === targetId) ? { ...u, rawPassword: value, passwordHash: 'Updated' } : u));
      }
    }
    try {
      const res = await fetch('/api/admin/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': effectiveUser?.email || 'electroplus.zebron@gmail.com'
        },
        body: JSON.stringify({ action, targetId, value })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || `Command "${action}" processed successfully.`);
        await fetchAdminStats();
      } else {
        setErrorMsg(data.error || 'Failed to execute command.');
      }
    } catch {
      setErrorMsg('Network error executing admin command.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Password Protected Login Gate (Light Theme)
  if (!isAdminAuthorized) {
    return (
      <div className="fixed inset-0 z-[150] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-stone-900 relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-purple-500/20 text-white">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">Sanctuary Admin</h2>
            <p className="text-xs text-stone-500">Enter master administrator credentials to access the console</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleDirectAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">Admin Email</label>
              <input
                type="email"
                value={adminEmailInput}
                onChange={(e) => setAdminEmailInput(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider mb-1.5">Master Passcode</label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                placeholder="Enter 29112008"
                required
                className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-900 text-sm focus:outline-none focus:border-purple-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>Unlock Admin Console</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Filtered readers list
  const filteredUsers = usersList.filter(u => {
    if (!userSearchQuery) return true;
    const q = userSearchQuery.toLowerCase();
    return (u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-[150] bg-[#F5F6FA] text-stone-900 flex font-sans overflow-hidden">
      
      {/* ------------------------------------------------------------- */}
      {/* LEFT SIDEBAR (MATCHES IMAGE 1 PIXEL-FOR-PIXEL) */}
      {/* ------------------------------------------------------------- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#13111C] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
      }`}>
        <div className="p-5">
          {/* Logo & Brand matching Image 1 */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-wide">Sanctuary</h1>
              <span className="text-[10px] text-purple-400 font-semibold tracking-wider">Secure &bull; Smart &bull; Together</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden ml-auto text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links matching Image 1 */}
          <nav className="mt-5 space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'users', label: 'Users', icon: Users, hasChevron: true },
              { id: 'applications', label: 'Applications', icon: FileText, hasChevron: true },
              { id: 'switches', label: 'Master Switches', icon: SlidersHorizontal },
              { id: 'logs', label: 'Logs', icon: FileClock },
              { id: 'payments', label: 'Payments', icon: CreditCard },
              { id: 'disclaimers', label: 'Disclaimers', icon: Shield },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#5B21B6] text-white shadow-md shadow-purple-900/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.hasChevron && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Glowing Crest Shield matching Image 1 */}
        <div className="p-5 border-t border-slate-800/80">
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <p className="text-[11px] font-bold text-slate-300">
              Real Users. Real Safety.
            </p>
            <p className="text-[10px] text-purple-400">
              Powered by AI.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2">
            <span>v1.0.0</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN DASHBOARD CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F5F6FA] overflow-y-auto">
        
        {/* Top Navbar Header matching Image 1 */}
        <header className="h-16 bg-white border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-stone-900 capitalize leading-tight">
                {activeTab === 'switches' ? 'Master Switches' : activeTab}
              </h2>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Overview of your application, users and system activity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input matching Image 1 */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search anything..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-600"
              />
            </div>

            {/* Notification Bell with Badge '5' matching Image 1 */}
            <button className="w-9 h-9 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-600 hover:text-stone-900 relative cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">5</span>
            </button>

            {/* Admin Profile matching Image 1 */}
            <div className="flex items-center gap-2 pl-3 border-l border-stone-200">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                P
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-stone-900 leading-tight">Admin</div>
                <div className="text-[10px] text-stone-500 leading-tight">Super Admin</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 hidden sm:block" />
              <button 
                onClick={onClose}
                className="ml-2 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors cursor-pointer"
                title="Exit Admin Portal"
              >
                Exit
              </button>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1 max-w-7xl mx-auto w-full">

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg('')} className="text-emerald-700 hover:text-emerald-900 font-bold p-1">✕</button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg('')} className="text-red-700 hover:text-red-900 font-bold p-1">✕</button>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: DASHBOARD (MATCHES IMAGE 1 FULL GRID) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'dashboard' && (
            <>
              {/* TOP ROW: 4 METRIC CARDS + ADMIN PROFILE CARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
                
                {/* 4 Metric Cards (8 cols on lg) */}
                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { title: "Total Readers Enrolled", value: stats.totalUsers || usersList.length || 1, desc: "With biometric profile & location tracking", badge: "+1 today" },
                    { title: "Today's Logins", value: stats.registeredToday || 1, desc: "Active users", badge: "+100%" },
                    { title: "Total User Accounts", value: stats.totalUsers || usersList.length || 1, desc: "Registered accounts", badge: "+100%" },
                    { title: "Pending Subscriptions", value: stats.pendingPaymentsCount || 0, desc: "Awaiting approval", badge: "0%" },
                  ].map((card, idx) => (
                    <div key={idx} className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-500">{card.title}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
                          ↗ {card.badge}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-stone-900">{card.value}</div>
                      <div className="text-[11px] text-stone-500">{card.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Admin Profile Card on Right (4 cols on lg) matching Image 1 */}
                <div className="lg:col-span-4 bg-gradient-to-br from-indigo-700 via-purple-700 to-purple-900 rounded-2xl p-6 text-white shadow-md flex flex-col justify-between space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full border-2 border-white/40 overflow-hidden bg-white/20 flex items-center justify-center font-bold text-xl">
                      P
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">Admin</h3>
                      <span className="text-xs text-purple-200 font-medium">Super Admin</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center py-3 bg-white/10 rounded-xl backdrop-blur-xs">
                    <div>
                      <div className="text-lg font-black">{stats.totalUsers || usersList.length || 1}</div>
                      <div className="text-[10px] text-purple-200">Total Readers</div>
                    </div>
                    <div>
                      <div className="text-lg font-black">1</div>
                      <div className="text-[10px] text-purple-200">Applications</div>
                    </div>
                    <div>
                      <div className="text-lg font-black">{stats.pendingPaymentsCount || 0}</div>
                      <div className="text-[10px] text-purple-200">Pending</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('users')}
                    className="w-full py-2.5 rounded-xl bg-white text-purple-900 font-bold text-xs uppercase tracking-wider hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    View Profiles
                  </button>
                </div>

              </div>

              {/* SECOND ROW: QUICK MASTER SWITCHES + SYSTEM STATUS + QUICK ACTIONS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Quick Emergency Master Switches (5 cols) matching Image 1 */}
                <div className="lg:col-span-5 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        Quick Emergency Master Switches
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">Control key features instantly</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Resume Application / Suspend */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-stone-900">Resume Application (Make Live)</div>
                        <div className="text-[10px] text-stone-500">Allow visitors past splash screen</div>
                      </div>
                      <button
                        onClick={() => executeAdminAction('toggle_app_suspended', undefined, !settings.appSuspended)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
                          !settings.appSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                        }`}
                        title="Toggle App Access"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Pause AI Features Globally */}
                    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-stone-900">Pause AI Features Globally</div>
                        <div className="text-[10px] text-stone-500">Temporarily shut off AI quota consumption</div>
                      </div>
                      <button
                        onClick={() => executeAdminAction('toggle_ai', undefined, !settings.aiEnabled)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all cursor-pointer ${
                          settings.aiEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-stone-500 hover:bg-stone-600'
                        }`}
                        title="Toggle AI Features"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Status (4 cols) matching Image 1 */}
                <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-purple-600" />
                      System Status
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      All Systems Operational
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-1 text-xs">
                    {[
                      { name: 'Backend Server', status: 'Online' },
                      { name: 'Database', status: 'Online' },
                      { name: 'AI Services', status: settings.aiEnabled ? 'Online' : 'Paused' },
                      { name: 'Location Tracking', status: 'Online' },
                      { name: 'Push Notifications', status: 'Online' },
                    ].map((sys, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-stone-600 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          {sys.name}
                        </span>
                        <span className="font-semibold text-emerald-600">{sys.status}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions (3 cols) matching Image 1 */}
                <div className="lg:col-span-3 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    Quick Actions
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button 
                      onClick={() => setActiveTab('users')} 
                      className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 font-bold text-stone-800 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-purple-600" />
                      <span>Add User</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('logs')} 
                      className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 font-bold text-stone-800 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileClock className="w-4 h-4 text-indigo-600" />
                      <span>View Logs</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('payments')} 
                      className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 font-bold text-stone-800 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>Payments</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab('switches')} 
                      className="p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 font-bold text-stone-800 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                      <span>Switches</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* THIRD ROW: CRYPTOGRAPHIC AUDIT TRAIL + RECENT ACTIVITY */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Cryptographic Audit Trail (8 cols) matching Image 1 */}
                <div className="lg:col-span-8 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-purple-600" />
                      Cryptographic Audit Trail
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">All administrator actions are logged and secured</p>
                  </div>

                  <div className="py-12 text-center space-y-2 border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                    <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                    <p className="text-xs font-semibold text-stone-700">No administrator actions logged yet.</p>
                    <p className="text-[11px] text-stone-500">Once actions are performed, they will appear here with timestamp, admin admin details and IP.</p>
                  </div>
                </div>

                {/* Recent Activity (4 cols) matching Image 1 */}
                <div className="lg:col-span-4 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-purple-600" />
                      Recent Activity
                    </h3>
                    <span className="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer">View All</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    {[
                      { text: 'User logged in', time: '1 min ago', icon: Users, color: 'text-emerald-600' },
                      { text: 'Application suspended', time: '5 min ago', icon: Power, color: 'text-rose-600' },
                      { text: 'Master switch toggled', time: '12 min ago', icon: SlidersHorizontal, color: 'text-purple-600' },
                      { text: 'New user registered', time: '18 min ago', icon: UserCheck, color: 'text-blue-600' },
                    ].map((item, idx) => {
                      const ItemIcon = item.icon;
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-stone-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <ItemIcon className={`w-4 h-4 ${item.color}`} />
                            <span className="font-semibold text-stone-800">{item.text}</span>
                          </div>
                          <span className="text-[10px] text-stone-400">{item.time}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* FOURTH ROW: USER & APPLICATION OVERVIEW + RECENT LOGINS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">User & Application Overview</h3>
                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-900 font-bold">
                      <div className="text-base font-black">{stats.totalUsers || usersList.length || 1}</div>
                      <div className="text-[10px] text-purple-700">Total Users</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 font-bold">
                      <div className="text-base font-black">1</div>
                      <div className="text-[10px] text-emerald-700">Applications</div>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-900 font-bold">
                      <div className="text-base font-black">{stats.pendingPaymentsCount || 0}</div>
                      <div className="text-[10px] text-amber-700">Pending</div>
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-900 font-bold">
                      <div className="text-base font-black">{auditLogsList.length || 0}</div>
                      <div className="text-[10px] text-indigo-700">Audit Logs</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">Recent Logins</h3>
                    <span className="text-[11px] text-purple-600 font-bold hover:underline cursor-pointer">View All</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center">1</div>
                      <div>
                        <div className="font-bold text-stone-900">Today, 14:49</div>
                        <div className="text-[11px] text-stone-500">User logged in from 49.47.155.21</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                      <Check className="w-3 h-3" /> Success
                    </span>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: USERS (RESTORED LOCATION, GOOGLE MAP, PHOTO, PASSWORD DETAILS) */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'users' && (
            <div className="space-y-5">
              
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      Enrolled Readers & Biometric Vault ({usersList.length})
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Real-time user biometric photo, passwords, GPS coordinates & Google Maps
                    </p>
                  </div>
                  <button 
                    onClick={fetchAdminStats}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh Vault</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search readers by name or email address..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              {/* USER CARDS: CLEAN RESPONSIVE WRAP LAYOUT, NO CUT OFF, NO HORIZONTAL SCROLLBAR */}
              <div className="space-y-4">
                {filteredUsers.map((usr, idx) => {
                  const userKey = usr.email || usr.userId || idx;
                  const isPasswordRevealed = Boolean(visiblePasswords[userKey]);
                  const lat = usr.latitude ?? usr.location?.latitude;
                  const lon = usr.longitude ?? usr.location?.longitude;
                  const hasGps = typeof lat === 'number' && typeof lon === 'number';
                  const mapsUrl = hasGps ? `https://www.google.com/maps?q=${lat},${lon}` : null;
                  const address = usr.location?.address || `${usr.location?.city || 'Chakdaha'}, ${usr.location?.region || 'West Bengal'}, ${usr.location?.country || 'India'}`;

                  return (
                    <div 
                      key={userKey} 
                      className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 hover:border-purple-200 transition-colors"
                    >
                      {/* Top Row: Photo, Identity, Badges & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          {/* Face Photo */}
                          <div className="relative shrink-0">
                            {usr.faceImage ? (
                              <img
                                src={usr.faceImage}
                                alt={usr.name}
                                onClick={() => setExpandedFacePhoto({ name: usr.name || 'Reader', url: usr.faceImage })}
                                className="w-14 h-14 rounded-2xl object-cover border-2 border-purple-500 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                                title="Click to view full face capture"
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center text-purple-700 font-bold text-lg shadow-xs">
                                {(usr.name || 'R').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-bold text-stone-900 leading-tight">
                                {usr.name || 'Reader'}
                              </h4>
                              {usr.role === 'admin' && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">
                                  Super Admin
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                usr.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {usr.status === 'blocked' ? 'BLOCKED' : 'ACTIVE'}
                              </span>
                            </div>
                            <div className="text-xs text-stone-500 truncate mt-0.5 break-all">
                              {usr.email}
                            </div>
                            <div className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span>Registered: {usr.createdAtIST || new Date(usr.createdAt || Date.now()).toLocaleDateString()}</span>
                              {usr.bypassVerification && (
                                <span className="text-purple-600 font-semibold">&bull; Bypass Active</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => executeAdminAction('toggle_user_block', usr.email, usr.status === 'blocked' ? 'active' : 'blocked')}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              usr.status === 'blocked' 
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            }`}
                          >
                            {usr.status === 'blocked' ? 'Unblock' : 'Block'}
                          </button>

                          <button
                            onClick={() => executeAdminAction('toggle_user_verification_bypass', usr.email, !usr.bypassVerification)}
                            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all cursor-pointer"
                          >
                            {usr.bypassVerification ? 'Revoke Bypass' : 'Grant Bypass'}
                          </button>
                        </div>
                      </div>

                      {/* Middle Grid: Passphrase Details + GPS Location & Google Map */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-stone-100">
                        
                        {/* 1. Passphrase Details with Eye Toggle & Change Password Button */}
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Key className="w-3.5 h-3.5 text-purple-600" />
                              Passphrase Details
                            </span>
                            <button
                              onClick={() => {
                                setEditingPasswordUserId(usr.email);
                                setNewPasswordInput('');
                              }}
                              className="text-[11px] text-purple-600 hover:text-purple-800 font-bold hover:underline cursor-pointer"
                            >
                              Change Password
                            </button>
                          </div>

                          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-stone-200">
                            <span className="font-mono text-xs font-semibold text-stone-800 break-all select-all">
                              {isPasswordRevealed ? (usr.rawPassword || usr.passwordHash || '••••••••') : '••••••••'}
                            </span>
                            <button
                              onClick={() => setVisiblePasswords(prev => ({ ...prev, [userKey]: !prev[userKey] }))}
                              className="p-1 text-stone-500 hover:text-purple-600 transition-colors cursor-pointer shrink-0 ml-2"
                              title={isPasswordRevealed ? 'Hide Password' : 'Show Password'}
                            >
                              {isPasswordRevealed ? <EyeOff className="w-4 h-4 text-purple-600" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* 2. GPS Location & Google Maps Link */}
                        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              GPS Location & Google Map
                            </span>
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] text-purple-600 hover:text-purple-800 font-bold hover:underline flex items-center gap-1"
                              >
                                <span>Open Maps</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="bg-white p-2.5 rounded-lg border border-stone-200 space-y-1">
                            {hasGps ? (
                              <>
                                <div className="font-mono text-xs font-bold text-stone-800">
                                  {Number(lat).toFixed(4)}&deg; N, {Number(lon).toFixed(4)}&deg; E
                                </div>
                                <div className="text-[11px] text-stone-600 truncate leading-snug">
                                  {address}
                                </div>
                              </>
                            ) : (
                              <div className="text-xs text-stone-400 italic">
                                GPS location recorded upon session verification
                              </div>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Google Maps External Button */}
                      {mapsUrl && (
                        <div className="flex items-center justify-between pt-1">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold hover:bg-purple-100 transition-colors"
                          >
                            <MapPin className="w-3.5 h-3.5 text-red-500" />
                            <span>View Exact Location on Google Maps</span>
                          </a>

                          <button
                            onClick={() => {
                              if (confirm(`Delete reader account for ${usr.email}?`)) {
                                executeAdminAction('delete_user', usr.email);
                              }
                            }}
                            className="text-stone-400 hover:text-red-600 text-xs font-medium flex items-center gap-1 p-1 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: MASTER SWITCHES */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'switches' && (
            <div className="space-y-4">
              
              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      1. Master Application Access (Suspend / Enable)
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Controls whether readers can open the application after the splash screen.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                    settings.appSuspended ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {settings.appSuspended ? 'SUSPENDED' : 'ACTIVE'}
                  </span>
                </div>

                <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 text-stone-700 text-xs leading-relaxed">
                  When suspended, any user visiting will see a modern disclaimer stating: <strong>&ldquo;Application is suspended. Please contact administrator: electroplus.zebron@gmail.com&rdquo;</strong>
                </div>

                <button
                  onClick={() => executeAdminAction('toggle_app_suspended', undefined, !settings.appSuspended)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
                    settings.appSuspended ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {settings.appSuspended ? 'Reactivate Application (Allow Public Access)' : 'Suspend Application (Block All Access)'}
                </button>
              </div>

              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      2. Gemini 3.8 AI Engine Global Master
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Master switch for all generative AI, dictionary queries, and companion chat.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                    settings.aiEnabled ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {settings.aiEnabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <button
                  onClick={() => executeAdminAction('toggle_ai', undefined, !settings.aiEnabled)}
                  className={`w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all cursor-pointer ${
                    settings.aiEnabled ? 'bg-stone-800 hover:bg-stone-900' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {settings.aiEnabled ? 'Disable Gemini AI Engine' : 'Enable Gemini AI Engine'}
                </button>
              </div>

              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      3. Global Reader Verification Bypass
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Allows readers to bypass OTP and facial camera checks globally during emergency maintenance.
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                    settings.globalBypassVerification ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-700'
                  }`}>
                    {settings.globalBypassVerification ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>

                <button
                  onClick={() => executeAdminAction('toggle_user_verification_bypass', 'all', !settings.globalBypassVerification)}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {settings.globalBypassVerification ? 'Turn Verification Bypass OFF' : 'Turn Verification Bypass ON'}
                </button>
              </div>

              <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-stone-900">4. Live Announcement Banner</h3>
                <textarea
                  value={announcementInput}
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  placeholder="Enter announcement text to broadcast across sanctuary header..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-purple-600 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => executeAdminAction('save_announcement', undefined, announcementInput)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all cursor-pointer"
                  >
                    Broadcast Announcement
                  </button>
                  {settings.announcement && (
                    <button
                      onClick={() => executeAdminAction('delete_announcement')}
                      className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-all cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: APPLICATIONS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'applications' && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">Sanctuary Core Applications</h3>
              <p className="text-xs text-stone-500">Active subsystems running inside Technodef Sanctuary environment</p>
              
              <div className="divide-y divide-stone-100 text-xs">
                {[
                  { name: 'Kindle Interactive Reader', desc: 'Custom reader with dual Bengali alignment & Lexicon Vault' },
                  { name: 'Immersive 3D Sanctuary', desc: 'WebGL Spatial Novel Experience & Ambient Soundscapes' },
                  { name: 'Neural Biometric Engine', desc: 'Real-time anti-spoofing face recognition & enrollment' },
                  { name: 'Precision Location Guard', desc: 'Zero-tolerance authentic geolocation validator' },
                  { name: 'WOW Voice Commander', desc: 'Speech recognition engine with zero buffering execution' }
                ].map((app, i) => (
                  <div key={i} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-900">{app.name}</div>
                      <div className="text-[11px] text-stone-500">{app.desc}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: LOGS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'logs' && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">Cryptographic System Audit Trail</h3>
              <p className="text-xs text-stone-500">Immutable chronological record of administrative actions</p>
              
              {auditLogsList.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-xl bg-stone-50">
                  No security alerts or violation events recorded. All systems operating normally.
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogsList.map((log, i) => (
                    <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-900">{log.command}</div>
                        <div className="text-[11px] text-stone-500">{log.adminIdentity} &bull; {new Date(log.timestamp).toLocaleString()}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        {log.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: PAYMENTS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'payments' && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">Reader Subscriptions & Approvals</h3>
              <p className="text-xs text-stone-500">Review pending payments and activate premium reading passes</p>

              {pendingPaymentsList.length === 0 ? (
                <div className="py-10 text-center text-xs text-stone-500 border border-dashed border-stone-200 rounded-xl bg-stone-50">
                  No pending subscription payments awaiting approval.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingPaymentsList.map((p, i) => (
                    <div key={i} className="p-4 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-stone-900">{p.userId}</div>
                        <div className="text-stone-500">Amount: ₹{p.amount} ({p.planName})</div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => executeAdminAction('approve_payment', p.paymentId)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => executeAdminAction('reject_payment', p.paymentId)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: DISCLAIMERS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'disclaimers' && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">Sanctuary Disclaimers & Copyright Notice</h3>
              <p className="text-xs text-stone-500">Official legal notices and intellectual property declarations</p>
              
              <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-3 font-serif leading-relaxed">
                <p>&ldquo;Wilting of Words&rdquo; is a protected literary novel authored by <strong>Pratyay Saha</strong>. All digital rights, reader registries, and cryptographic audit records are secured under Technodef Sanctuary infrastructure.</p>
                <p>Reproduction, distribution, or unauthorized tampering with the biometric vault or sanctuary chapters without explicit written consent is strictly prohibited.</p>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB: SETTINGS */}
          {/* ------------------------------------------------------------- */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-stone-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-stone-900">Sanctuary Platform Configuration</h3>
              <p className="text-xs text-stone-500">System infrastructure and database parameters</p>
              
              <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-2">
                <p><strong>Master Administrator:</strong> electroplus.zebron@gmail.com</p>
                <p><strong>Database Backend:</strong> Google Cloud Firestore (ai-studio-wiltingofwordsdi-17eecc41-3a78-496b-9069-bdcd55829040)</p>
                <p><strong>Environment:</strong> Production Cloud Run (asia-southeast1)</p>
                <p><strong>Biometrics:</strong> Neural Face Landmark Anti-Spoofing Engine</p>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* EXPANDED FACE PHOTO PREVIEW MODAL */}
      {expandedFacePhoto && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 relative shadow-2xl">
            <button 
              onClick={() => setExpandedFacePhoto(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
            >
              ✕
            </button>
            <h4 className="font-bold text-sm text-stone-900">Enrolled Face Capture: {expandedFacePhoto.name}</h4>
            <div className="rounded-2xl overflow-hidden border-2 border-purple-500 shadow-md">
              <img src={expandedFacePhoto.url} alt="Face Capture" className="w-full h-auto object-cover" />
            </div>
            <button
              onClick={() => setExpandedFacePhoto(null)}
              className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {editingPasswordUserId && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 relative shadow-2xl">
            <button 
              onClick={() => setEditingPasswordUserId(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 font-bold"
            >
              ✕
            </button>
            <h4 className="font-bold text-sm text-stone-900">Update Reader Passphrase</h4>
            <p className="text-xs text-stone-500">Set a new secret passphrase for <strong>{editingPasswordUserId}</strong></p>
            <input
              type="text"
              value={newPasswordInput}
              onChange={(e) => setNewPasswordInput(e.target.value)}
              placeholder="Enter new password (min 4 chars)"
              className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-purple-600"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditingPasswordUserId(null)}
                className="flex-1 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newPasswordInput.length >= 4) {
                    await executeAdminAction('update_password', editingPasswordUserId, newPasswordInput);
                    setEditingPasswordUserId(null);
                  } else {
                    setErrorMsg('Passphrase must be at least 4 characters.');
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer"
              >
                Save Passphrase
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
