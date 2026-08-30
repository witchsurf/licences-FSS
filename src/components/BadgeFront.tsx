import React from 'react';
import { AnyLicence, FederationSettings } from '../types';
import {
  SenegalFlagCorner,
  WaveWatermarkBackground,
  AscSurfLogo,
  OlympicRingsLogo,
  IsaSurfLogo,
  OfficialFSSLogo,
} from './Logos';

interface BadgeFrontProps {
  cadre: AnyLicence;
  settings: FederationSettings;
  id?: string;
}

export const BadgeFront: React.FC<BadgeFrontProps> = ({ cadre, settings, id = 'badge-front' }) => {
  const isCadre = cadre.category === 'CADRE';

  // Bandeau inférieur bleu officiel : FÉDÉRATION SÉNÉGALAISE DE SURF
  const bannerColor = 'bg-[#0080C8]';
  const bannerText = 'FÉDÉRATION SÉNÉGALAISE DE SURF';

  return (
    <div
      id={id}
      className="relative w-[500px] h-[315px] bg-white text-slate-900 overflow-hidden shadow-2xl rounded-2xl border border-slate-200 select-none flex flex-col justify-between"
      style={{
        boxShadow: '0 20px 35px -10px rgba(0, 41, 82, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* 1. Texture Filigrane Vagues d'arrière-plan */}
      <WaveWatermarkBackground className="opacity-[0.07]" />

      {/* 2. Drapeau du Sénégal en coin biseauté Haut-Gauche (Vert, Jaune avec étoile verte au centre, Rouge) */}
      <div className="absolute top-0 left-0 w-36 h-36 z-10 pointer-events-none">
        <SenegalFlagCorner className="w-full h-full" />
      </div>

      {/* 3. En-tête Haut-Droit : Logo Officiel Exact F.S.S. */}
      <div className="absolute top-2 right-4 z-20 flex items-center">
        <div className="w-14 h-16">
          <OfficialFSSLogo className="w-full h-full" />
        </div>
      </div>

      {/* 4. Photo Officielle du Cadre Fédéral (Côté Droit) */}
      <div className="absolute top-[74px] right-4 z-20">
        <div className="relative w-[138px] h-[156px] bg-slate-100 rounded-sm overflow-hidden border-[1.5px] border-[#0080C8]/60 shadow-md">
          {cadre.photoUrl ? (
            <img
              src={cadre.photoUrl}
              alt={`${cadre.prenom} ${cadre.nom}`}
              className="w-full h-full object-cover object-top"
              crossOrigin="anonymous"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
              <svg className="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              <span className="text-[9px] font-semibold mt-1">Photo Officielle</span>
            </div>
          )}
          {/* Filigrane d'authentification sur la photo */}
          <div className="absolute bottom-0 right-0 bg-[#0080C8]/90 text-white font-mono text-[7px] font-bold px-1.5 py-0.5 rounded-tl-sm uppercase tracking-wider">
            OFFICIEL
          </div>
        </div>
      </div>

      {/* 5. Informations Principales du Cadre (Zone Centrale & Gauche) */}
      <div className="relative z-20 pt-[80px] pl-[46px] pr-[160px] flex flex-col justify-start">
        {/* Nom & Prénom en typographie imposante */}
        <h1 className="text-[25px] font-black uppercase tracking-tight leading-none text-[#0a192f] font-sans truncate">
          {cadre.prenom} {cadre.nom}
        </h1>

        {/* Poste Officiel */}
        <div className="mt-2.5 flex flex-col">
          <span className="text-[17px] font-black uppercase tracking-wide leading-tight text-[#0a192f] font-sans">
            {isCadre ? (cadre as any).poste : 'CADRE FÉDÉRAL'}
          </span>
          {isCadre && (cadre as any).sousTitre && (
            <span className="text-[17px] font-black uppercase tracking-wide leading-tight text-[#0a192f] font-sans">
              {(cadre as any).sousTitre}
            </span>
          )}
        </div>

        {/* Matricule & Mandat */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#0080C8] uppercase font-mono">
            {cadre.numeroLicence}
          </span>
          <span className="text-[9px] text-slate-400 font-bold">•</span>
          <span className="text-[9px] font-bold text-slate-600 uppercase">
            MANDAT {cadre.saison || cadre.mandat}
          </span>
        </div>
      </div>

      {/* 6. Logos Partenaires en Bas : Anneaux Olympiques + ISA Surf + ASC Surf */}
      <div className="relative z-20 pl-8 pb-2.5 flex items-center gap-4">
        {settings.showOlympicLogo && <OlympicRingsLogo className="h-5" />}
        {settings.showIsaLogo && <IsaSurfLogo />}
        <AscSurfLogo className="scale-90 origin-left" />
      </div>

      {/* 7. Bandeau Inférieur Bleu : FÉDÉRATION SÉNÉGALAISE DE SURF */}
      <div className={`relative z-20 w-full h-[38px] ${bannerColor} flex items-center justify-center shadow-inner overflow-hidden`}>
        {/* Décoration géométrique biseautée */}
        <div className="absolute left-0 top-0 bottom-0 w-6 bg-[#005a8c] -skew-x-12 transform -translate-x-2" />
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-[#005a8c] -skew-x-12 transform translate-x-2" />

        <div className="flex items-center gap-2 text-white font-black tracking-wider text-[13px] uppercase font-sans drop-shadow-sm px-4 text-center">
          <span>{bannerText}</span>
        </div>
      </div>
    </div>
  );
};
