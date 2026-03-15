import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, 
  User, 
  Clock, 
  Activity,
  Navigation,
  RefreshCw,
  Signal,
  Wifi,
  Zap,
  History,
  X,
  ChevronRight
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Tracking() {
  const [techs, setTechs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  const loadHistory = async (userId: number) => {
    setLoadingHistory(true);
    try {
      const res = await fetchWithAuth(`/tracking/history/${userId}`);
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleShowHistory = (tech: any) => {
    setSelectedTech(tech);
    loadHistory(tech.user_id);
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
        <div className="lg:col-span-3 bg-white rounded-[3rem] overflow-hidden relative border border-blue-50 shadow-2xl shadow-blue-900/5 group z-0">
          <MapContainer 
            center={[-6.1015, 106.5085]} 
            zoom={13} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Office Marker */}
            <Marker position={[-6.1015, 106.5085]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800">Kantor Pusat</h3>
                  <p className="text-xs text-slate-500">Jambu Karya</p>
                </div>
              </Popup>
            </Marker>

            {/* Technician Markers */}
            {techs.map((tech) => {
              const iconHtml = `
                <div class="relative group/marker">
                  <div class="w-8 h-8 rounded-full border-4 border-white shadow-2xl flex items-center justify-center ${getStatusColor(tech.status)}"
                       style="transform: ${tech.heading !== null ? `rotate(${tech.heading}deg)` : 'none'}">
                    ${tech.heading !== null 
                      ? `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-navigation"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>` 
                      : `<div class="w-2 h-2 bg-white rounded-full"></div>`
                    }
                  </div>
                </div>
              `;
              
              const customIcon = L.divIcon({
                html: iconHtml,
                className: 'custom-leaflet-icon',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });

              return (
                <Marker 
                  key={tech.id} 
                  position={[tech.latitude, tech.longitude]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-bold text-slate-800">{tech.user_name.toUpperCase()}</h3>
                      <p className="text-xs text-slate-500">{tech.status}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Update: {new Date(tech.last_update).toLocaleTimeString()}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
          
          {/* Map Overlay Controls */}
          <div className="absolute top-8 left-8 flex flex-col space-y-3 z-[400]">
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

          <div className="absolute bottom-8 right-8 z-[400]">
            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-blue-50 flex flex-col space-y-2">
              <button 
                className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl text-primary font-black transition-colors"
                onClick={() => {
                  const map = document.querySelector('.leaflet-container') as any;
                  if (map && map._leaflet_id) {
                    const mapInstance = (window as any).L.Map._instances[map._leaflet_id];
                    if (mapInstance) mapInstance.zoomIn();
                  }
                }}
              >+</button>
              <div className="h-px bg-blue-50 mx-2" />
              <button 
                className="w-10 h-10 flex items-center justify-center hover:bg-blue-50 rounded-xl text-primary font-black transition-colors"
                onClick={() => {
                  const map = document.querySelector('.leaflet-container') as any;
                  if (map && map._leaflet_id) {
                    const mapInstance = (window as any).L.Map._instances[map._leaflet_id];
                    if (mapInstance) mapInstance.zoomOut();
                  }
                }}
              >-</button>
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
                <div 
                  key={tech.id} 
                  onClick={() => handleShowHistory(tech)}
                  className="p-5 rounded-[2rem] bg-blue-50/30 border border-blue-50 hover:border-primary/30 transition-all cursor-pointer group"
                >
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
                      <Navigation 
                        className="w-3 h-3 mr-1.5 text-primary transition-transform" 
                        style={{ transform: tech.heading !== null ? `rotate(${tech.heading}deg)` : 'none' }}
                      />
                      {tech.heading !== null ? `${Math.round(tech.heading)}°` : 'STAY'}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="w-3 h-3 mr-1.5 text-primary" />
                    UPDATE: {new Date(tech.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-blue-100 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AREA: {tech.area || 'KEMIRI'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <History className="w-3 h-3 text-primary" />
                      <span className="text-[8px] font-black text-primary uppercase tracking-widest">RIWAYAT</span>
                    </div>
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

      {/* History Modal */}
      {selectedTech && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-sm" onClick={() => setSelectedTech(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in duration-300">
            <div className="p-8 sanwanay-gradient text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black tracking-tight uppercase">RIWAYAT PERJALANAN</h3>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-1">{selectedTech.user_name} - 24 JAM TERAKHIR</p>
              </div>
              <button onClick={() => setSelectedTech(null)} className="p-3 bg-white/20 hover:bg-white/30 rounded-2xl transition-all">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Mengambil Riwayat...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tidak ada data riwayat</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((item, idx) => (
                    <div key={item.id} className="flex items-start space-x-4 relative">
                      {idx !== history.length - 1 && (
                        <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-blue-100" />
                      )}
                      <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-primary shrink-0 z-10">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="flex-1 bg-blue-50/30 rounded-3xl p-5 border border-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-primary-dark uppercase tracking-tight">
                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </span>
                          <div className="flex items-center space-x-2">
                            <Navigation 
                              className="w-3 h-3 text-primary" 
                              style={{ transform: item.heading !== null ? `rotate(${item.heading}deg)` : 'none' }}
                            />
                            <span className="text-[10px] font-black text-slate-400">{item.heading !== null ? `${Math.round(item.heading)}°` : '-'}</span>
                          </div>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          KOORDINAT: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50 border-t border-blue-100 flex justify-end">
              <button 
                onClick={() => setSelectedTech(null)}
                className="px-8 py-4 bg-white border border-blue-200 text-primary-dark text-xs font-black rounded-2xl hover:bg-white transition-all shadow-sm uppercase tracking-widest"
              >
                Tutup Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
