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
    <div className="w-[85.6mm] h-[54mm] relative bg-white border border-gray-200 overflow-hidden shadow-lg print:shadow-none print:border-0 rounded-lg print:rounded-none flex flex-col">
      {/* Background patterns */}
      
      {/* Card Header */}
      <div className="h-[12mm] bg-fss-green flex items-center justify-between px-3 relative overflow-hidden">
         {/* Decorative flag stripes */}
        <div className="absolute top-0 right-0 h-full w-16 opacity-20 transform skew-x-12 flex">
             <div className="h-full w-1/3 bg-fss-yellow"></div>
             <div className="h-full w-1/3 bg-fss-red"></div>
        </div>

        <div className="flex items-center gap-2 z-10 w-full">
          {/* Logo container - white circle to ensure logo visibility */}
          <div className="bg-white rounded-full p-0.5 shadow-sm shrink-0">
             <Logo className="h-8 w-8" />
          </div>

          <div className="text-white flex-1 min-w-0">
            <h1 className="text-[8px] font-bold leading-tight truncate">FÉDÉRATION SÉNÉGALAISE DE SURF</h1>
            <p className="text-[6px] font-medium tracking-wide opacity-90 truncate">LICENCE OFFICIELLE / OFFICIAL LICENSE</p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-3 flex gap-3">
        {/* Photo Area */}
        <div className="w-[24mm] flex flex-col gap-1">
          <div className="w-full aspect-[3/4] bg-gray-100 rounded border border-gray-300 overflow-hidden relative">
             {license.photoUrl ? (
                 <img src={license.photoUrl} alt="Portrait" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Photo</div>
             )}
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
            <div>
                <div className="flex justify-between items-start mb-1">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-[6px] text-gray-500 uppercase font-semibold">Nom / Surname</p>
                        <p className="text-xs font-bold text-gray-900 leading-none uppercase truncate">{license.lastName}</p>
                    </div>
                    <div className="text-right shrink-0">
                         <p className="text-[6px] text-gray-500 uppercase font-semibold">N° Licence</p>
                         <p className="text-xs font-bold text-fss-red leading-none">{license.id}</p>
                    </div>
                </div>

                <div className="mb-1">
                    <p className="text-[6px] text-gray-500 uppercase font-semibold">Prénom / Given Name</p>
                    <p className="text-[10px] font-bold text-gray-900 leading-none truncate">{license.firstName}</p>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-1">
                     <div>
                        <p className="text-[6px] text-gray-500 uppercase font-semibold">Club</p>
                        <p className="text-[8px] font-bold text-gray-900 leading-none truncate">{license.club}</p>
                     </div>
                     <div>
                        <p className="text-[6px] text-gray-500 uppercase font-semibold">Catégorie</p>
                        <p className="text-[8px] font-bold text-gray-900 leading-none uppercase">{license.category}</p>
                     </div>
                </div>
            </div>

            <div className="flex justify-between items-end border-t border-gray-100 pt-1">
                <div>
                     <p className="text-[6px] text-gray-500 uppercase font-semibold">Expire le / Expires</p>
                     <p className="text-[9px] font-bold text-gray-900 leading-none">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</p>
                </div>
                {/* QR Code */}
                <div className="h-[14mm] w-[14mm] bg-white shrink-0">
                    <QRCodeSVG value={verifyUrl} size={100} style={{ width: '100%', height: '100%' }} />
                </div>
            </div>
        </div>
      </div>

      {/* Card Footer / Strip */}
      <div className="h-1.5 w-full flex mt-auto">
        <div className="h-full w-1/3 bg-fss-green"></div>
        <div className="h-full w-1/3 bg-fss-yellow"></div>
        <div className="h-full w-1/3 bg-fss-red"></div>
      </div>
    </div>
  );
};