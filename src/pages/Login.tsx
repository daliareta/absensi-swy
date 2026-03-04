import React, { useState } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Login({ onLogin }: { onLogin: (data: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      const data = await res.json();

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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-200 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-primary-dark tracking-tight">SANWANAY NETWORK</h1>
          <p className="text-slate-500 mt-2 font-medium">Sistem Monitoring & Absensi Terpadu</p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-2xl border border-rose-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  placeholder="name@sanwanay.com"
                  className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-blue-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 sanwanay-gradient text-white rounded-2xl font-black text-sm flex items-center justify-center hover:scale-[1.02] transition-all shadow-xl disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-3" />
                  MASUK SEKARANG
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Butuh bantuan? Hubungi <a href="#" className="text-primary font-black">Admin NOC</a>
          </p>
          <div className="mt-6 flex items-center justify-center space-x-4">
             <div className="text-[10px] text-slate-400 uppercase tracking-widest font-black bg-white px-4 py-2 rounded-full border border-blue-50 shadow-sm">
               Demo: admin@sanwanay.com / admin123
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
