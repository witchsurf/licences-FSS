import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { FSS_ORGANIGRAMME_URL } from '../config/federation';
import { FederalOfficial } from '../types';

interface FederalOfficialCardProps { official: FederalOfficial; side: 'front' | 'back'; }

const FlagStrip = () => <div className="h-1.5 w-full flex opacity-90"><div className="h-full w-1/3 bg-[#00853F]" /><div className="h-full w-1/3 bg-[#FCD116]" /><div className="h-full w-1/3 bg-[#E31B23]" /></div>;
const OlympicRings = () => <svg viewBox="0 0 100 44" className="h-7 w-14" aria-label="CIO"><g fill="none" strokeWidth="4"><circle cx="18" cy="16" r="11" stroke="#0085c7" /><circle cx="50" cy="16" r="11" stroke="#000" /><circle cx="82" cy="16" r="11" stroke="#df0024" /><circle cx="34" cy="28" r="11" stroke="#f4c300" /><circle cx="66" cy="28" r="11" stroke="#009f3d" /></g></svg>;
const PartnerMarks = () => <div className="flex items-center gap-3"><OlympicRings /><span className="text-[15px] font-black tracking-tighter text-sky-600">ASC<span className="font-normal text-slate-400">surf</span></span><span className="text-[13px] font-black tracking-tighter text-sky-700">ISA<span className="block -mt-1 text-[4px] font-bold tracking-normal text-slate-400">INTERNATIONAL SURFING ASSOCIATION</span></span></div>;
const SenegalFlagCorner = () => <svg viewBox="0 0 140 140" className="absolute left-0 top-0 z-20 h-[35mm] w-[35mm]" aria-label="Drapeau du Sénégal"><polygon points="0,0 58,0 0,58" fill="#00853F" /><polygon points="58,0 96,0 0,96 0,58" fill="#FCD116" /><polygon points="96,0 140,0 0,140 0,96" fill="#E31B23" /><text x="26" y="50" fill="#00853F" fontSize="25">★</text></svg>;
const titleFontSize = (title: string) => Math.max(5, Math.min(10, 180 / Math.max(title.length, 1)));

export const FederalOfficialCard: React.FC<FederalOfficialCardProps> = ({ official, side }) => {
  if (side === 'back') return (
    <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
      <div className="h-[14mm] bg-fss-green relative overflow-hidden px-4 flex items-center"><div className="absolute right-0 top-0 h-full w-[45%] skew-x-[-20deg] translate-x-5 bg-white/10" /><div className="relative z-10 flex items-center gap-3 text-white"><div className="rounded-xl bg-white p-1"><Logo className="h-10 w-10" /></div><div><h2 className="text-[9px] font-black uppercase leading-none">Fédération Sénégalaise de Surf</h2><p className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em] text-white/80">Carte professionnelle · verso</p></div></div></div>
      <div className="flex h-[calc(54mm-14mm-6px)] flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50"><p className="mb-2 text-[7px] font-black uppercase tracking-[0.14em] text-slate-500">Organigramme fédéral</p><div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm"><QRCodeSVG value={FSS_ORGANIGRAMME_URL} size={106} level="H" includeMargin={false} /></div><p className="mt-2 text-[7px] font-bold uppercase tracking-[0.1em] text-fss-green">Scanner pour consulter l'organigramme</p><p className="mt-1 text-[6px] font-mono font-bold text-slate-400">{official.id}</p></div><FlagStrip />
    </div>
  );

  return (
    <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
      <SenegalFlagCorner />
      <div className="relative z-10 flex h-[calc(54mm-10mm)] items-center gap-4 bg-white px-5 py-3"><div className="min-w-0 flex-1 self-start pt-[22mm] text-center"><h2 className="whitespace-nowrap text-[12px] uppercase leading-none tracking-tight text-slate-950"><span className="font-medium">{official.firstName} </span><span className="font-black">{official.lastName}</span></h2><p style={{ fontSize: `${titleFontSize(official.title)}px` }} className="mt-3 whitespace-nowrap font-black leading-none tracking-wide text-slate-950 uppercase">{official.title}</p></div><div className="w-[25mm] shrink-0 self-center"><div className="h-[28mm] overflow-hidden bg-slate-100 shadow-md">{official.photoUrl ? <img src={official.photoUrl} alt={`${official.firstName} ${official.lastName}`} className="h-full w-full object-cover" style={{ objectPosition: `${official.photoPositionX ?? 50}% ${official.photoPositionY ?? 50}%` }} /> : <div className="flex h-full items-center justify-center text-[7px] font-bold uppercase text-slate-300">Photo</div>}</div></div></div>
      <div className="absolute bottom-[11mm] left-[8mm] z-20"><PartnerMarks /></div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#00853F] pt-2 text-center text-[12px] font-black uppercase tracking-[0.1em] text-white">Fédération Sénégalaise de Surf</div>
    </div>
  );
};
