import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  User, 
  Clock, 
  Activity,
  Navigation,
  RefreshCw,
  Signal,
  Wifi,
  Zap
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';

export default function Tracking() {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 10000); // Update every 10s as requested
    return () => clearInterval(interval);
  }, []);

  const loadTracking = async () => {
    setRefreshing(true);
    try {
      const res = await fetchWithAuth('/tracking');
      const data = await res.json();
      setTechs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Aktif': return 'bg-emerald-500';
      case 'On Site': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">LIVE TRACKING</h1>
          <p className="text-slate-500 font-medium">Monitoring posisi teknisi Sanwanay Network secara real-time</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest">SISTEM AKTIF</span>
          </div>
          
          <button 
            onClick={loadTracking}
            disabled={refreshing}
            className="p-4 bg-white border border-blue-100 rounded-2xl text-primary hover:bg-blue-50 transition-all shadow-sm flex items-center group"
          >
            <RefreshCw className={cn("w-5 h-5", refreshing && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8 min-h-0">
        {/* Map Section */}
        <div className="lg:col-span-3 bg-white rounded-[3rem] overflow-hidden relative border border-blue-50 shadow-2xl shadow-blue-900/5 group">
          {/* Map Placeholder / Google Maps Integration */}
          <div className="absolute inset-0 bg-blue-50/50 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Navigation className="w-10 h-10 text-primary animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                <Signal className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <h3 className="text-xl font-black text-primary-dark mb-3">GOOGLE MAPS: JAMBU KARYA</h3>
            <p className="text-sm font-medium text-slate-400 max-w-sm leading-relaxed">
              Monitoring area Rajeg & Jambu Karya. 
              Posisi Kantor: <code className="bg-blue-100 text-primary px-2 py-0.5 rounded font-black">-6.1015, 106.5085</code>
            </p>

            {/* Mock Markers with Animation */}
            {techs.map((tech, idx) => (
              <div 
                key={tech.id}
                className="absolute transition-all duration-[2000ms] ease-in-out"
                style={{ 
                  top: `${35 + (idx * 12)}%`, 
                  left: `${25 + (idx * 18)}%` 
                }}
              >
                <div className="relative group/marker">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-4 border-white shadow-2xl transition-transform group-hover/marker:scale-125",
                    getStatusColor(tech.status)
                  )}>
                    <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-current" />
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-white px-4 py-2 rounded-2xl shadow-xl text-[10px] font-black text-primary-dark whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-all translate-y-2 group-hover/marker:translate-y-0 border border-blue-50">
                    {tech.user_name.toUpperCase()}
                    <div className="text-[8px] text-slate-400 font-bold mt-0.5">{tech.status}</div>
                  </div>
                </div>
              </div>
            ))}
            
            {techs.length === 0 && !loading && (
              <div className="mt-8 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-blue-100 shadow-lg animate-bounce">
                <p className="text-xs font-black text-primary tracking-widest">TIDAK ADA TEKNISI AKTIF SAAT INI</p>
              </div>
            )}
          </div>
          
          {/* Map Overlay Controls */}
          <div className="absolute top-8 left-8 flex flex-col space-y-3">
            <div className="bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-xl border border-blue-50 flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Aktif</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-amber-500 rounded-full" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">On Site</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-8">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-blue-50 flex flex-col space-y-2">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl text-primary font-black transition-colors">+</button>
              <div className="h-px bg-blue-50 mx-2" />
              <button className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl text-primary font-black transition-colors">-</button>
            </div>
          </div>
        </div>

        {/* Tech List Sidebar */}
        <div className="bg-white rounded-[3rem] border border-blue-50 shadow-2xl shadow-blue-900/5 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-blue-50 sanwanay-gradient text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <h3 className="text-lg font-black tracking-tight relative z-10">DAFTAR TEKNISI</h3>
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mt-1 relative z-10">Status Lapangan</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data...</p>
              </div>
            ) : (
              techs.map((tech) => (
                <div key={tech.id} className="p-5 rounded-[2rem] bg-blue-50/30 border border-blue-50 hover:border-primary/30 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none">{tech.user_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{tech.role}</p>
                      </div>
                    </div>
                    <div className={cn("w-3 h-3 rounded-full shadow-sm", getStatusColor(tech.status))}>
                      <div className="w-full h-full rounded-full animate-ping opacity-20 bg-current" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-tighter">
                      <MapPin className="w-3 h-3 mr-1.5 text-primary" />
                      {tech.latitude.toFixed(3)}, {tech.longitude.toFixed(3)}
                    </div>
                    <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-tighter justify-end">
                      <Clock className="w-3 h-3 mr-1.5 text-primary" />
                      {new Date(tech.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AREA: {tech.area || 'KEMIRI'}</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border",
                      tech.status === 'Aktif' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                      tech.status === 'On Site' ? "text-amber-600 bg-amber-50 border-amber-100" : "text-slate-500 bg-slate-100 border-slate-200"
                    )}>
                      {tech.status}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {!loading && techs.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada teknisi aktif</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
