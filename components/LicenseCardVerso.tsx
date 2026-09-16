import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { License, LicenseType } from '../types';
import { Logo } from './Logo';
import { SetupService, EntityConfig } from '../services/setupService';

interface LicenseCardVersoProps {
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

export const LicenseCardVerso: React.FC<LicenseCardVersoProps> = ({
  license,
  entityName: propEntityName,
  entityLogo: propEntityLogo,
  entityCountry: propEntityCountry,
}) => {
  const [config, setConfig] = useState<EntityConfig | null>(null);

  useEffect(() => {
    if (!propEntityName || !propEntityCountry) {
      SetupService.getStatus().then(c => setConfig(c)).catch(() => {});
    }
  }, [propEntityName, propEntityCountry]);

  const orgName = propEntityName || config?.entityName || "Fédération Nationale";
  const orgCountry = propEntityCountry || config?.entityCountry || "SN";
  const orgLogo = propEntityLogo || config?.entityLogo || "/logo.png";
  const verifyUrl = `${window.location.origin}/#/verify/${license.id}`;

  const [c1, c2, c3] = getCountryStripColors(orgCountry);

  let headerBg = "bg-emerald-700";
  if (license.type === LicenseType.LIGUE_PRO) {
    headerBg = "bg-[#E31B23]";
  } else if (license.type === LicenseType.LOISIR) {
    headerBg = "bg-[#FCD116] text-slate-900";
  }

  return (
    <div className="w-[85.6mm] h-[54mm] relative bg-white overflow-hidden shadow-2xl print:shadow-none print:border-0 rounded-2xl print:rounded-none flex flex-col font-sans select-none ring-1 ring-black/5">
      {/* Header Verso */}
      <div className={`h-[13mm] ${headerBg} flex items-center justify-between px-4 relative overflow-hidden text-white`}>
        <div className="absolute top-0 right-0 h-full w-[45%] skew-x-[-20deg] translate-x-5 bg-white/10" />
        <div className="flex items-center gap-3 z-10 w-full">
          <div className="bg-white rounded-xl p-1 shadow-sm shrink-0">
            <Logo className="h-8 w-8" src={orgLogo} />
          </div>
          <div>
            <h2 className="text-[9px] font-black uppercase leading-none">{orgName}</h2>
            <p className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.1em] opacity-80">
              Licence Officielle · Verso
            </p>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 px-4 py-2 flex items-center justify-between gap-3 bg-gradient-to-br from-white to-slate-50 text-slate-700">
        
        {/* Left: QR Code & Verification */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="h-[22mm] w-[22mm] bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <QRCodeSVG
              value={verifyUrl}
              size={120}
              level="H"
              includeMargin={false}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <span className="mt-1 text-[6.5px] font-mono font-bold text-slate-400">
            {license.id}
          </span>
        </div>

        {/* Right: Legal & Security Details */}
        <div className="flex-1 flex flex-col justify-between h-full py-0.5 text-left">
          <div className="space-y-1">
            <p className="text-[7.5px] font-black uppercase text-slate-900 tracking-wide border-b border-slate-200 pb-1">
              Conditions Générales & Assurance
            </p>
            <ul className="text-[6px] text-slate-600 space-y-1 leading-tight list-disc pl-2.5">
              <li>Carte strictement <strong>personnelle et incessible</strong>.</li>
              <li>Couverture assurance responsabilité civile & individuelle accident lors des activités reconnues.</li>
              <li>Le titulaire s'engage au respect des règles sportives et d'éthique de la fédération.</li>
              <li>Scannez le QR code pour consulter la validité en temps réel.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[6.5px] font-semibold text-slate-500">
            <span>Titulaire : <strong>{license.firstName} {license.lastName}</strong></span>
            <span>Club : <strong>{license.club}</strong></span>
          </div>
        </div>

      </div>

      {/* Tri-Color Bottom Bar according to organizer country */}
      <div className="h-1.5 w-full flex opacity-90">
        <div className="h-full w-1/3" style={{ backgroundColor: c1 }} />
        <div className="h-full w-1/3" style={{ backgroundColor: c2 }} />
        <div className="h-full w-1/3" style={{ backgroundColor: c3 }} />
      </div>
    </div>
  );
};
