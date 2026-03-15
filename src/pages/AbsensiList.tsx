import React, { useState, useEffect } from 'react';
import { fetchWithAuth, cn } from '../lib/utils';
import { Clock, MapPin, User, Calendar, RefreshCw } from 'lucide-react';

export default function AbsensiList() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/attendance');
      const data = await res.json();
      setAttendance(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">DATA ABSENSI</h1>
          <p className="text-slate-500 font-medium">Riwayat kehadiran seluruh karyawan</p>
        </div>
        <button 
          onClick={loadAttendance}
          className="px-6 py-3 bg-white border border-blue-100 rounded-2xl text-primary hover:bg-blue-50 transition-all shadow-sm flex items-center space-x-2 font-black text-[10px] tracking-widest uppercase"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          <span>Refresh Data</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-blue-50 shadow-2xl shadow-blue-900/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Calendar className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada data absensi</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Masuk</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Pulang</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Lokasi</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-primary">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{record.user_name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{record.date}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-emerald-600">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>{record.check_in_time || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-rose-600">
                        <Clock className="w-4 h-4 text-rose-400" />
                        <span>{record.check_out_time || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{record.latitude ? `${record.latitude.toFixed(4)}, ${record.longitude.toFixed(4)}` : '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
