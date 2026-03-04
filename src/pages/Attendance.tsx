import React, { useState, useEffect } from 'react';
import { 
  Scan, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  History,
  LogOut,
  QrCode,
  User,
  Wifi
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';
import QRScanner from '../components/QRScanner';
import { QRCodeSVG } from 'qrcode.react';

export default function Attendance() {
  const [user, setUser] = useState<any>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [status, setStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [scanType, setScanType] = useState<'Masuk' | 'Pulang'>('Masuk');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const res = await fetchWithAuth('/attendance');
      const data = await res.json();
      setAttendanceData(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleScan = async (tech_id: string) => {
    setShowScanner(false);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const res = await fetchWithAuth('/attendance/scan', {
        method: 'POST',
        body: JSON.stringify({
          tech_id,
          type: scanType,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: data.message });
        loadAttendance();
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'Terjadi kesalahan server atau GPS' });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Status Alert */}
      {status && (
        <div className={cn(
          "p-6 rounded-3xl flex items-center space-x-4 shadow-xl animate-in slide-in-from-top-4",
          status.type === 'success' ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
        )}>
          {status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          <p className="text-sm font-black">{status.message}</p>
          <button onClick={() => setStatus(null)} className="ml-auto text-[10px] font-black uppercase opacity-50 hover:opacity-100">Tutup</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Action Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            
            {user?.role === 'Admin' || user?.role === 'NOC' ? (
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Scan className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-black text-primary-dark">SCAN TEKNISI</h2>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">Pilih tipe absen lalu scan QR Code yang ada di HP teknisi/karyawan untuk verifikasi kehadiran.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setScanType('Masuk')}
                    className={cn(
                      "py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all border-2",
                      scanType === 'Masuk' 
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                        : "bg-white border-blue-100 text-slate-400 hover:border-primary/30"
                    )}
                  >
                    ABSEN MASUK
                  </button>
                  <button
                    onClick={() => setScanType('Pulang')}
                    className={cn(
                      "py-4 rounded-2xl font-black text-[10px] tracking-widest transition-all border-2",
                      scanType === 'Pulang' 
                        ? "bg-primary-dark border-primary-dark text-white shadow-lg shadow-primary-dark/30" 
                        : "bg-white border-blue-100 text-slate-400 hover:border-primary-dark/30"
                    )}
                  >
                    ABSEN PULANG
                  </button>
                </div>

                <button
                  onClick={() => setShowScanner(true)}
                  className="w-full py-5 sanwanay-gradient text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
                >
                  <QrCode className="w-5 h-5" />
                  <span>BUKA KAMERA SCAN</span>
                </button>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary-dark uppercase tracking-tight">{user?.name}</h2>
                  <p className="text-[10px] font-black text-primary tracking-widest uppercase mt-1">
                    {user?.specialization} • {user?.area}
                  </p>
                </div>
                
                <div className="p-6 bg-white rounded-[2rem] border-4 border-blue-50 shadow-inner">
                  <QRCodeSVG 
                    value={user?.id?.toString() || ''} 
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="text-slate-500 text-xs font-bold px-4 leading-relaxed">
                  Tunjukkan QR Code ini kepada Admin untuk melakukan absensi masuk atau pulang.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden h-full">
            <div className="p-8 border-b border-blue-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-black text-primary-dark">RIWAYAT TERBARU</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50/30">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Karyawan</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Waktu</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {attendanceData.length > 0 ? attendanceData.map((item, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-black text-xs">
                            {item.user_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800">{item.user_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">ID: {item.user_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-slate-600">{item.date}</p>
                        <p className="text-[10px] font-black text-primary">{item.check_in_time || item.check_out_time}</p>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                          item.check_in_time ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {item.check_in_time ? 'MASUK' : 'PULANG'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                            <Clock className="w-8 h-8 text-blue-200" />
                          </div>
                          <p className="text-slate-400 font-bold">Belum ada data absensi</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showScanner && (
        <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
