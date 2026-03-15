import React, { useState } from 'react';
import { LogIn, User, Lock, ShieldCheck, Loader2, Eye, EyeOff, Shield, Cpu, Award } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login({ onLogin }: { onLogin: (data: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = { error: text || 'Terjadi kesalahan pada server.' };
      }

      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || 'Login gagal. Periksa kembali email dan password.');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] -z-10" />

      <div className="w-full max-w-[400px]">
        {/* Login Card */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50 relative z-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-3xl shadow-lg shadow-blue-200 mb-6 relative">
              <ShieldCheck className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></div>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Selamat Datang</h1>
            <p className="text-slate-500 mt-1 text-sm font-medium">Aplikasi Absensi Berbasis AI</p>
            
            <div className="mt-6 inline-flex items-center justify-center space-x-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">Sistem Online - AI Ready</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-xs font-bold rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2 text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                <User className="w-3 h-3 mr-1" /> USERNAME / EMAIL
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  placeholder="admin@attendance.com"
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                <Lock className="w-3 h-3 mr-1" /> PASSWORD
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••••••"
                  className="w-full pl-4 pr-12 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-sm flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Masuk ke Sistem
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-slate-400 text-xs font-medium">
              © 2025 Aplikasi Absensi Berbasis AI
            </p>
          </div>
        </div>

        {/* Badges below card */}
        <div className="mt-6 flex items-center justify-center space-x-3 relative z-10">
           <div className="flex items-center text-[10px] text-slate-500 font-bold bg-white px-3 py-2 rounded-full border border-slate-200 shadow-sm">
             <Shield className="w-3 h-3 mr-1 text-blue-500" /> 256-bit Encryption
           </div>
           <div className="flex items-center text-[10px] text-slate-500 font-bold bg-white px-3 py-2 rounded-full border border-slate-200 shadow-sm">
             <Cpu className="w-3 h-3 mr-1 text-emerald-500" /> AI Powered
           </div>
           <div className="flex items-center text-[10px] text-slate-500 font-bold bg-white px-3 py-2 rounded-full border border-slate-200 shadow-sm">
             <Award className="w-3 h-3 mr-1 text-purple-500" /> ISO 27001
           </div>
        </div>
      </div>
    </div>
  );
}
