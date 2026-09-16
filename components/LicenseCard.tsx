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
            <h1 className="text-[9px] font-black leading-none tracking-tighter uppercase mb-0.5">{orgName}</h1>
            <div className="flex items-center gap-2">
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">{headerTitleFr}</p>
              <div className={`h-1 w-1 ${license.type === LicenseType.LOISIR ? 'bg-slate-900/40' : 'bg-white/40'} rounded-full`}></div>
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">{headerTitleEn}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 p-3.5 flex gap-4 bg-gradient-to-br from-white to-slate-50">
        {/* Profile Visual */}
        <div className="w-[26mm] shrink-0">
          <div className="w-full aspect-[4/5] bg-slate-100 rounded-xl overflow-hidden shadow-inner ring-1 ring-slate-200 relative">
            {license.photoUrl ? (
              <img src={license.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-bold uppercase tracking-widest">Photo</div>
            )}
            {/* ID Overlay on photo for security feel */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-[2px] py-1 px-1.5 flex items-center justify-center">
              <span className="text-[7px] text-white font-mono font-bold tracking-tight">VERIFIED: {license.id.split('-').pop()}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="flex-1 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-normal">Titulaire / Holder</p>
                <AutoFitText
                  maxFontSize={12}
                  minFontSize={7}
                  className="font-black text-slate-900 leading-normal uppercase tracking-tight"
                >
                  {license.lastName}
                </AutoFitText>
                <AutoFitText
                  maxFontSize={10}
                  minFontSize={7}
                  className="font-bold text-slate-700 leading-normal"
                >
                  {license.firstName}
                </AutoFitText>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-normal">N° Licence</p>
                <p className="text-[12px] font-black text-red-600 leading-normal tracking-tighter font-mono">{license.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-[1.4fr_1fr] gap-2 border-t border-slate-100 pt-2">
              <div className="min-w-0">
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5 leading-normal">Club Affilié</p>
                <AutoFitText
                  maxFontSize={8.5}
                  minFontSize={5}
                  className="font-black text-slate-800 leading-normal uppercase tracking-tight"
                >
                  {license.club}
                </AutoFitText>
              </div>
              <div className="min-w-0">
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5 leading-normal">Catégorie</p>
                <p className="text-[8.5px] font-black text-fss-green leading-normal uppercase overflow-visible">{license.category}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1">
              <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-normal">Expiration</p>
              <p className="text-[10px] font-black text-slate-900 leading-normal">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</p>
            </div>

            {/* QR Code Container */}
            <div className="h-[14.5mm] w-[14.5mm] bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={verifyUrl}
                size={120}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: logoSrc,
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true,
                }}
                style={{ width: '100%', height: '100%' }}
              />
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
