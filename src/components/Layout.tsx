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
  Wifi
} from 'lucide-react';
import { cn, fetchWithAuth } from '../lib/utils';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
  key?: string | number;
}

const SidebarItem = ({ icon: Icon, label, active, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-6 py-4 text-sm font-bold transition-all rounded-2xl mb-2",
      active 
        ? "bg-white/20 text-white shadow-lg backdrop-blur-md" 
        : "text-white/70 hover:bg-white/10 hover:text-white"
    )}
  >
    <Icon className="w-5 h-5 mr-4" />
    {label}
  </button>
);

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }: any) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-update location for technicians
  useEffect(() => {
    if (user?.role === 'Teknisi' || user?.role === 'Engineer') {
      const updateLocation = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            try {
              await fetchWithAuth('/tracking/update', {
                method: 'POST',
                body: JSON.stringify({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude
                })
              });
            } catch (error) {
              console.error('Failed to auto-update location:', error);
            }
          });
        }
      };

      updateLocation(); // Initial update
      const interval = setInterval(updateLocation, 60000); // Update every 1 minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'NOC', 'Manager'] },
    { id: 'attendance', label: 'Absensi', icon: UserCheck, roles: ['Admin', 'NOC', 'Manager', 'Teknisi', 'Engineer'] },
    { id: 'tickets', label: 'Tiket Gangguan', icon: Ticket, roles: ['Admin', 'NOC', 'Teknisi', 'Engineer'] },
    { id: 'tracking', label: 'Live Tracking', icon: MapIcon, roles: ['Admin', 'NOC', 'Manager'] },
    { id: 'employees', label: 'Data Karyawan', icon: Users, roles: ['Admin'] },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  });

  return (
    <div className="flex h-screen bg-[#F0F7FF] overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-primary-dark/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 sanwanay-gradient text-white transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-8 flex items-center space-x-4 border-b border-white/10">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Wifi className="w-7 h-7 text-[#00AEEF]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter leading-none">SANWANAY</h1>
              <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Network Solution</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => (
              <SidebarItem
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={activeTab === item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
              />
            ))}
          </nav>

          <div className="p-6 border-t border-white/10">
            <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-sm">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                  <User className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-black truncate">{user?.name}</p>
                  <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={onLogout}
                className="flex items-center justify-center w-full py-4 text-xs font-black text-primary-dark bg-white rounded-2xl transition-all hover:bg-opacity-90 shadow-xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                KELUAR APLIKASI
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Navbar */}
        <header className="flex items-center justify-between px-8 h-20 bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-40">
          <div className="flex items-center">
            <button 
              className="p-2 mr-4 text-primary lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-black text-primary-dark uppercase tracking-tight">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <button className="p-3 bg-blue-50 text-primary rounded-2xl hover:bg-blue-100 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-sm font-black text-slate-800">{user?.name}</p>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{user?.role}</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
