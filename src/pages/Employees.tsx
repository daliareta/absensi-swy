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
  Briefcase
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Teknisi',
    area: 'Kemiri',
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
          area: 'Kemiri',
          specialization: 'Fiber Optic'
        });
        loadEmployees();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (employee: any) => {
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
    if (!confirm('Apakah Anda yakin ingin menghapus karyawan ini?')) return;
    try {
      const res = await fetchWithAuth(`/users/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) loadEmployees();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">DATA KARYAWAN</h1>
          <p className="text-slate-500 font-medium">Manajemen tim dan teknisi Sanwanay Network</p>
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
          className="flex items-center space-x-2 px-6 py-4 sanwanay-gradient text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>TAMBAH KARYAWAN</span>
        </button>
      </div>

      {/* Search Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-50">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama, email, atau jabatan..."
            className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-blue-50 animate-pulse">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                  <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
              </div>
            </div>
          ))
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50 hover:scale-[1.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-primary font-black text-xl shadow-inner">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 leading-none">{emp.name}</h3>
                      <div className="flex items-center mt-2">
                        <Shield className="w-3 h-3 text-primary mr-1" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{emp.role}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => handleEdit(emp)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(emp.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm font-bold text-slate-600">
                    <Mail className="w-4 h-4 mr-3 text-primary" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.role === 'Teknisi' && (
                    <>
                      <div className="flex items-center text-sm font-bold text-slate-600">
                        <MapPin className="w-4 h-4 mr-3 text-primary" />
                        <span>Area: {emp.area || '-'}</span>
                      </div>
                      <div className="flex items-center text-sm font-bold text-slate-600">
                        <Zap className="w-4 h-4 mr-3 text-primary" />
                        <span>Spesialis: {emp.specialization || '-'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-blue-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">AKTIF</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">
                    ID: #{emp.id}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="sanwanay-gradient p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Briefcase className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">{editingEmployee ? 'EDIT KARYAWAN' : 'TAMBAH KARYAWAN'}</h2>
                    <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Data Tim Sanwanay Network</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/20 rounded-2xl transition-all">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Nama Lengkap"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="email@sanwanay.net"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Password {editingEmployee && '(Kosongkan jika tidak ganti)'}</label>
                  <input 
                    required={!editingEmployee}
                    type="password"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Jabatan / Role</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="Admin">ADMIN</option>
                    <option value="NOC">NOC</option>
                    <option value="Teknisi">TEKNISI</option>
                    <option value="Manager">MANAGER</option>
                  </select>
                </div>

                {formData.role === 'Teknisi' && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Area Tugas</label>
                      <select 
                        className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                        value={formData.area}
                        onChange={(e) => setFormData({...formData, area: e.target.value})}
                      >
                        <option value="Kemiri">DESA KEMIRI</option>
                        <option value="Jambu Karya">DESA JAMBU KARYA</option>
                        <option value="All Area">JALUR UTAMA</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Spesialisasi</label>
                      <select 
                        className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                        value={formData.specialization}
                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      >
                        <option value="Fiber Optic">FIBER OPTIC (SPLICER)</option>
                        <option value="Network Engineer">NETWORK ENGINEER</option>
                        <option value="Teknisi Jalur">TEKNISI JALUR</option>
                        <option value="Instalasi">INSTALASI (IKR)</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-5 bg-blue-50 text-primary rounded-2xl font-black text-sm hover:bg-blue-100 transition-all"
                >
                  BATALKAN
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-5 sanwanay-gradient text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all"
                >
                  {editingEmployee ? 'SIMPAN PERUBAHAN' : 'TAMBAH KARYAWAN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
