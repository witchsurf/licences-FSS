import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, CheckSquare, Edit, Plus, Printer, RefreshCw, Square, Trash2 } from 'lucide-react';
import { FederalOfficialCard } from '../components/FederalOfficialCard';
import { FederalOfficial } from '../types';
import { LicenseService } from '../services/licenseService';
import { FederalOfficialService } from '../services/federalOfficialService';

export const FederalOfficials: React.FC = () => {
  const [officials, setOfficials] = useState<FederalOfficial[]>([]);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const load = async () => { try { setOfficials(await FederalOfficialService.getAll()); } finally { setLoading(false); } };
  useEffect(() => { if (!LicenseService.isAuthenticated()) navigate('/login'); else void load(); }, [navigate]);
  const remove = async (official: FederalOfficial) => {
    if (!confirm(`Supprimer définitivement la carte de ${official.firstName} ${official.lastName} ?`)) return;
    await FederalOfficialService.remove(official.id); await load();
  };
  const selectedOfficials = officials.filter(official => selectedIds.has(official.id));
  const allSelected = officials.length > 0 && selectedOfficials.length === officials.length;
  const toggleSelection = (id: string) => setSelectedIds(previous => {
    const next = new Set(previous);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });
  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(officials.map(official => official.id)));
  return <><div className="min-h-screen bg-slate-100 px-5 py-8 sm:px-8 no-print"><div className="mx-auto max-w-7xl">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><div><Link to="/admin" className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-fss-green"><ArrowLeft size={16} /> Tableau de bord</Link><h1 className="flex items-center gap-3 text-3xl font-black text-slate-900"><BadgeCheck className="text-fss-green" /> Cadres fédéraux</h1><p className="mt-2 text-sm text-slate-500">Créez et gérez les cartes professionnelles des dirigeants et encadreurs FSS.</p></div>
      <div className="flex flex-wrap items-center gap-2"><Link to="/admin/cadres-federaux/nouveau" className="inline-flex items-center gap-2 rounded-xl bg-fss-green px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"><Plus size={17} /> Nouveau cadre</Link>{officials.length > 0 && <><button onClick={toggleAll} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm">{allSelected ? <CheckSquare size={17} /> : <Square size={17} />}{allSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</button><button onClick={() => setSide(current => current === 'front' ? 'back' : 'front')} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm"><RefreshCw size={17} /> Voir le {side === 'front' ? 'verso' : 'recto'}</button><button disabled={selectedOfficials.length === 0} onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-40"><Printer size={17} /> Imprimer ({selectedOfficials.length})</button></>}</div></div>
    {loading ? <p className="text-slate-500">Chargement des cadres fédéraux…</p> : officials.length === 0 ? <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white px-8 py-20 text-center"><BadgeCheck className="mx-auto mb-4 text-slate-300" size={42} /><h2 className="text-xl font-bold text-slate-800">Aucune carte créée</h2><p className="mt-2 text-slate-500">Ajoutez le premier cadre fédéral avec ses informations et sa photo officielle.</p><Link to="/admin/cadres-federaux/nouveau" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-fss-green px-4 py-2.5 font-bold text-white"><Plus size={17} /> Créer un cadre</Link></div> : <><p className="mb-5 text-sm font-medium text-slate-500">Sélectionnez une ou plusieurs cartes avant d’imprimer.</p><div className="grid grid-cols-1 gap-7 lg:grid-cols-2 xl:grid-cols-3">{officials.map(official => <div key={official.id}><FederalOfficialCard official={official} side={side} /><div className="mt-3 flex flex-wrap justify-end gap-2"><button onClick={() => toggleSelection(official.id)} className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-bold shadow-sm ${selectedIds.has(official.id) ? 'bg-fss-green text-white' : 'bg-white text-slate-700'}`}>{selectedIds.has(official.id) ? <CheckSquare size={14} /> : <Square size={14} />}{selectedIds.has(official.id) ? 'Sélectionnée' : 'Sélectionner'}</button><Link to={`/admin/cadres-federaux/${official.id}/modifier`} className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm"><Edit size={14} /> Modifier</Link><button onClick={() => void remove(official)} className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm"><Trash2 size={14} /> Supprimer</button></div></div>)}</div></>}
  </div></div><div className="hidden print-only"><div className="federal-print-grid federal-print-page">{selectedOfficials.map(official => <FederalOfficialCard key={`${official.id}-front`} official={official} side="front" />)}</div><div className="federal-print-grid federal-print-page">{selectedOfficials.map(official => <FederalOfficialCard key={`${official.id}-back`} official={official} side="back" />)}</div></div></>;
};
