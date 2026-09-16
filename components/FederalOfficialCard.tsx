import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { CountryFlagCorner } from './CountryFlagCorner';
import { FSS_ORGANIGRAMME_URL } from '../config/federation';
import { FederalOfficial } from '../types';
import { SetupService, EntityConfig } from '../services/setupService';

interface FederalOfficialCardProps {
  official: FederalOfficial;
  side: 'front' | 'back';
  entityName?: string;
  entityCountry?: string;
  entityLogo?: string;
  entityFlag?: string;
  entityAffiliations?: string;
}

export const parseAffiliations = (affiliationsStr?: string | null): string[] => {
  if (!affiliationsStr || !affiliationsStr.trim()) return [];
  try {
    if (affiliationsStr.startsWith('[') && affiliationsStr.endsWith(']')) {
      const parsed = JSON.parse(affiliationsStr);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
    }
  } catch {}
  return affiliationsStr.split(',').map(s => s.trim()).filter(Boolean);
};

const getCountryStripColors = (country?: string | null): [string, string, string] => {
  const code = (country || 'SN').trim().toUpperCase();
  if (code === 'GA' || code === 'GABON') return ['#009E60', '#FCD116', '#0072CE'];
  if (code === 'FR' || code === 'FRANCE') return ['#002395', '#FFFFFF', '#ED2939'];
  if (code === 'CI' || code.includes("IVOIRE")) return ['#F77F00', '#FFFFFF', '#009E60'];
  if (code === 'MA' || code === 'MAROC') return ['#C1272D', '#006233', '#C1272D'];
  if (code === 'BR' || code.includes("BRESIL")) return ['#009C3B', '#FFDF00', '#002776'];
  if (code === 'ES' || code === 'ESPAGNE') return ['#AA151B', '#F1BF00', '#AA151B'];
  return ['#00853F', '#FCD116', '#E31B23'];
};

const FlagStrip: React.FC<{ country?: string | null }> = ({ country }) => {
  const [c1, c2, c3] = getCountryStripColors(country);
  return (
    <div className="h-1.5 w-full flex opacity-90">
      <div className="h-full w-1/3" style={{ backgroundColor: c1 }} />
      <div className="h-full w-1/3" style={{ backgroundColor: c2 }} />
      <div className="h-full w-1/3" style={{ backgroundColor: c3 }} />
    </div>
  );
};

const OlympicRings = () => (
  <svg viewBox="0 0 100 44" className="h-6 w-12 shrink-0" aria-label="CIO">
    <g fill="none" strokeWidth="4">
      <circle cx="18" cy="16" r="11" stroke="#0085c7" />
      <circle cx="50" cy="16" r="11" stroke="#000" />
      <circle cx="82" cy="16" r="11" stroke="#df0024" />
      <circle cx="34" cy="28" r="11" stroke="#f4c300" />
      <circle cx="66" cy="28" r="11" stroke="#009f3d" />
    </g>
  </svg>
);

const PartnerMarks: React.FC<{ affiliations: string[] }> = ({ affiliations }) => {
  if (!affiliations || affiliations.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5">
      {affiliations.map((item, idx) => {
        const upper = item.trim().toUpperCase();
        if (upper === 'CIO' || upper.includes('OLYMP')) {
          return <OlympicRings key={idx} />;
        }
        if (upper === 'ASC') {
          return (
            <span key={idx} className="text-[14px] font-black tracking-tighter text-sky-600 leading-none shrink-0">
              ASC<span className="font-normal text-slate-400">surf</span>
            </span>
          );
        }
        if (upper === 'ISA') {
          return (
            <span key={idx} className="text-[12px] font-black tracking-tighter text-sky-700 leading-none shrink-0">
              ISA<span className="block -mt-0.5 text-[3.5px] font-bold tracking-normal text-slate-400">INTERNATIONAL SURFING ASSOC</span>
            </span>
          );
        }
        return (
          <span
            key={idx}
            className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-[8.5px] font-black tracking-wider text-slate-800 uppercase leading-none shadow-2xs shrink-0"
          >
            {item}
          </span>
        );
      })}
    </div>
  );
};

const titleFontSize = (title: string) => Math.max(5, Math.min(10, 180 / Math.max(title.length, 1)));

export const FederalOfficialCard: React.FC<FederalOfficialCardProps> = ({ 
  official, 
  side,
  entityName: propEntityName,
  entityCountry: propEntityCountry,
  entityLogo: propEntityLogo,
  entityFlag: propEntityFlag,
  entityAffiliations: propEntityAffiliations
}) => {
  const [config, setConfig] = useState<EntityConfig | null>(null);

  useEffect(() => {
    if (!propEntityName || !propEntityCountry || propEntityAffiliations === undefined) {
      SetupService.getStatus().then(c => setConfig(c)).catch(() => {});
    }
  }, [propEntityName, propEntityCountry, propEntityAffiliations]);

  const orgName = propEntityName || config?.entityName || "Fédération Sénégalaise de Surf";
  const orgCountry = propEntityCountry || config?.entityCountry || "SN";
  const orgFlag = propEntityFlag || config?.entityFlag || null;
  const orgLogo = propEntityLogo || config?.entityLogo || "/logo.png";
  const rawAffiliations = propEntityAffiliations !== undefined ? propEntityAffiliations : (config?.entityAffiliations ?? "");
  const affiliationsList = parseAffiliations(rawAffiliations);

  if (side === 'back') {
    return (
      <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
        <div className="h-[14mm] bg-emerald-700 relative overflow-hidden px-4 flex items-center">
          <div className="absolute right-0 top-0 h-full w-[45%] skew-x-[-20deg] translate-x-5 bg-white/10" />
          <div className="relative z-10 flex items-center gap-3 text-white">
            <div className="rounded-xl bg-white p-1">
              <Logo className="h-10 w-10" src={orgLogo} />
            </div>
            <div>
              <h2 className="text-[9px] font-black uppercase leading-none">{orgName}</h2>
              <p className="mt-1 text-[7px] font-bold uppercase tracking-[0.12em] text-white/80">Carte professionnelle · verso</p>
            </div>
          </div>
        </div>
        <div className="flex h-[calc(54mm-14mm-6px)] flex-col items-center justify-center bg-gradient-to-br from-white to-slate-50">
          <p className="mb-2 text-[7px] font-black uppercase tracking-[0.14em] text-slate-500">Organigramme officiel</p>
          <div className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <QRCodeSVG value={FSS_ORGANIGRAMME_URL} size={106} level="H" includeMargin={false} />
          </div>
          <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700">Scanner pour consulter l'organigramme</p>
          <p className="mt-1 text-[6px] font-mono font-bold text-slate-400">{official.id}</p>
        </div>
        <FlagStrip country={orgCountry} />
      </div>
    );
  }

  return (
    <div className="w-[85.6mm] h-[54mm] relative overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 print:rounded-none print:shadow-none">
      {/* Dynamic country flag corner in top-left */}
      <CountryFlagCorner country={orgCountry} flagUrl={orgFlag} />

      <div className="relative z-10 flex h-[calc(54mm-10mm)] items-center gap-4 bg-white px-5 py-3">
        <div className="min-w-0 flex-1 self-start pt-[22mm] text-center">
          <h2 className="whitespace-nowrap text-[12px] uppercase leading-none tracking-tight text-slate-950">
            <span className="font-medium">{official.firstName} </span>
            <span className="font-black">{official.lastName}</span>
          </h2>
          <p 
            style={{ fontSize: `${titleFontSize(official.title)}px` }} 
            className="mt-3 whitespace-nowrap font-black leading-none tracking-wide text-slate-950 uppercase"
          >
            {official.title}
          </p>
        </div>
        <div className="w-[25mm] shrink-0 self-center">
          <div className="h-[28mm] overflow-hidden bg-slate-100 shadow-md">
            {official.photoUrl ? (
              <img 
                src={official.photoUrl} 
                alt={`${official.firstName} ${official.lastName}`} 
                className="h-full w-full object-cover" 
                style={{ objectPosition: `${official.photoPositionX ?? 50}% ${official.photoPositionY ?? 50}%` }} 
              />
            ) : (
              <div className="flex h-full items-center justify-center text-[7px] font-bold uppercase text-slate-300">
                Photo
              </div>
            )}
          </div>
        </div>
      </div>
      {affiliationsList.length > 0 && (
        <div className="absolute bottom-[11mm] left-[8mm] z-20">
          <PartnerMarks affiliations={affiliationsList} />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-emerald-700 pt-2 text-center text-[12px] font-black uppercase tracking-[0.1em] text-white">
        {orgName}
      </div>
    </div>
  );
};
