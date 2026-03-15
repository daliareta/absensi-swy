import React, { useState, useEffect } from 'react';
import { fetchWithAuth, cn } from '../lib/utils';
import { Calendar, Plus, Trash2, Clock, User, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function Timesheet() {
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    activity: '',
    duration: 60
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadTimesheets();
  }, []);

  const loadTimesheets = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/timesheets');
      const data = await res.json();
      setTimesheets(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/timesheets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          date: new Date().toISOString().split('T')[0],
          activity: '',
          duration: 60
        });
        loadTimesheets();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan laporan aktivitas');
      }
    } catch (error) {
      console.error(error);
      setError('Terjadi kesalahan server');
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetchWithAuth(`/timesheets/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) loadTimesheets();
    } catch (error) {
      console.error(error);
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">TIMESHEET</h1>
          <p className="text-slate-500 font-medium">Laporan aktivitas kerja harian</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadTimesheets}
            className="px-6 py-3 bg-white border border-blue-100 rounded-2xl text-primary hover:bg-blue-50 transition-all shadow-sm flex items-center space-x-2 font-black text-[10px] tracking-widest uppercase"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          {!isAdmin && (
            <button 
              onClick={() => {
                setError('');
                setShowModal(true);
              }}
              className="px-6 py-3 sanwanay-gradient text-white rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-900/20 flex items-center space-x-2 font-black text-[10px] tracking-widest uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Lapor Aktivitas</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[3rem] border border-blue-50 shadow-2xl shadow-blue-900/5 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Memuat Data...</p>
            </div>
          ) : timesheets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Calendar className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada data timesheet</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Durasi</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  {isAdmin && <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {timesheets.map((ts) => (
                  <tr key={ts.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{ts.date}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{ts.user_name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-medium text-slate-600 max-w-xs truncate">{ts.activity}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span>{Math.floor(ts.duration / 60)}j {ts.duration % 60}m</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        ts.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        ts.status === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {ts.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="py-4 text-right">
                        {ts.status === 'Pending' && (
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => handleStatusChange(ts.id, 'Approved')}
                              className="p-2 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                              title="Setujui"
                            >
                              <CheckCircle2 className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleStatusChange(ts.id, 'Rejected')}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Tolak"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">Lapor Aktivitas</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tanggal</label>
                <input 
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Aktivitas / Pekerjaan</label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Deskripsikan pekerjaan yang dilakukan..."
                  value={formData.activity}
                  onChange={(e) => setFormData({...formData, activity: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Durasi (Menit)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-xs font-black text-slate-500 hover:bg-slate-100 rounded-xl transition-colors uppercase tracking-widest"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 sanwanay-gradient text-white rounded-xl font-black text-xs shadow-xl hover:scale-[1.02] transition-all uppercase tracking-widest"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
