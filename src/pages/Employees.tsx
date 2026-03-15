import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  User, 
  Mail, 
  Shield, 
  MapPin, 
  Zap, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  XCircle,
  CheckCircle2,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Teknisi',
    area: 'Desa Jambu Karya',
    specialization: 'Fiber Optic'
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const res = await fetchWithAuth('/users');
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingEmployee ? `/users/${editingEmployee.id}` : '/users';
      const method = editingEmployee ? 'PATCH' : 'POST';
      
      const res = await fetchWithAuth(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingEmployee(null);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'Teknisi',
          area: 'Desa Jambu Karya',
          specialization: 'Fiber Optic'
        });
        loadEmployees();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal menyimpan data karyawan');
      }
    } catch (error) {
      console.error(error);
      setError('Terjadi kesalahan server');
    }
  };

  const handleEdit = (employee: any) => {
    setError('');
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      password: '', // Don't show password
      role: employee.role,
      area: employee.area || 'Kemiri',
      specialization: employee.specialization || 'Fiber Optic'
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setEmployeeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      const res = await fetchWithAuth(`/users/${employeeToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadEmployees();
        setEmployeeToDelete(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus karyawan');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan server');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Data Karyawan</h1>
          <p className="text-slate-500 text-sm mt-1">Manajemen tim dan teknisi Sanwanay Network</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingEmployee(null);
            setFormData({
              name: '',
              email: '',
              password: '',
              role: 'Teknisi',
              area: 'Kemiri',
              specialization: 'Fiber Optic'
            });
            setShowModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Karyawan</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama, email, atau jabatan..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-200 rounded" />
              </div>
            </div>
          ))
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{emp.name}</h3>
                    <div className="flex items-center mt-1">
                      <Shield className="w-3 h-3 text-blue-500 mr-1" />
                      <span className="text-xs font-medium text-slate-500">{emp.role}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEdit(emp)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(emp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Mail className="w-4 h-4 mr-2 text-slate-400" />
                  <span className="truncate">{emp.email}</span>
                </div>
                {emp.role === 'Teknisi' && (
                  <>
                    <div className="flex items-center text-sm text-slate-600">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{emp.area || '-'}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-600">
                      <Zap className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{emp.specialization || '-'}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  <span className="text-xs font-medium text-emerald-600">Aktif</span>
                </div>
                <div className="text-xs text-slate-400">
                  ID: #{emp.id}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Hapus Karyawan?</h3>
              <p className="text-slate-500 text-sm">
                Apakah Anda yakin ingin menghapus karyawan ini? Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button 
                onClick={() => setEmployeeToDelete(null)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan'}</h2>
                  <p className="text-slate-500 text-xs">Data Tim Sanwanay Network</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-lg flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Nama Lengkap</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Email</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="email@sanwanay.net"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Password {editingEmployee && '(Kosongkan jika tidak ganti)'}</label>
                  <input 
                    required={!editingEmployee}
                    type="password"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Jabatan / Role</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Admin">Admin</option>
                    <option value="NOC">NOC</option>
                    <option value="Teknisi">Teknisi</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>

                {formData.role === 'Teknisi' && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Area Tugas</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                      >
                        <optgroup label="KECAMATAN RAJEG">
                          <option value="Desa Jambu Karya">Desa Jambu Karya</option>
                          <option value="Desa Daon">Desa Daon</option>
                          <option value="Daon Pintu">Daon Pintu</option>
                          <option value="Daon Lembur">Daon Lembur</option>
                          <option value="Desa Mekarsari">Desa Mekarsari</option>
                          <option value="Desa Rajeg Mulya">Desa Rajeg Mulya</option>
                          <option value="Desa Rancabango">Desa Rancabango</option>
                          <option value="Desa Sukamanah (Rajeg)">Desa Sukamanah (Rajeg)</option>
                          <option value="Desa Sukasari">Desa Sukasari</option>
                          <option value="Desa Tanjakan">Desa Tanjakan</option>
                          <option value="Badak Onom">Badak Onom</option>
                          <option value="Onom">Onom</option>
                          <option value="PSP / Perum Sukatani Permai">PSP / Perum Sukatani Permai</option>
                        </optgroup>
                        <optgroup label="KECAMATAN KEMIRI">
                          <option value="Desa Kemiri">Desa Kemiri</option>
                          <option value="Desa Karang Anyar">Desa Karang Anyar</option>
                          <option value="Desa Klebet">Desa Klebet</option>
                          <option value="Kelebet">Kelebet</option>
                          <option value="Desa Legok Sukamaju">Desa Legok Sukamaju</option>
                          <option value="Desa Lontar">Desa Lontar</option>
                          <option value="Desa Patramanggala">Desa Patramanggala</option>
                          <option value="Patra">Patra</option>
                          <option value="Desa Rancalabuh">Desa Rancalabuh</option>
                          <option value="Desa Sukamanah (Kemiri)">Desa Sukamanah (Kemiri)</option>
                        </optgroup>
                        <optgroup label="LOKASI LAINNYA">
                          <option value="Ribut">Ribut</option>
                          <option value="Pabuaran">Pabuaran</option>
                          <option value="Cambai">Cambai</option>
                          <option value="Santri Sabrang">Santri Sabrang</option>
                          <option value="Santri Asem">Santri Asem</option>
                          <option value="Gabusan">Gabusan</option>
                          <option value="KP. Baru">KP. Baru</option>
                        </optgroup>
                        <option value="All Area">Jalur Utama (Backbone)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700">Spesialisasi</label>
                      <select 
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      >
                        <option value="Fiber Optic">Fiber Optic (Splicer)</option>
                        <option value="Network Engineer">Network Engineer</option>
                        <option value="Teknisi Jalur">Teknisi Jalur</option>
                        <option value="Instalasi">Instalasi (IKR)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editingEmployee ? 'Simpan Perubahan' : 'Tambah Karyawan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
