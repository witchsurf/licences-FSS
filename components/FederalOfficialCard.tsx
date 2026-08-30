import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { FSS_ORGANIGRAMME_URL } from '../config/federation';

export interface FederalOfficial {
  id: string;
  title: string;
  name?: string;
  photoUrl?: string;
}

interface FederalOfficialCardProps {
  official: FederalOfficial;
  side: 'front' | 'back';
}

export const FederalOfficialCard: React.FC<FederalOfficialCardProps> = ({ official, side }) => {
  if (side === 'back') {
    return (
      <div className="federal-card federal-card-back">
        <div className="federal-back-flag" />
        <div className="relative z-10 flex h-full flex-col items-center justify-between px-8 py-7 text-center">
          <Logo className="h-16 w-16" />
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Fédération Sénégalaise de Surf</p>
            <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.17em] text-white/75">Carte professionnelle officielle</p>
          </div>
          <div className="rounded-2xl bg-white p-2 shadow-xl">
            <QRCodeSVG value={FSS_ORGANIGRAMME_URL} size={132} level="H" includeMargin={false} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.13em] text-white">Scanner pour consulter l'organigramme</p>
            <p className="mt-1 text-[7px] font-semibold tracking-wide text-white/70">{official.id} · Mandat 2025 – 2028</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="federal-card federal-card-front">
      <div className="federal-card-flag" />
      <div className="federal-card-wave wave-one" />
      <div className="federal-card-wave wave-two" />
      <div className="relative z-10 flex h-full flex-col p-7">
        <div className="flex items-start justify-between pl-16">
          <div className="text-[7px] font-black uppercase tracking-[0.18em] text-slate-500">Carte professionnelle</div>
          <Logo className="h-12 w-12" />
        </div>
        <div className="mt-5 flex flex-1 items-center gap-5">
          <div className="min-w-0 flex-1 pl-16">
            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-sky-700">Cadre fédéral</p>
            <h2 className="mt-2 text-[23px] font-black leading-[0.92] tracking-tight text-slate-900 uppercase">{official.name || 'NOM À RENSEIGNER'}</h2>
            <p className="mt-3 text-[12px] font-black leading-tight tracking-wide text-slate-700 uppercase">{official.title}</p>
            <p className="mt-5 font-mono text-[8px] font-bold tracking-[0.12em] text-sky-700">{official.id} <span className="text-slate-400">•</span> MANDAT 2025 – 2028</p>
          </div>
          <div className="h-[154px] w-[122px] shrink-0 overflow-hidden rounded-sm border-2 border-sky-400 bg-slate-100 shadow-lg">
            {official.photoUrl ? <img src={official.photoUrl} alt={official.name || official.title} className="h-full w-full object-cover" /> : (
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100 text-center">
                <span className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-400">Photo</span>
                <span className="mt-1 text-[6px] font-bold uppercase text-slate-400">à renseigner</span>
              </div>
            )}
          </div>
        </div>
        <div className="ml-16 mt-3 flex items-center gap-4 text-[7px] font-bold uppercase tracking-wider text-slate-500">
          <span>FSS</span><span className="h-1 w-1 rounded-full bg-slate-400" /><span>République du Sénégal</span>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-sky-600 px-8 pl-24 pt-2 text-center text-[12px] font-black uppercase tracking-[0.13em] text-white">Fédération Sénégalaise de Surf</div>
    </div>
  );
};
