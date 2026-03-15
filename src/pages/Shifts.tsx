import React, { useState, useEffect } from 'react';
import { fetchWithAuth, cn } from '../lib/utils';
import { Calendar, Plus, Trash2, Clock, User, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Shifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().split('T')[0],
    shift_type: 'Pagi',
    start_time: '08:00',
    end_time: '17:00'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    loadShifts();
    loadTechnicians();
  }, []);

  const loadShifts = async () => {
    setLoading(true);
    try {
      const res = await fetchWithAuth('/shifts');
      const data = await res.json();
      setShifts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadTechnicians = async () => {
    try {
      const res = await fetchWithAuth('/users/technicians');
      const data = await res.json();
      setTechnicians(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, user_id: data[0].id.toString() }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/shifts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        loadShifts();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan shift');
      }
    } catch (error) {
      console.error(error);
      setError('Terjadi kesalahan server');
    }
  };

  const handleDelete = async (id: number) => {
    setShiftToDelete(id);
  };

  const confirmDelete = async () => {
    if (!shiftToDelete) return;
    try {
      const res = await fetchWithAuth(`/shifts/${shiftToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadShifts();
        setShiftToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus shift');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan server');
    }
  };

  const isAdmin = user?.role === 'Admin' || user?.role === 'Manager';

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">JADWAL SHIFT</h1>
          <p className="text-slate-500 font-medium">Manajemen jadwal kerja karyawan</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={loadShifts}
            className="px-6 py-3 bg-white border border-blue-100 rounded-2xl text-primary hover:bg-blue-50 transition-all shadow-sm flex items-center space-x-2 font-black text-[10px] tracking-widest uppercase"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => {
                setError('');
                setShowModal(true);
              }}
              className="px-6 py-3 sanwanay-gradient text-white rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-blue-900/20 flex items-center space-x-2 font-black text-[10px] tracking-widest uppercase"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Shift</span>
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
          ) : shifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <Calendar className="w-12 h-12 text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Belum ada jadwal shift</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100">
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift</th>
                  <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jam Kerja</th>
                  {isAdmin && <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{shift.date}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-primary">
                          <User className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-800">{shift.user_name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        shift.shift_type === 'Pagi' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        shift.shift_type === 'Siang' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        shift.shift_type === 'Malam' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {shift.shift_type}
                      </span>
                    </td>
                    <td className="py-4">
                      {shift.shift_type !== 'Off' ? (
                        <div className="flex items-center space-x-2 text-sm font-medium text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          <span>{shift.start_time} - {shift.end_time}</span>
                        </div>
                      ) : (
                        <span className="text-sm font-medium text-slate-400">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleDelete(shift.id)}
                          className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {shiftToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Hapus Shift?</h3>
              <p className="text-slate-500 text-sm">
                Apakah Anda yakin ingin menghapus jadwal shift ini? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setShiftToDelete(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">Tambah Jadwal Shift</h2>
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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Karyawan</label>
                <select 
                  required
                  value={formData.user_id}
                  onChange={(e) => setFormData({...formData, user_id: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                  ))}
                </select>
              </div>

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
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipe Shift</label>
                <select 
                  required
                  value={formData.shift_type}
                  onChange={(e) => setFormData({...formData, shift_type: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="Pagi">Pagi (08:00 - 17:00)</option>
                  <option value="Siang">Siang (13:00 - 22:00)</option>
                  <option value="Malam">Malam (22:00 - 07:00)</option>
                  <option value="Off">Libur / Off</option>
                </select>
              </div>

              {formData.shift_type !== 'Off' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jam Masuk</label>
                    <input 
                      type="time"
                      required
                      value={formData.start_time}
                      onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jam Pulang</label>
                    <input 
                      type="time"
                      required
                      value={formData.end_time}
                      onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>
                </div>
              )}

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
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
