import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Ticket, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  MapPin,
  Activity
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { fetchWithAuth, cn } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-900/5 hover:scale-[1.02] transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-4 rounded-2xl shadow-lg", color)}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest",
            trend === 'up' ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"
          )}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline space-x-2 mt-1">
        <p className="text-4xl font-black text-primary-dark">{value}</p>
        {subtitle && <span className="text-xs font-bold text-slate-400">{subtitle}</span>}
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsRes, ticketsRes] = await Promise.all([
          fetchWithAuth('/stats'),
          fetchWithAuth('/tickets')
        ]);
        
        const statsData = await statsRes.json();
        const ticketsData = await ticketsRes.json();
        
        setStats(statsData);
        setRecentTickets(ticketsData.slice(0, 5));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const chartData = [
    { name: 'Sen', tickets: 12, attendance: 15 },
    { name: 'Sel', tickets: 19, attendance: 14 },
    { name: 'Rab', tickets: 15, attendance: 16 },
    { name: 'Kam', tickets: 22, attendance: 18 },
    { name: 'Jum', tickets: 30, attendance: 17 },
    { name: 'Sab', tickets: 10, attendance: 8 },
    { name: 'Min', tickets: 5, attendance: 4 },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Activity className="w-12 h-12 text-primary animate-pulse" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Menyiapkan Dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">DASHBOARD UTAMA</h1>
          <p className="text-slate-500 font-medium">Selamat datang di Panel Kontrol Sanwanay Network</p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-6 py-3 rounded-2xl shadow-sm border border-blue-50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span className="text-xs font-black text-primary-dark uppercase tracking-widest">Sistem Online</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          title="Teknisi Aktif" 
          value={stats?.activeTechs || 0} 
          icon={Users} 
          color="sanwanay-gradient"
          trend="up"
          trendValue="12%"
          subtitle="Orang"
        />
        <StatCard 
          title="Absensi Hari Ini" 
          value={stats?.todayAttendance || 0} 
          icon={Clock} 
          color="bg-amber-500"
          trend="up"
          trendValue="5%"
          subtitle="Hadir"
        />
        <StatCard 
          title="Tiket Open" 
          value={stats?.openTickets || 0} 
          icon={Ticket} 
          color="bg-rose-500"
          trend="down"
          trendValue="8%"
          subtitle="Kasus"
        />
        <StatCard 
          title="Tiket Selesai" 
          value={(stats?.totalTickets || 0) - (stats?.openTickets || 0)} 
          icon={CheckCircle2} 
          color="bg-emerald-500"
          subtitle="Selesai"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-900/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-primary-dark tracking-tight">PERFORMA TIKET</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Statistik Mingguan</p>
            </div>
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Area type="monotone" dataKey="tickets" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorTickets)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-900/5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black text-primary-dark tracking-tight">KEHADIRAN TIM</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Partisipasi Harian</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-primary rounded-full"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hadir</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                />
                <Bar dataKey="attendance" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-[2.5rem] border border-blue-50 shadow-xl shadow-blue-900/5 overflow-hidden">
        <div className="p-8 border-b border-blue-50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-primary-dark tracking-tight uppercase">Tiket Terbaru</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Aktivitas perbaikan terkini</p>
          </div>
          <button className="px-6 py-3 bg-blue-50 text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            LIHAT SEMUA
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-blue-50/30">
                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">Pelanggan</th>
                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">Masalah & Area</th>
                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">Prioritas</th>
                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-primary uppercase tracking-widest">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {recentTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-primary font-black shadow-inner">
                        {ticket.customer_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-black text-slate-800 text-sm">{ticket.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {ticket.customer_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm text-slate-700 font-bold">{ticket.problem_type}</div>
                    <div className="flex items-center text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {ticket.area || 'KEMIRI'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      ticket.priority === 'High' ? "bg-rose-50 text-rose-600 border-rose-100" : 
                      ticket.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-primary border-blue-100"
                    )}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        ticket.status === 'Selesai' ? "bg-emerald-500" : "bg-primary animate-pulse"
                      )} />
                      <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{ticket.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-400">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
