import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { AutoFitText } from './AutoFitText';
import { FSS_ORGANIGRAMME_URL } from '../config/federation';
import { FederalOfficial } from '../types';

interface FederalOfficialCardProps { official: FederalOfficial; side: 'front' | 'back'; }

const FlagStrip = () => <div className="h-1.5 w-full flex opacity-90"><div className="h-full w-1/3 bg-[#00853F]" /><div className="h-full w-1/3 bg-[#FCD116]" /><div className="h-full w-1/3 bg-[#E31B23]" /></div>;

export const FederalOfficialCard: React.FC<FederalOfficialCardProps> = ({ official, side }) => {
  if (side === 'back') return (
    <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
      <div className="h-[14mm] bg-fss-green relative overflow-hidden px-4 flex items-center"><div className="absolute right-0 top-0 h-full w-[45%] skew-x-[-20deg] translate-x-5 bg-white/10" /><div className="relative z-10 flex items-center gap-3 text-white"><div className="rounded-xl bg-white p-1"><Logo className="h-10 w-10" /></div><div><h2 className="text-[9px] font-black uppercase leading-none">Fédération Sénégalaise de Surf</h2><p className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em] text-white/80">Carte professionnelle · verso</p></div></div></div>
      <div className="flex h-[calc(54mm-14mm-6px)] flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50"><p className="mb-2 text-[7px] font-black uppercase tracking-[0.14em] text-slate-500">Organigramme fédéral</p><div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><QRCodeSVG value={FSS_ORGANIGRAMME_URL} size={106} level="H" includeMargin={false} /></div><p className="mt-2 text-[7px] font-bold uppercase tracking-[0.1em] text-fss-green">Scanner pour consulter l'organigramme</p><p className="mt-1 text-[6px] font-mono font-bold text-slate-400">{official.id}</p></div><FlagStrip />
    </div>
  );

  return (
    <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
      <div className="h-[14mm] bg-fss-green relative overflow-hidden px-4 flex items-center justify-between">
        <div className="absolute top-0 right-0 h-full w-[40%] opacity-10 flex skew-x-[-20deg] translate-x-5"><div className="h-full w-1/3 bg-white" /><div className="h-full w-1/3 bg-white opacity-40" /><div className="h-full w-1/3 bg-white opacity-20" /></div>
        <div className="relative z-10 flex items-center gap-3 text-white"><div className="rounded-xl bg-white p-1 shadow-sm"><Logo className="h-10 w-10" /></div><div><h1 className="text-[9px] font-black leading-none tracking-tighter uppercase">Fédération Sénégalaise de Surf</h1><p className="mt-1 text-[7px] font-bold tracking-[0.1em] uppercase text-white/80">Carte professionnelle · cadre fédéral</p></div></div>
      </div>
      <div className="flex h-[calc(54mm-14mm-6px)] gap-4 bg-gradient-to-br from-white to-slate-50 p-3.5">
        <div className="w-[26mm] shrink-0"><div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200 shadow-inner">{official.photoUrl ? <img src={official.photoUrl} alt={`${official.firstName} ${official.lastName}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[7px] font-bold uppercase tracking-widest text-slate-300">Photo</div>}<div className="absolute bottom-0 left-0 right-0 bg-black/40 px-1.5 py-1 text-center text-[6px] font-mono font-bold tracking-tight text-white">FSS OFFICIEL</div></div></div>
        <div className="flex min-w-0 flex-1 flex-col justify-between"><div className="space-y-2"><div className="flex justify-between gap-2"><div className="min-w-0 flex-1"><p className="mb-0.5 text-[6.5px] font-black uppercase tracking-widest text-slate-500">Titulaire</p><AutoFitText maxFontSize={11} minFontSize={6} className="font-black leading-tight tracking-tight text-slate-900 uppercase">{`${official.lastName} ${official.firstName}`}</AutoFitText></div><div className="shrink-0 text-right"><p className="mb-0.5 text-[6.5px] font-black uppercase tracking-widest text-slate-500">N° carte</p><p className="font-mono text-[8px] font-black leading-tight tracking-tighter text-red-600">{official.id}</p></div></div><div className="grid grid-cols-[1.4fr_1fr] gap-2 border-t border-slate-100 pt-2"><div className="min-w-0"><p className="mb-0.5 text-[6px] font-bold uppercase tracking-widest text-slate-400">Fonction</p><AutoFitText maxFontSize={8} minFontSize={5} className="font-black leading-tight tracking-tight text-fss-green uppercase">{official.title}</AutoFitText></div><div className="min-w-0"><p className="mb-0.5 text-[6px] font-bold uppercase tracking-widest text-slate-400">Téléphone</p><p className="truncate text-[7px] font-black leading-tight text-slate-800">{official.phone}</p></div></div></div><div className="flex items-end justify-between"><div><p className="text-[6px] font-bold uppercase tracking-widest text-slate-400">Email professionnel</p><p className="max-w-[38mm] truncate text-[7px] font-black text-slate-700">{official.email}</p></div><div className="rounded-lg border border-slate-200 bg-slate-100 px-2 py-1"><p className="text-[6px] font-black uppercase tracking-widest text-slate-500">Expire le</p><p className="text-[7px] font-black leading-none text-slate-900">{new Date(official.expirationDate).toLocaleDateString('fr-FR')}</p></div></div></div>
      </div><FlagStrip />
    </div>
  );
};
