import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Logo } from './Logo';
import { CountryFlagCorner } from './CountryFlagCorner';
import { FSS_ORGANIGRAMME_URL } from '../config/federation';
import { FederalOfficial } from '../types';
import { SetupService, EntityConfig, InstitutionAffiliation } from '../services/setupService';

interface FederalOfficialCardProps {
  official: FederalOfficial;
  side: 'front' | 'back';
  entityName?: string;
  entityCountry?: string;
  entityLogo?: string;
  entityFlag?: string;
  entityAffiliations?: string;
}

export const parseAffiliations = (affiliationsStr?: string | null): InstitutionAffiliation[] => {
  if (!affiliationsStr || !affiliationsStr.trim()) return [];
  try {
    if (affiliationsStr.startsWith('[') && affiliationsStr.endsWith(']')) {
      const parsed = JSON.parse(affiliationsStr);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          if (typeof item === 'string') {
            return { id: item.toLowerCase().replace(/\s+/g, '-'), name: item.trim() };
          }
          if (item && typeof item === 'object') {
            const logo = (item.logoUrl && item.logoUrl !== '/logo.png' && item.logoUrl !== '/isa_logo.svg') ? item.logoUrl : undefined;
            return {
              id: item.id || `inst-${index}`,
              name: item.name || '',
              logoUrl: logo,
            };
          }
          return null;
        }).filter(Boolean) as InstitutionAffiliation[];
      }
    }
  } catch {}
  return affiliationsStr.split(',').map((s, idx) => {
    const name = s.trim();
    return { id: name.toLowerCase().replace(/\s+/g, '-'), name };
  }).filter(item => Boolean(item.name));
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
    <div className="absolute top-0 left-0 right-0 h-1.5 flex z-10 overflow-hidden">
      <div className="flex-1" style={{ backgroundColor: c1 }} />
      <div className="flex-1" style={{ backgroundColor: c2 }} />
      <div className="flex-1" style={{ backgroundColor: c3 }} />
    </div>
  );
};

export const OlympicRings: React.FC<{ className?: string }> = ({ className = "h-6.5 sm:h-7" }) => (
  <svg 
    viewBox="0 0 100 42" 
    className={`${className} w-auto max-h-[7mm] max-w-[22mm] shrink-0`} 
    fill="none" 
    strokeWidth="3.8"
    role="img"
    aria-label="Anneaux Olympiques"
  >
    <title>Comité International Olympique</title>
    <g transform="translate(0, 1)">
      <circle cx="18" cy="15" r="12" stroke="#0085C7" />
      <circle cx="50" cy="15" r="12" stroke="#111827" />
      <circle cx="82" cy="15" r="12" stroke="#DF0024" />
      <circle cx="34" cy="27" r="12" stroke="#F4C300" />
      <circle cx="66" cy="27" r="12" stroke="#009F3D" />
    </g>
  </svg>
);

export const CNOSSBadge: React.FC<{ className?: string; title?: string }> = ({ 
  className = "h-6.5 sm:h-7", 
  title = "Comité National Olympique et Sportif Sénégalais" 
}) => (
  <svg 
    viewBox="0 0 130 42" 
    className={`${className} w-auto max-h-[7mm] max-w-[24mm] shrink-0`} 
    role="img" 
    aria-label={title}
  >
    <title>{title}</title>
    {/* Circular Olympic Crest on the left (proportional to ASC height) */}
    <g transform="translate(2, 2)">
      <circle cx="19" cy="19" r="18" fill="#ffffff" stroke="#00853F" strokeWidth="1.5" />
      <circle cx="19" cy="19" r="16.5" fill="none" stroke="#FCD116" strokeWidth="0.8" />
      
      {/* Senegal Tricolor Flag in Center */}
      <g transform="translate(11.5, 6)">
        <rect x="0" y="0" width="5" height="11" rx="0.5" fill="#00853F" />
        <rect x="5" y="0" width="5" height="11" fill="#FCD116" />
        <rect x="10" y="0" width="5" height="11" rx="0.5" fill="#E31B23" />
        <polygon
          points="7.5,2.5 8.2,4.8 10.5,4.8 8.6,6.2 9.3,8.5 7.5,7.1 5.7,8.5 6.4,6.2 4.5,4.8 6.8,4.8"
          fill="#00853F"
        />
      </g>

      {/* Olympic Rings underneath flag */}
      <g transform="translate(6, 18) scale(0.26)" fill="none" strokeWidth="4">
        <circle cx="18" cy="16" r="11" stroke="#0085C7" />
        <circle cx="50" cy="16" r="11" stroke="#111827" />
        <circle cx="82" cy="16" r="11" stroke="#DF0024" />
        <circle cx="34" cy="28" r="11" stroke="#F4C300" />
        <circle cx="66" cy="28" r="11" stroke="#009F3D" />
      </g>
    </g>

    {/* Bold CNOSS text matching ASC typography and scale */}
    <text 
      x="43" 
      y="26" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="24" 
      fontWeight="900" 
      letterSpacing="-0.01em" 
      fill="#00853F"
    >
      CNOSS
    </text>
    <text 
      x="44" 
      y="38" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="7.5" 
      fontWeight="800" 
      letterSpacing="0.14em" 
      fill="#1E293B"
    >
      SÉNÉGAL
    </text>
  </svg>
);

export const ISASurfLogo: React.FC<{ className?: string }> = ({ className = "h-6.5 sm:h-7" }) => (
  <svg 
    viewBox="0 0 135 42" 
    className={`${className} w-auto max-h-[7mm] max-w-[24mm] shrink-0`} 
    role="img" 
    aria-label="International Surfing Association"
  >
    <text 
      x="2" 
      y="27" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="27" 
      fontWeight="900" 
      letterSpacing="-0.02em" 
      fill="#0077C8"
    >
      ISA
    </text>
    <text 
      x="52" 
      y="27" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="25" 
      fontWeight="400" 
      fill="#64748B"
    >
      surf
    </text>
    <text 
      x="3" 
      y="38" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="4.2" 
      fontWeight="700" 
      letterSpacing="0.07em" 
      fill="#475569"
    >
      INTERNATIONAL SURFING ASSOCIATION
    </text>
  </svg>
);

export const ASCSurfLogo: React.FC<{ className?: string }> = ({ className = "h-6.5 sm:h-7" }) => (
  <svg 
    viewBox="0 0 135 42" 
    className={`${className} w-auto max-h-[7mm] max-w-[24mm] shrink-0`} 
    role="img" 
    aria-label="African Surfing Confederation"
  >
    <text 
      x="2" 
      y="27" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="27" 
      fontWeight="900" 
      letterSpacing="-0.02em" 
      fill="#0284C7"
    >
      ASC
    </text>
    <text 
      x="58" 
      y="27" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="25" 
      fontWeight="400" 
      fill="#64748B"
    >
      surf
    </text>
    <text 
      x="3" 
      y="38" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontSize="4.2" 
      fontWeight="700" 
      letterSpacing="0.07em" 
      fill="#475569"
    >
      AFRICAN SURFING CONFEDERATION
    </text>
  </svg>
);

export const PartnerMarks: React.FC<{ affiliations: InstitutionAffiliation[] }> = ({ affiliations }) => {
  if (!affiliations || affiliations.length === 0) return null;

  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      {affiliations.map((item, idx) => {
        // 1. GENERIC RULE: Always respect and display the user's uploaded logo image!
        if (item.logoUrl && item.logoUrl !== '/logo.png' && item.logoUrl !== '/isa_logo.svg') {
          return (
            <img
              key={item.id || idx}
              src={item.logoUrl}
              alt={item.name}
              className="h-6.5 sm:h-7 max-h-[7mm] max-w-[24mm] object-contain shrink-0"
              style={{ imageRendering: '-webkit-optimize-contrast' }}
            />
          );
        }

        // 2. Generic fallbacks when NO custom image is uploaded
        const upper = item.name.trim().toUpperCase();
        if (upper.includes('CNOSS')) {
          return <CNOSSBadge key={item.id || idx} className="h-6.5 sm:h-7" />;
        }
        if (upper === 'CIO' || upper.includes('OLYMP')) {
          return <OlympicRings key={item.id || idx} className="h-6.5 sm:h-7" />;
        }
        if (upper === 'ISA') {
          return <ISASurfLogo key={item.id || idx} className="h-6.5 sm:h-7" />;
        }
        if (upper === 'ASC') {
          return <ASCSurfLogo key={item.id || idx} className="h-6.5 sm:h-7" />;
        }

        return (
          <span
            key={item.id || idx}
            className="inline-flex items-center px-2 py-1 rounded border border-slate-300 bg-slate-50 text-[8px] font-black tracking-wider text-slate-700 uppercase leading-none shadow-2xs shrink-0"
          >
            {item.name}
          </span>
        );
      })}
    </div>
  );
};

export const titleFontSize = (title: string) => Math.max(7.5, Math.min(10.5, 210 / Math.max(title.length, 1)));

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
    const fetchConfig = () => {
      SetupService.getStatus().then(c => setConfig(c)).catch(() => {});
    };

    if (!propEntityName || !propEntityCountry || propEntityAffiliations === undefined || !propEntityLogo || !propEntityFlag) {
      fetchConfig();
    }

    const handleConfigChange = () => {
      fetchConfig();
    };

    window.addEventListener('fss_entity_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('fss_entity_config_changed', handleConfigChange);
    };
  }, [propEntityName, propEntityCountry, propEntityAffiliations, propEntityLogo, propEntityFlag]);

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
              <h2 className="text-[9.5px] font-extrabold uppercase leading-snug tracking-[0.05em]">{orgName}</h2>
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
      <CountryFlagCorner country={orgCountry} flagUrl={orgFlag} className="absolute left-0 top-0 z-10 h-[28mm] w-[28mm] pointer-events-none" />

      <div className="relative z-10 flex h-[calc(54mm-10mm)] items-center gap-4 bg-transparent px-5 py-3">
        <div className="relative z-20 min-w-0 flex-1 self-start pt-[17mm] text-center">
          <h2 className="whitespace-nowrap text-[13px] uppercase leading-snug tracking-[0.05em] text-slate-950">
            <span className="font-semibold">{official.firstName} </span>
            <span className="font-extrabold">{official.lastName}</span>
          </h2>
          <p 
            style={{ 
              fontSize: `${titleFontSize(official.title)}px`,
              letterSpacing: '0.07em'
            }} 
            className="mt-2 whitespace-nowrap font-bold leading-normal text-slate-800 uppercase"
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
        <div className="absolute bottom-[11.5mm] left-[6mm] z-20">
          <PartnerMarks affiliations={affiliationsList} />
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-emerald-700 flex items-center justify-center px-4 text-center text-[12px] font-extrabold uppercase tracking-[0.08em] text-white pb-0.5">
        {orgName}
      </div>
    </div>
  );
};
