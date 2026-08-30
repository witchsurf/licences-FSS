import React, { useEffect, useState } from 'react';
import { AnyLicence, FederationSettings } from '../types';
import { WaveWatermarkBackground, OfficialStampFSS } from './Logos';
import { generateBadgeQRCodeUrl } from '../utils/qrGenerator';
import { ShieldCheck, HeartPulse, Trophy, Waves, Phone, QrCode } from 'lucide-react';

interface BadgeBackProps {
  cadre: AnyLicence;
  settings: FederationSettings;
  id?: string;
}

export const BadgeBack: React.FC<BadgeBackProps> = ({ cadre, settings, id = 'badge-back' }) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    generateBadgeQRCodeUrl(cadre, settings).then(setQrCodeDataUrl);
  }, [cadre, settings]);

  const isCadre = cadre.category === 'CADRE';
  const isCompetition = cadre.category === 'COMPETITION';
  const isLoisir = cadre.category === 'LOISIR';
  const isLiguePro = cadre.category === 'LIGUE_PRO';

  let headerTitle = "CARTE D'ACCRÉDITATION FÉDÉRALE";
  let qrSubtitle = "Organigramme & FSS Web";

  if (isCompetition) {
    headerTitle = "LICENCE NATIONALE DE COMPÉTITION";
    qrSubtitle = "Vérification Licence Athlète";
  } else if (isLoisir) {
    headerTitle = "LICENCE LOISIR & ATTESTATION ASSURANCE";
    qrSubtitle = "Garanties & Assurance FSS";
  } else if (isLiguePro) {
    headerTitle = "PASSEPORT ATHLÈTE LIGUE PROFESSIONNELLE";
    qrSubtitle = "Profil Pro & Ranking WSL";
  }

  return (
    <div
      id={id}
      className="relative w-[500px] h-[315px] bg-[#f8fafc] text-slate-900 overflow-hidden shadow-2xl rounded-2xl border border-slate-200 select-none flex flex-col justify-between"
      style={{
        boxShadow: '0 20px 35px -10px rgba(0, 41, 82, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }}
    >
      {/* Texture Filigrane Vagues */}
      <WaveWatermarkBackground className="opacity-[0.05]" />

      {/* En-tête officiel du Verso */}
      <div className="relative z-10 bg-gradient-to-r from-[#003764] via-[#0080C8] to-[#003764] text-white px-5 py-2 flex items-center justify-between shadow-sm">
        <div className="flex flex-col">
          <span className="text-[7.5px] font-bold uppercase tracking-wider text-amber-300">
            RÉPUBLIQUE DU SÉNÉGAL • MINISTÈRE DES SPORTS
          </span>
          <span className="text-[11px] font-black tracking-wide uppercase">
            {headerTitle}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[8px] font-mono font-bold tracking-widest uppercase text-white">
            {cadre.numeroLicence}
          </span>
        </div>
      </div>

      {/* Corps du Verso (Division en 2 colonnes : QR Code & Détails spécifiques) */}
      <div className="relative z-10 px-5 py-2.5 grid grid-cols-12 gap-3 flex-1 items-center">
        {/* Colonne Gauche : QR Code Interactif */}
        <div className="col-span-5 flex flex-col items-center justify-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative p-1 bg-white border border-[#0080C8]/40 rounded-lg shadow-inner">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt="QR Code de Vérification"
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-100 animate-pulse rounded flex items-center justify-center text-[9px] text-slate-400">
                Génération...
              </div>
            )}
          </div>

          <div className="mt-1.5 text-center">
            <span className="text-[8px] font-extrabold text-[#0080C8] uppercase tracking-wide block">
              SCANNER POUR VÉRIFIER
            </span>
            <span className="text-[6.5px] text-slate-500 font-medium block truncate max-w-[130px]">
              {qrSubtitle}
            </span>
          </div>
        </div>

        {/* Colonne Droite : Données Spécifiques par Catégorie */}
        <div className="col-span-7 flex flex-col justify-between h-full pl-1">
          {/* Détails du Titulaire */}
          <div className="space-y-1">
            <div className="grid grid-cols-2 gap-x-2 text-[8px]">
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Titulaire</span>
                <span className="font-bold text-slate-900 uppercase truncate block">
                  {cadre.prenom} {cadre.nom}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase">Catégorie</span>
                <span className="font-bold text-[#0080C8] uppercase truncate block">
                  {isCadre && (cadre as any).poste}
                  {isCompetition && (cadre as any).discipline}
                  {isLoisir && `Loisir ${(cadre as any).niveauPratique}`}
                  {isLiguePro && (cadre as any).statutAthletique}
                </span>
              </div>
            </div>

            {/* Informations selon le type de licence */}
            {isCadre && (
              <div className="grid grid-cols-2 gap-x-2 text-[8px] pt-0.5">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Mandat Fédéral</span>
                  <span className="font-bold text-slate-800">{cadre.saison}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Commission</span>
                  <span className="font-bold text-slate-800 truncate block">
                    {(cadre as any).commission || 'Comité Directeur'}
                  </span>
                </div>
              </div>
            )}

            {isCompetition && (
              <div className="space-y-0.5 text-[7.5px] pt-0.5">
                <div className="grid grid-cols-2 gap-x-2">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Club Affilié</span>
                    <span className="font-bold text-slate-800 truncate block">{(cadre as any).club}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Médical / ISA</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span>Certificat Valide ✓</span>
                    </span>
                  </div>
                </div>
                {(cadre as any).pointsFSS && (
                  <div className="text-slate-600 font-mono text-[7px]">
                    Points FSS: <strong>{(cadre as any).pointsFSS} pts</strong> • Saison 2025
                  </div>
                )}
              </div>
            )}

            {isLoisir && (
              <div className="space-y-0.5 text-[7.5px] pt-0.5">
                <div className="grid grid-cols-2 gap-x-2">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Police Assurance</span>
                    <span className="font-mono font-bold text-slate-800 truncate block">
                      {(cadre as any).numeroAssurance}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Contact Urgence</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {(cadre as any).contactUrgenceTel || settings.contactTelephone}
                    </span>
                  </div>
                </div>
                {(cadre as any).groupeSanguin && (
                  <div className="text-slate-600 text-[7px]">
                    Groupe Sanguin: <strong>{(cadre as any).groupeSanguin}</strong> • RC & Rapatriement inclus
                  </div>
                )}
              </div>
            )}

            {isLiguePro && (
              <div className="space-y-0.5 text-[7.5px] pt-0.5">
                <div className="grid grid-cols-2 gap-x-2">
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Division Pro</span>
                    <span className="font-bold text-amber-700 truncate block">
                      {(cadre as any).divisionPro}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block uppercase">Rang WSL</span>
                    <span className="font-mono font-bold text-slate-800">
                      {(cadre as any).rangWSL ? `#${(cadre as any).rangWSL}` : 'Élite Pro'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Coordonnées Fédérales */}
            <div className="pt-1 text-[7px] text-slate-600 border-t border-slate-200">
              <span className="font-semibold block">Fédération Sénégalaise de Surf</span>
              <span>{settings.adresse}</span>
              <div className="flex gap-2 text-slate-500 font-mono text-[6.5px] mt-0.5">
                <span>{settings.contactTelephone}</span>
                <span>•</span>
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Signature & Cachet Officiel */}
          <div className="flex items-end justify-between pt-1 border-t border-slate-200">
            <div className="flex flex-col">
              <span className="text-[6.5px] text-slate-400 uppercase font-semibold">Le Président FSS</span>
              <div className="font-serif italic font-bold text-slate-800 text-[11px] leading-tight text-[#003764]">
                {settings.nomSignataire}
              </div>
              <span className="text-[6px] text-slate-500">{settings.titreSignataire}</span>
            </div>

            <OfficialStampFSS className="scale-75 origin-bottom-right" />
          </div>
        </div>
      </div>

      {/* Pied de page du Verso */}
      <div className="relative z-10 bg-slate-100 border-t border-slate-200 px-5 py-1.5 flex items-center justify-between text-[6.5px] text-slate-500 font-medium">
        <span>Carte strictement personnelle et incessible. Propriété de la FSS.</span>
        <span className="font-mono text-[#0080C8] font-bold">WWW.SENEGALSURF.SN</span>
      </div>
    </div>
  );
};
