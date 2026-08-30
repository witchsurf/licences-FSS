import React from 'react';
import { LicenceCategory } from '../types';
import {
  Shield,
  Award,
  Waves,
  Trophy,
  Settings,
  Printer,
  LayoutGrid,
  Users,
} from 'lucide-react';
import { CATEGORIES_LICENCES_CONFIG } from '../data/initialData';

interface NavbarProps {
  totalLicencesCount: number;
  activeCategory: LicenceCategory | 'ALL';
  onSelectCategory: (cat: LicenceCategory | 'ALL') => void;
  onOpenSettings: () => void;
  onOpenBatchPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalLicencesCount,
  activeCategory,
  onSelectCategory,
  onOpenSettings,
  onOpenBatchPrint,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Titre */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00853F] via-[#FDEF42] to-[#E31B23] p-[2px] shadow-lg">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-base">🏄🏾‍♂️</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-sm text-white tracking-wide uppercase">
                  FSS • GESTION DES LICENCES
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-fss-blue/20 text-fss-blue border border-fss-blue/30 tracking-wider uppercase">
                  Portail Officiel
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Fédération Sénégalaise de Surf & Confédération Africaine
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Rapide entre Types de Licences */}
        <div className="hidden md:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSelectCategory('CADRE')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'CADRE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Cadres Fédéraux</span>
          </button>

          <button
            onClick={() => onSelectCategory('COMPETITION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'COMPETITION'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Compétition</span>
          </button>

          <button
            onClick={() => onSelectCategory('LOISIR')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'LOISIR'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Loisir</span>
          </button>

          <button
            onClick={() => onSelectCategory('LIGUE_PRO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === 'LIGUE_PRO'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Ligue Pro</span>
          </button>
        </div>

        {/* Actions & Raccourcis */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenBatchPrint}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all active:scale-95 shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Impression ({totalLicencesCount})</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition-all active:scale-95 shadow-sm"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Paramètres QR</span>
          </button>
        </div>
      </div>
    </header>
  );
};
