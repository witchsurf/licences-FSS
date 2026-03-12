import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { License } from '../types';
import { Logo } from './Logo';

interface LicenseCardProps {
  license: License;
}

export const LicenseCard: React.FC<LicenseCardProps> = ({ license }) => {
  const verifyUrl = `${window.location.origin}/#/verify/${license.id}`;

  return (
    <div className="w-[85.6mm] h-[54mm] relative bg-white overflow-hidden shadow-2xl print:shadow-none print:border-0 rounded-2xl print:rounded-none flex flex-col font-sans select-none ring-1 ring-black/5">
      {/* Header Bar */}
      <div className="h-[14mm] bg-fss-green flex items-center justify-between px-4 relative overflow-hidden">
        {/* Dynamic Wave Overlay */}
        <div className="absolute top-0 right-0 h-full w-[40%] opacity-10 flex skew-x-[-20deg] translate-x-5">
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-white opacity-40"></div>
          <div className="h-full w-1/3 bg-white opacity-20"></div>
        </div>

        <div className="flex items-center gap-3 z-10 w-full">
          <div className="bg-white rounded-xl p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.1)] shrink-0">
            <Logo className="h-7 w-7" />
          </div>

          <div className="text-white flex-1 flex flex-col justify-center">
            <h1 className="text-[9px] font-black leading-none tracking-tighter uppercase mb-0.5">Fédération Sénégalaise de Surf</h1>
            <div className="flex items-center gap-2">
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">Licence Officielle</p>
              <div className="h-1 w-1 bg-white/40 rounded-full"></div>
              <p className="text-[7px] font-bold tracking-[0.1em] opacity-80 uppercase leading-none">Official License</p>
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
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Titulaire / Holder</p>
                <p className="text-[12px] font-black text-slate-900 leading-tight uppercase truncate tracking-tight">{license.lastName}</p>
                <p className="text-[10px] font-bold text-slate-700 leading-tight truncate">{license.firstName}</p>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5">N° Licence</p>
                <p className="text-[12px] font-black text-red-600 leading-tight tracking-tighter font-mono">{license.id}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
              <div>
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Club Affilié</p>
                <p className="text-[8.5px] font-black text-slate-800 leading-tight truncate">{license.club}</p>
              </div>
              <div>
                <p className="text-[6px] text-slate-400 uppercase font-bold tracking-widest mb-0.5">Catégorie</p>
                <p className="text-[8.5px] font-black text-fss-green leading-tight uppercase">{license.category}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1.5">
              <p className="text-[6.5px] text-slate-500 uppercase font-black tracking-widest mb-0.5 leading-none">Expiration</p>
              <p className="text-[10px] font-black text-slate-900 leading-none">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</p>
            </div>

            {/* QR Code Container */}
            <div className="h-[14.5mm] w-[14.5mm] bg-white p-0.5 rounded-lg border border-slate-200 shadow-sm shrink-0 flex items-center justify-center">
              <QRCodeSVG
                value={verifyUrl}
                size={120}
                level="H"
                includeMargin={false}
                imageSettings={{
                  src: "/logo.png",
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

      {/* Decorative Senegal Tri-Color Bottom Bar */}
      <div className="h-1.5 w-full flex opacity-90">
        <div className="h-full w-1/3 bg-[#00853F]"></div>
        <div className="h-full w-1/3 bg-[#FCD116]"></div>
        <div className="h-full w-1/3 bg-[#E31B23]"></div>
      </div>
    </div>
  );
};