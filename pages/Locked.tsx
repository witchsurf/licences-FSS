import React from 'react';
import { ShieldAlert, Laptop, Mail, Key } from 'lucide-react';

interface LockedProps {
  reason?: string;
}

export const Locked: React.FC<LockedProps> = ({ reason }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden text-slate-100">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg bg-slate-900/90 backdrop-blur-xl border border-red-500/30 rounded-3xl shadow-2xl p-8 sm:p-10 relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
          <ShieldAlert size={44} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Installation Non Autorisée
        </h1>

        <p className="text-slate-300 text-sm mt-3 leading-relaxed">
          {reason || "Cet installeur ou cette copie de Licences Manager a déjà été activée sur un autre ordinateur."}
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-400">
            <Laptop size={14} className="text-red-400" />
            <span>Sécurité matérielle : <strong className="text-slate-200">Verrouillage Machine Unique</strong></span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Key size={14} className="text-amber-400" />
            <span>Chaque installeur ne peut être exécuté que sur une seule machine physique.</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col items-center gap-3">
          <p className="text-xs text-slate-400">
            Pour obtenir une licence supplémentaire ou transférer votre accès :
          </p>
          <a
            href="mailto:rplaraise@gmail.com?subject=Demande de licence Licences Manager"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Mail size={14} className="text-emerald-400" />
            Contacter le support (René Pierre LARAISE)
          </a>
        </div>
      </div>
    </div>
  );
};
