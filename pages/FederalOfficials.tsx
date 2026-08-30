import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Printer, RefreshCw } from 'lucide-react';
import { FederalOfficial, FederalOfficialCard } from '../components/FederalOfficialCard';
import { LicenseService } from '../services/licenseService';

const OFFICIALS: FederalOfficial[] = [
  { id: 'FSS-CAD-2025-001', title: 'Président' },
  { id: 'FSS-CAD-2025-002', title: 'Vice-président' },
  { id: 'FSS-CAD-2025-003', title: 'Vice-présidente' },
  { id: 'FSS-CAD-2025-004', title: 'Trésorier' },
  { id: 'FSS-CAD-2025-005', title: 'Secrétaire général' },
  { id: 'FSS-CAD-2025-006', title: 'Coach' },
  { id: 'FSS-CAD-2025-007', title: 'Directeur technique national' },
];

export const FederalOfficials: React.FC = () => {
  const [side, setSide] = useState<'front' | 'back'>('front');
  const navigate = useNavigate();

  useEffect(() => {
    if (!LicenseService.isAuthenticated()) navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8 no-print">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link to="/admin" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-fss-green"><ArrowLeft size={16} /> Tableau de bord</Link>
            <h1 className="flex items-center gap-3 text-3xl font-black text-slate-900"><BadgeCheck className="text-fss-green" /> Cadres fédéraux</h1>
            <p className="mt-2 text-sm text-slate-500">7 cartes professionnelles prêtes à personnaliser avec les noms et les portraits officiels.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSide(current => current === 'front' ? 'back' : 'front')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"><RefreshCw size={17} /> Voir le {side === 'front' ? 'verso' : 'recto'}</button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-fss-green px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"><Printer size={17} /> Imprimer</button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2 xl:grid-cols-3">
          {OFFICIALS.map(official => <FederalOfficialCard key={official.id} official={official} side={side} />)}
        </div>
      </div>
      <div className="hidden print-only federal-print-grid">
        {OFFICIALS.flatMap(official => [<FederalOfficialCard key={`${official.id}-front`} official={official} side="front" />, <FederalOfficialCard key={`${official.id}-back`} official={official} side="back" />])}
      </div>
    </div>
  );
};
