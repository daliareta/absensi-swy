import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  UserCheck, 
  Ticket, 
  Map as MapIcon, 
  LogOut, 
  Menu, 
  X,
  Bell,
  User,
  Users,
  ShieldCheck,
  Calendar,
  FileText,
  Briefcase,
  PenTool,
  Image,
  Clock,
  HardHat,
  Package,
  DollarSign,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn, fetchWithAuth } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick?: () => void;
  hasSubmenu?: boolean;
  isOpen?: boolean;
  isSubmenu?: boolean;
  key?: React.Key;
}

const SidebarItem = ({ icon: Icon, label, active, onClick, hasSubmenu, isOpen, isSubmenu }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-4 py-3 text-sm font-medium transition-all rounded-xl mb-1",
      isSubmenu ? "pl-11 py-2 text-xs" : "",
      active 
        ? "bg-blue-50 text-blue-600" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    )}
  >
    {!isSubmenu && <Icon className={cn("w-5 h-5 mr-3", active ? "text-blue-600" : "text-slate-400")} />}
    <span className="flex-1 text-left">{label}</span>
    {hasSubmenu && (
      isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />
    )}
  </button>
);

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'kehadiran': true,
  });

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }));
  };

  // Auto-update location for technicians (Stealth Mode)
  useEffect(() => {
    if (user?.role === 'Teknisi' || user?.role === 'Engineer') {
      let watchId: number;

      const startTracking = () => {
        if ("geolocation" in navigator) {
          watchId = navigator.geolocation.watchPosition(
            async (position) => {
              try {
                await fetchWithAuth('/tracking/update', {
                  method: 'POST',
                  body: JSON.stringify({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    heading: position.coords.heading
                  })
                });
              } catch (e) {
                // Silent fail to stay stealthy
              }
            },
            () => {}, // Silent error
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 10000
            }
          );
        }
      };

      startTracking();

      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          if (watchId) navigator.geolocation.clearWatch(watchId);
          startTracking();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        if (watchId) navigator.geolocation.clearWatch(watchId);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user]);

  const menuStructure = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'NOC', 'Manager'] },
    { 
      id: 'kehadiran', 
      label: 'Kehadiran', 
      icon: UserCheck, 
      roles: ['Admin', 'NOC', 'Manager', 'Teknisi', 'Engineer'],
      submenus: [
        { id: 'attendance', label: 'Absensi Barcode' },
        { id: 'employees', label: 'Karyawan' },
        { id: 'shifts', label: 'Jadwal Shift' },
        { id: 'absensi_list', label: 'Data Absensi' },
        { id: 'timesheet', label: 'Timesheet' },
      ]
    },
    { id: 'tracking', label: 'Live Tracking', icon: MapIcon, roles: ['Admin', 'NOC', 'Manager'], badge: 'Live' },
    { 
      id: 'dokumen', 
      label: 'Surat & Dokumen', 
      icon: FileText, 
      roles: ['Admin', 'Manager'],
      submenus: [
        { id: 'calendar', label: 'Google Calendar' },
        { id: 'survey', label: 'Survey' },
        { id: 'serah_terima', label: 'Serah Terima' },
        { id: 'arsip', label: 'Arsip Surat Menyurat' },
      ]
    },
    { 
      id: 'crm', 
      label: 'Sales & CRM', 
      icon: Briefcase, 
      roles: ['Admin', 'Manager'],
      submenus: [
        { id: 'lead', label: 'Lead Management' },
        { id: 'proyek', label: 'Proyek' },
        { id: 'katalog', label: 'Katalog Listing' },
      ]
    },
    { id: 'tickets', label: 'Tiket & Pemasangan', icon: Ticket, roles: ['Admin', 'NOC', 'Teknisi', 'Engineer'] },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center space-x-3 border-b border-slate-100">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 leading-tight">Aplikasi Absensi</h1>
            <p className="text-[10px] font-medium text-slate-500">Berbasis AI</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto custom-scrollbar">
          {menuStructure.map((item) => {
            if (item.roles && !item.roles.includes(user?.role)) return null;

            if (item.submenus) {
              const isOpen = openMenus[item.id];
              const isActive = item.submenus.some(sub => activeTab === sub.id) || activeTab === item.id;
              
              return (
                <div key={item.id} className="mb-1">
                  <SidebarItem
                    icon={item.icon}
                    label={item.label}
                    hasSubmenu
                    isOpen={isOpen}
                    active={isActive && !isOpen}
                    onClick={() => toggleMenu(item.id)}
                  />
                  {isOpen && (
                    <div className="mt-1 mb-2 space-y-1">
                      {item.submenus.map(sub => (
                        <SidebarItem
                          key={sub.id}
                          icon={User} // Not used for submenu
                          label={sub.label}
                          isSubmenu
                          active={activeTab === sub.id}
                          onClick={() => {
                            setActiveTab(sub.id);
                            setIsSidebarOpen(false);
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="relative">
                <SidebarItem
                  icon={item.icon}
                  label={item.label}
                  active={activeTab === item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                />
                {item.badge && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-40">
          <div className="flex items-center">
            <button 
              className="p-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-800">
              {menuStructure.find(i => i.id === activeTab)?.label || 
               menuStructure.flatMap(i => i.submenus || []).find(s => s.id === activeTab)?.label || 
               'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-700 leading-none">{user?.name}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-1">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
