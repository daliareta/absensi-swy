import React from 'react';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <Construction className="w-12 h-12 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Halaman {title}</h1>
      <p className="text-slate-500 max-w-md">
        Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia pada pembaruan berikutnya.
      </p>
    </div>
  );
}
