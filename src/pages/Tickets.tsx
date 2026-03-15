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
  const [techFilter, setTechFilter] = useState('All');
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

    // Technician Filter
    if (techFilter !== 'All') {
      result = result.filter(t => t.assigned_to === parseInt(techFilter));
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
      case 'High': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Medium': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Low': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
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
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tiket & Pemasangan</h1>
          <p className="text-slate-500 text-sm mt-1">Manajemen perbaikan jaringan Sanwanay Network</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 flex">
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'list' ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 rounded-md transition-all",
                viewMode === 'grid' ? "bg-slate-100 text-slate-800" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          
          {(user?.role === 'Admin' || user?.role === 'NOC') && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tiket Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama pelanggan, ID, atau masalah..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <Filter className="w-4 h-4 text-slate-500" />
            <select 
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Semua Status</option>
              <option value="Open">Open</option>
              <option value="On Progress">On Progress</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
            <MapPin className="w-4 h-4 text-slate-500" />
            <select 
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none"
              value={areaFilter}
              onChange={(e) => {
                setAreaFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="All">Semua Area</option>
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

          {(user?.role === 'Admin' || user?.role === 'NOC' || user?.role === 'Manager') && (
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <User className="w-4 h-4 text-slate-500" />
              <select 
                className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer outline-none"
                value={techFilter}
                onChange={(e) => {
                  setTechFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="All">Semua Teknisi</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Tickets Content */}
      {viewMode === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th onClick={() => handleSort('customer_name')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Pelanggan</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Masalah & Area</th>
                  <th onClick={() => handleSort('priority')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Prioritas</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Teknisi</th>
                  <th onClick={() => handleSort('status')} className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-2">
                      <span>Status</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                          {ticket.customer_name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{ticket.customer_name}</p>
                          <p className="text-xs text-slate-500">{ticket.customer_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700">{ticket.problem_type}</p>
                        <div className="flex items-center text-xs text-slate-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {ticket.area}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium border",
                        getPriorityColor(ticket.priority)
                      )}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                          <User className="w-3 h-3 text-slate-500" />
                        </div>
                        <span className="text-sm text-slate-600">{ticket.assigned_name || 'Belum Ada'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium border",
                        getStatusColor(ticket.status)
                      )}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        {ticket.status === 'Open' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'On Progress')}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                            title="Mulai Perbaikan"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        {ticket.status === 'On Progress' && (
                          <button 
                            onClick={() => updateStatus(ticket.id, 'Selesai')}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 transition-colors"
                            title="Selesaikan"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md transition-colors">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                    {ticket.customer_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800 leading-tight">{ticket.customer_name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{ticket.customer_id}</p>
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border",
                  getStatusColor(ticket.status)
                )}>
                  {ticket.status}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-slate-600">
                  <Tag className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{ticket.problem_type}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{ticket.area}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Phone className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{ticket.phone}</span>
                </div>
                {ticket.description && (
                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100 mt-2">
                    {ticket.description}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                    <User className="w-3 h-3 text-slate-500" />
                  </div>
                  <span className="text-xs text-slate-600">{ticket.assigned_name || 'Belum Ada'}</span>
                </div>
                <span className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border",
                  getPriorityColor(ticket.priority)
                )}>
                  {ticket.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Halaman {currentPage} dari {totalPages}
          </p>
          <div className="flex items-center space-x-1">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1 px-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-medium transition-colors",
                    currentPage === i + 1 ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {paginatedTickets.length === 0 && !loading && (
        <div className="bg-white rounded-xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Ticket className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Tidak ada tiket ditemukan</h3>
          <p className="text-slate-500 text-sm">Coba ubah filter atau kata kunci pencarian Anda.</p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                  <Wifi className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Buat Tiket Baru</h2>
                  <p className="text-slate-500 text-xs">Input Tiket Pelanggan</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Nama Pelanggan</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Contoh: Bp. Slamet"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">ID Pelanggan</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Contoh: SNW001"
                    value={formData.customer_id}
                    onChange={(e) => setFormData({...formData, customer_id: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Area Lokasi</label>
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
                  <label className="text-xs font-medium text-slate-700">Tipe Masalah / Layanan</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.problem_type}
                    onChange={(e) => setFormData({...formData, problem_type: e.target.value})}
                  >
                    <option value="Internet Down">Internet Mati (Down)</option>
                    <option value="Lambat">Internet Lambat (Slow)</option>
                    <option value="Pemasangan Baru">Pemasangan Baru (PSB)</option>
                    <option value="Relokasi">Relokasi Perangkat</option>
                    <option value="Ganti Password">Ganti Password / WiFi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Nomor HP</label>
                  <input 
                    required
                    type="tel"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700">Prioritas</label>
                  <select 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {(user?.role === 'Admin' || user?.role === 'NOC') && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700">Tugaskan Ke</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={formData.assigned_to}
                      onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
                    >
                      <option value="">Belum Ditugaskan</option>
                      {technicians.map(tech => (
                        <option key={tech.id} value={tech.id}>{tech.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Keterangan / Detail Masalah</label>
                <textarea 
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                  placeholder="Masukkan detail masalah atau catatan tambahan..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Alamat Lengkap</label>
                <textarea 
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all h-24 resize-none"
                  placeholder="Masukkan alamat lengkap pelanggan..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
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
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
