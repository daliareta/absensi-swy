import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Clock, 
  User, 
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  LayoutGrid,
  List,
  Ticket,
  Wifi,
  Tag,
  Phone
} from 'lucide-react';
import { fetchWithAuth, cn } from '../lib/utils';

export default function Tickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Filter & Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: 'asc' | 'desc'}>({ key: 'created_at', direction: 'desc' });
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_id: '',
    address: '',
    phone: '',
    problem_type: 'Internet Down',
    area: 'Desa Jambu Karya',
    description: '',
    priority: 'Medium',
    assigned_to: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
    
    loadTickets();
    loadTechnicians();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await fetchWithAuth('/tickets');
      const data = await res.json();
      setTickets(data);
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
    } catch (error) {
      console.error(error);
    }
  };

  // Filtered & Sorted Data
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.customer_name.toLowerCase().includes(query) || 
        t.customer_id.toLowerCase().includes(query) ||
        t.problem_type.toLowerCase().includes(query)
      );
    }

    // Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Area Filter
    if (areaFilter !== 'All') {
      result = result.filter(t => t.area === areaFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [tickets, searchQuery, statusFilter, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginatedTickets = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchWithAuth('/tickets', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({
          customer_name: '',
          customer_id: '',
          address: '',
          phone: '',
          problem_type: 'Internet Down',
          area: 'Desa Jambu Karya',
          description: '',
          priority: 'Medium',
          assigned_to: ''
        });
        loadTickets();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetchWithAuth(`/tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      if (res.ok) loadTickets();
    } catch (error) {
      console.error(error);
    }
  };

  const getPriorityColor = (p: string) => {
    switch(p) {
      case 'High': return 'bg-rose-100 text-rose-600 border-rose-200';
      case 'Medium': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Low': return 'bg-blue-100 text-blue-600 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Open': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'On Progress': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Cancel': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">TIKET GANGGUAN</h1>
          <p className="text-slate-500 font-medium">Manajemen perbaikan jaringan Sanwanay Network</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-blue-100 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-3 rounded-xl transition-all",
                viewMode === 'list' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary"
              )}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-3 rounded-xl transition-all",
                viewMode === 'grid' ? "bg-primary text-white shadow-lg" : "text-slate-400 hover:text-primary"
              )}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          
          {(user?.role === 'Admin' || user?.role === 'NOC') && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-6 py-4 sanwanay-gradient text-white rounded-2xl font-black text-sm shadow-xl hover:scale-[1.02] transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>BUAT TIKET BARU</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-blue-900/5 border border-blue-50 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama pelanggan, ID, atau masalah..."
            className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-primary transition-all"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100">
            <Filter className="w-4 h-4 text-primary" />
            <select 
              className="bg-transparent border-none text-sm font-black text-primary focus:ring-0 cursor-pointer"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">SEMUA STATUS</option>
              <option value="Open">OPEN</option>
              <option value="On Progress">ON PROGRESS</option>
              <option value="Selesai">SELESAI</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100">
            <MapPin className="w-4 h-4 text-primary" />
            <select 
              className="bg-transparent border-none text-sm font-black text-primary focus:ring-0 cursor-pointer"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">SEMUA AREA</option>
              <optgroup label="KECAMATAN RAJEG">
                <option value="Desa Jambu Karya">DESA JAMBU KARYA</option>
                <option value="Desa Daon">DESA DAON</option>
                <option value="Daon Pintu">DAON PINTU</option>
                <option value="Daon Lembur">DAON LEMBUR</option>
                <option value="Desa Mekarsari">DESA MEKARSARI</option>
                <option value="Desa Rajeg Mulya">DESA RAJEG MULYA</option>
                <option value="Desa Rancabango">DESA RANCABANGO</option>
                <option value="Desa Sukamanah (Rajeg)">DESA SUKAMANAH (RAJEG)</option>
                <option value="Desa Sukasari">DESA SUKASARI</option>
                <option value="Desa Tanjakan">DESA TANJAKAN</option>
                <option value="Badak Onom">BADAK ONOM</option>
                <option value="Onom">ONOM</option>
                <option value="PSP / Perum Sukatani Permai">PSP / PERUM SUKATANI PERMAI</option>
              </optgroup>
              <optgroup label="KECAMATAN KEMIRI">
                <option value="Desa Kemiri">DESA KEMIRI</option>
                <option value="Desa Karang Anyar">DESA KARANG ANYAR</option>
                <option value="Desa Klebet">DESA KLEBET</option>
                <option value="Kelebet">KELEBET</option>
                <option value="Desa Legok Sukamaju">DESA LEGOK SUKAMAJU</option>
                <option value="Desa Lontar">DESA LONTAR</option>
                <option value="Desa Patramanggala">DESA PATRAMANGGALA</option>
                <option value="Patra">PATRA</option>
                <option value="Desa Rancalabuh">DESA RANCALABUH</option>
                <option value="Desa Sukamanah (Kemiri)">DESA SUKAMANAH (KEMIRI)</option>
              </optgroup>
              <optgroup label="LOKASI LAINNYA">
                <option value="Ribut">RIBUT</option>
                <option value="Pabuaran">PABUARAN</option>
                <option value="Cambai">CAMBAI</option>
                <option value="Santri Sabrang">SANTRI SABRANG</option>
                <option value="Santri Asem">SANTRI ASEM</option>
                <option value="Gabusan">GABUSAN</option>
                <option value="KP. Baru">KP. BARU</option>
              </optgroup>
              <option value="All Area">JALUR UTAMA (BACKBONE)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50/30">
                  <th onClick={() => handleSort('customer_name')} className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Pelanggan</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Masalah & Area</th>
                  <th onClick={() => handleSort('priority')} className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Prioritas</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest">Teknisi</th>
                  <th onClick={() => handleSort('status')} className="px-8 py-5 text-left text-[10px] font-black text-primary uppercase tracking-widest cursor-pointer hover:bg-blue-50 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-primary uppercase tracking-widest">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary font-black shadow-inner">
                          {ticket.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{ticket.customer_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{ticket.customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">{ticket.problem_type}</p>
                        <div className="flex items-center text-[10px] font-black text-primary uppercase tracking-widest">
                          <MapPin className="w-3 h-3 mr-1" />
                          {ticket.area}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        getPriorityColor(ticket.priority)
                      )}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="text-sm font-bold text-slate-600">{ticket.assigned_name || 'Belum Ada'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        getStatusColor(ticket.status)
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        {ticket.status === 'Open' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'On Progress')}
                            className="p-2 bg-blue-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"
                            title="Mulai Perbaikan"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status === 'On Progress' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'Selesai')}
                            className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                            title="Selesaikan"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-900/5 border border-blue-50 hover:scale-[1.02] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary font-black text-lg shadow-inner">
                      {ticket.customer_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-800 leading-none">{ticket.customer_name}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{ticket.customer_id}</p>
                    </div>
                  </div>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                    getStatusColor(ticket.status)
                  )}>
                    {ticket.status}
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center text-sm font-bold text-slate-600">
                    <Tag className="w-4 h-4 mr-3 text-primary" />
                    <span>{ticket.problem_type}</span>
                  </div>
                  <div className="flex items-center text-sm font-bold text-slate-600">
                    <MapPin className="w-4 h-4 mr-3 text-primary" />
                    <span>{ticket.area}</span>
                  </div>
                  <div className="flex items-center text-sm font-bold text-slate-600">
                    <Phone className="w-4 h-4 mr-3 text-primary" />
                    <span>{ticket.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-blue-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{ticket.assigned_name || 'BELUM ADA'}</span>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                    getPriorityColor(ticket.priority)
                  )}>
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center space-x-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-8 h-8 rounded-xl text-xs font-bold transition-all",
                    currentPage === i + 1 ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedTickets.length === 0 && !loading && (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Ticket className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Tidak ada tiket ditemukan</h3>
          <p className="text-slate-500 max-w-xs mx-auto text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-dark/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="sanwanay-gradient p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <Wifi className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight">BUAT TIKET BARU</h2>
                    <p className="text-white/70 text-sm font-bold uppercase tracking-widest">Input Gangguan Pelanggan</p>
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
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nama Pelanggan</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Contoh: Bp. Slamet"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">ID Pelanggan</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="Contoh: SNW001"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Area Lokasi</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={formData.area}
                    onChange={(e) => setFormData({...formData, area: e.target.value})}
                  >
                    <optgroup label="KECAMATAN RAJEG">
                      <option value="Desa Jambu Karya">DESA JAMBU KARYA</option>
                      <option value="Desa Daon">DESA DAON</option>
                      <option value="Daon Pintu">DAON PINTU</option>
                      <option value="Daon Lembur">DAON LEMBUR</option>
                      <option value="Desa Mekarsari">DESA MEKARSARI</option>
                      <option value="Desa Rajeg Mulya">DESA RAJEG MULYA</option>
                      <option value="Desa Rancabango">DESA RANCABANGO</option>
                      <option value="Desa Sukamanah (Rajeg)">DESA SUKAMANAH (RAJEG)</option>
                      <option value="Desa Sukasari">DESA SUKASARI</option>
                      <option value="Desa Tanjakan">DESA TANJAKAN</option>
                      <option value="Badak Onom">BADAK ONOM</option>
                      <option value="Onom">ONOM</option>
                      <option value="PSP / Perum Sukatani Permai">PSP / PERUM SUKATANI PERMAI</option>
                    </optgroup>
                    <optgroup label="KECAMATAN KEMIRI">
                      <option value="Desa Kemiri">DESA KEMIRI</option>
                      <option value="Desa Karang Anyar">DESA KARANG ANYAR</option>
                      <option value="Desa Klebet">DESA KLEBET</option>
                      <option value="Kelebet">KELEBET</option>
                      <option value="Desa Legok Sukamaju">DESA LEGOK SUKAMAJU</option>
                      <option value="Desa Lontar">DESA LONTAR</option>
                      <option value="Desa Patramanggala">DESA PATRAMANGGALA</option>
                      <option value="Patra">PATRA</option>
                      <option value="Desa Rancalabuh">DESA RANCALABUH</option>
                      <option value="Desa Sukamanah (Kemiri)">DESA SUKAMANAH (KEMIRI)</option>
                    </optgroup>
                    <optgroup label="LOKASI LAINNYA">
                      <option value="Ribut">RIBUT</option>
                      <option value="Pabuaran">PABUARAN</option>
                      <option value="Cambai">CAMBAI</option>
                      <option value="Santri Sabrang">SANTRI SABRANG</option>
                      <option value="Santri Asem">SANTRI ASEM</option>
                      <option value="Gabusan">GABUSAN</option>
                      <option value="KP. Baru">KP. BARU</option>
                    </optgroup>
                    <option value="All Area">JALUR UTAMA (BACKBONE)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Tipe Masalah / Layanan</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={formData.problem_type}
                    onChange={(e) => setFormData({...formData, problem_type: e.target.value})}
                  >
                    <option value="Internet Down">INTERNET MATI (DOWN)</option>
                    <option value="Lambat">INTERNET LAMBAT (SLOW)</option>
                    <option value="Pemasangan Baru">PEMASANGAN BARU (PSB)</option>
                    <option value="Relokasi">RELOKASI PERANGKAT</option>
                    <option value="Ganti Password">GANTI PASSWORD / WIFI</option>
                    <option value="Lainnya">LAINNYA</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Nomor HP</label>
                  <input 
                    required
                    type="tel"
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Prioritas</label>
                  <select 
                    className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">LOW</option>
                    <option value="Medium">MEDIUM</option>
                    <option value="High">HIGH</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Alamat Lengkap</label>
                <textarea 
                  required
                  className="w-full px-6 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary transition-all h-24 resize-none"
                  placeholder="Masukkan alamat lengkap pelanggan..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
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
                  SIMPAN TIKET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
