import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { License, LicenseType } from '../types';
import { Logo } from './Logo';
import { AutoFitText } from './AutoFitText';

import { SetupService, EntityConfig } from '../services/setupService';

interface LicenseCardProps {
  license: License;
  entityName?: string;
  entityLogo?: string;
  entityCountry?: string;
}

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

export const LicenseCard: React.FC<LicenseCardProps> = ({ 
  license, 
  entityName: propEntityName, 
  entityLogo: propEntityLogo,
  entityCountry: propEntityCountry
}) => {
  const [config, setConfig] = React.useState<EntityConfig | null>(null);

  React.useEffect(() => {
    const fetchConfig = () => {
      SetupService.getStatus().then(c => setConfig(c)).catch(() => {});
    };

    if (!propEntityName || !propEntityCountry || !propEntityLogo) {
      fetchConfig();
    }

    const handleConfigChange = () => {
      fetchConfig();
    };

    window.addEventListener('fss_entity_config_changed', handleConfigChange);
    return () => {
      window.removeEventListener('fss_entity_config_changed', handleConfigChange);
    };
  }, [propEntityName, propEntityCountry, propEntityLogo]);

  const verifyUrl = `${window.location.origin}/#/verify/${license.id}`;

  let headerBg = "bg-emerald-700";
  let textClass = "text-white";
  let headerTitleFr = "Licence Officielle";
  let headerTitleEn = "Official License";

  const orgCountry = propEntityCountry || config?.entityCountry || "SN";
  const [c1, c2, c3] = getCountryStripColors(orgCountry);

  let logoSrc = propEntityLogo || config?.entityLogo || "/logo.png";
  const orgName = propEntityName || config?.entityName || "Fédération Sénégalaise de Surf";

  if (license.type === LicenseType.LIGUE_PRO) {
    headerBg = "bg-[#E31B23]";
    headerTitleFr = "LIGUE PRO";
    headerTitleEn = "PRO LEAGUE";
    if (!propEntityLogo && !config?.entityLogo) logoSrc = "/ligue_pro_logo.png";
  } else if (license.type === LicenseType.LOISIR) {
    headerBg = "bg-[#FCD116]";
    textClass = "text-slate-900";
    headerTitleFr = "Licence Loisir";
    headerTitleEn = "Leisure License";
  }

  return (
    <div className="w-[85.6mm] h-[54mm] relative bg-white overflow-hidden shadow-2xl print:shadow-none print:border-0 rounded-2xl print:rounded-none flex flex-col font-sans select-none ring-1 ring-black/5">
      {/* Header Bar */}
      <div className={`h-[14mm] ${headerBg} flex items-center justify-between px-4 relative overflow-hidden`}>
        {/* Dynamic Wave Overlay */}
        <div className="absolute top-0 right-0 h-full w-[40%] opacity-10 flex skew-x-[-20deg] translate-x-5">
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-white opacity-40"></div>
          <div className="h-full w-1/3 bg-white opacity-20"></div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full">
          <div className="bg-white rounded-xl p-1 shadow-[0_2px_10px_rgba(0,0,0,0.1)] shrink-0">
            <Logo className="h-10 w-10" src={logoSrc} />
          </div>

          <div className={`${textClass} flex-1 flex flex-col justify-center`}>
            <h1 className="text-[9px] font-extrabold leading-none tracking-[0.03em] uppercase mb-0.5">{orgName}</h1>
            <div className="flex items-center gap-2">
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">{headerTitleFr}</p>
              <div className={`h-1 w-1 ${license.type === LicenseType.LOISIR ? 'bg-slate-900/40' : 'bg-white/40'} rounded-full`}></div>
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">{headerTitleEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 px-3.5 py-2 flex gap-3.5 bg-gradient-to-br from-white to-slate-50">
        {/* Profile Visual */}
        <div className="w-[26mm] shrink-0">
          <div className="w-full aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden shadow-inner ring-1 ring-slate-200 relative">
            {license.photoUrl ? (
              <img src={license.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">Photo</div>
            )}
            {/* ID Overlay on photo for security feel */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[2px] py-0.5 px-1.5 flex items-center justify-center">
              <span className="text-[7px] text-white font-mono font-bold tracking-normal">VERIFIED: {license.id.split('-').pop()}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-normal">Titulaire / Holder</p>
                <AutoFitText
                  maxFontSize={12}
                  minFontSize={7}
                  className="font-extrabold text-slate-900 leading-tight uppercase tracking-[0.02em]"
                >
                  {license.lastName}
                </AutoFitText>
                <AutoFitText
                  maxFontSize={10}
                  minFontSize={7}
                  className="font-bold text-slate-700 leading-tight tracking-[0.01em]"
                >
                  {license.firstName}
                </AutoFitText>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-normal">N° Licence</p>
                <p className="text-[12px] font-extrabold text-red-600 leading-normal tracking-[0.04em] font-mono">{license.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1.3fr_1fr] gap-2 border-t border-slate-100 pt-1">
              <div className="min-w-0">
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5 leading-normal">Club Affilié</p>
                <AutoFitText
                  maxFontSize={8.5}
                  minFontSize={5}
                  className="font-bold text-slate-800 leading-tight uppercase tracking-[0.01em]"
                >
                  {license.club}
                </AutoFitText>
              </div>
              <div className="min-w-0">
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5 leading-normal">Catégorie</p>
                <p className="text-[8.5px] font-extrabold text-fss-green leading-normal uppercase tracking-[0.02em] truncate">{license.category}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end pt-1">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5">
              <p className="text-[6px] text-slate-500 uppercase font-black tracking-widest leading-normal">Expiration</p>
              <p className="text-[9.5px] font-black text-slate-900 leading-normal">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</p>
            </div>

            {/* QR Code Container */}
            <div className="relative h-[12mm] w-[12mm] bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={verifyUrl}
                size={100}
                level="H"
                includeMargin={false}
                style={{ width: '100%', height: '100%' }}
              />
              {/* Federal logo in the center of QR code (HTML img for guaranteed html2canvas & print rendering) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3.5 h-3.5 bg-white rounded-full p-0.5 shadow-xs flex items-center justify-center border border-slate-100">
                  <img
                    src={logoSrc}
                    alt="Logo"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Tri-Color Bottom Bar */}
      <div className="h-1.5 w-full flex opacity-90">
        <div className="h-full w-1/3" style={{ backgroundColor: c1 }}></div>
        <div className="h-full w-1/3" style={{ backgroundColor: c2 }}></div>
        <div className="h-full w-1/3" style={{ backgroundColor: c3 }}></div>
      </div>
    </div>
  );
};
