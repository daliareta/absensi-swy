import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { fetchWithAuth, cn } from '../lib/utils';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, subtitle }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center text-[10px] font-bold px-2 py-1 rounded-full",
          trend === 'up' ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-xs font-medium mb-1">{title}</h3>
    <div className="flex items-baseline space-x-1">
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {subtitle && <span className="text-xs font-medium text-slate-400">{subtitle}</span>}
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const statsRes = await fetchWithAuth('/stats');
        const statsData = await statsRes.json();
        setStats(statsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const chartData = [
    { name: 'Sen', hadir: 4 },
    { name: 'Sel', hadir: 3 },
    { name: 'Rab', hadir: 4 },
    { name: 'Kam', hadir: 2 },
    { name: 'Jum', hadir: 4 },
    { name: 'Sab', hadir: 0 },
    { name: 'Min', hadir: 0 },
  ];

  const pieData = [
    { name: 'Hadir', value: 0, color: '#10b981' },
    { name: 'Terlambat', value: 0, color: '#f59e0b' },
    { name: 'Tidak Hadir', value: 4, color: '#ef4444' },
    { name: 'Cuti', value: 0, color: '#3b82f6' },
  ];

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <Activity className="w-10 h-10 text-blue-500 animate-pulse" />
      <p className="text-sm font-medium text-slate-500">Memuat Dashboard...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Admin</h1>
          <p className="text-slate-500 text-sm mt-1">Selamat datang! Berikut ringkasan kehadiran dan statistik lengkap</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-emerald-700">Live Dashboard</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard 
          title="Total Karyawan" 
          value="4" 
          icon={Users} 
          color="bg-blue-50 text-blue-600"
          trend="up"
          trendValue="+5%"
          subtitle="orang"
        />
        <StatCard 
          title="Hadir Hari Ini" 
          value="0" 
          icon={CheckCircle2} 
          color="bg-emerald-50 text-emerald-600"
          trend="up"
          trendValue="+2%"
          subtitle="orang"
        />
        <StatCard 
          title="Terlambat" 
          value="0" 
          icon={Clock} 
          color="bg-amber-50 text-amber-600"
          trend="down"
          trendValue="-1%"
          subtitle="orang"
        />
        <StatCard 
          title="Tidak Hadir" 
          value="4" 
          icon={XCircle} 
          color="bg-rose-50 text-rose-600"
          trend="down"
          trendValue="-3%"
          subtitle="orang"
        />
        <StatCard 
          title="Cuti" 
          value="0" 
          icon={Calendar} 
          color="bg-purple-50 text-purple-600"
          subtitle="orang"
        />
        <StatCard 
          title="Alert Keamanan" 
          value="0" 
          icon={ShieldAlert} 
          color="bg-slate-100 text-slate-600"
          subtitle="alert"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-base font-bold text-slate-800">Tren Kehadiran 7 Hari Terakhir</h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Minggu Ini</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="hadir" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-6">Status Hari Ini</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Aktivitas Terkini
            </h3>
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Hari Ini</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-800">15 karyawan sudah absen masuk</p>
                <p className="text-xs text-slate-500 mt-1">2 menit lalu</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-800">3 karyawan terlambat</p>
                <p className="text-xs text-slate-500 mt-1">15 menit lalu</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-800">GPS tracking aktif untuk 12 karyawan</p>
                <p className="text-xs text-slate-500 mt-1">30 menit lalu</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 mt-2 rounded-full bg-purple-500 mr-4" />
              <div>
                <p className="text-sm font-medium text-slate-800">Face recognition berhasil 98%</p>
                <p className="text-xs text-slate-500 mt-1">1 jam lalu</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
              Metrik Performa
            </h3>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-full">Bulan Ini</span>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Tingkat Kehadiran</span>
                <span className="font-bold text-emerald-600">96.5%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '96.5%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Ketepatan Waktu</span>
                <span className="font-bold text-blue-600">84.2%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '84.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Produktivitas</span>
                <span className="font-bold text-purple-600">88.7%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Kepuasan Karyawan</span>
                <span className="font-bold text-amber-600">92.1%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '92.1%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
