import React, { useState } from 'react';
import { AnyLicence, FederationSettings } from '../types';
import { BadgeFront } from './BadgeFront';
import { BadgeBack } from './BadgeBack';
import { exportBadgeAsImage, exportBadgeAsPDF } from '../utils/exportBadges';
import {
  RotateCcw,
  Download,
  FileText,
  Printer,
  Sparkles,
  ExternalLink,
  Edit3,
  QrCode,
  Check,
} from 'lucide-react';

interface BadgePreviewProps {
  cadre: AnyLicence;
  settings: FederationSettings;
  onEdit?: (cadre: AnyLicence) => void;
  onPrintSingle?: (cadre: AnyLicence) => void;
}

export const BadgePreview: React.FC<BadgePreviewProps> = ({
  cadre,
  settings,
  onEdit,
  onPrintSingle,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const frontId = `preview-front-${cadre.id}`;
  const backId = `preview-back-${cadre.id}`;

  const qrTarget =
    cadre.qrCustomUrl ||
    (cadre.category === 'CADRE'
      ? `${settings.organigrammeUrl}?cadre=${encodeURIComponent(cadre.id)}`
      : `${settings.verificationLicenceUrl || settings.siteWebUrl}/verifier?licence=${encodeURIComponent(cadre.numeroLicence)}`);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportBadgeAsPDF(frontId, backId, cadre);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPNG = async (side: 'front' | 'back') => {
    setIsExporting(true);
    try {
      const cleanName = `${cadre.prenom}_${cadre.nom}`.toLowerCase().replace(/\s+/g, '_');
      if (side === 'front') {
        await exportBadgeAsImage(frontId, `badge_${cadre.category.toLowerCase()}_${cleanName}_recto`, 3);
      } else {
        await exportBadgeAsImage(backId, `badge_${cadre.category.toLowerCase()}_${cleanName}_verso`, 3);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrTarget);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D Perspective Card Container */}
      <div className="relative group perspective-1000">
        {/* Hidden Elements for PDF / PNG Capture when not active face */}
        <div className="absolute -left-[9999px] top-0 pointer-events-none opacity-0">
          <BadgeFront cadre={cadre} settings={settings} id={frontId} />
          <BadgeBack cadre={cadre} settings={settings} id={backId} />
        </div>

        {/* Interactive Visual Card Container */}
        <div
          className={`relative transition-transform duration-700 transform-style-3d cursor-pointer ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Recto Face */}
          <div className="backface-hidden">
            <BadgeFront cadre={cadre} settings={settings} />
          </div>

          {/* Verso Face */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <BadgeBack cadre={cadre} settings={settings} />
          </div>
        </div>

        {/* Hover Hint */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 text-white text-[11px] font-semibold px-3 py-1 rounded-full shadow-lg pointer-events-none flex items-center gap-1.5 backdrop-blur-sm">
          <RotateCcw className="w-3.5 h-3.5 text-fss-yellow" />
          <span>Cliquez sur la carte pour retourner ({isFlipped ? 'Verso' : 'Recto'})</span>
        </div>
      </div>

      {/* Barre de Contrôles & Actions */}
      <div className="w-full max-w-[500px] flex flex-col gap-3">
        {/* Ligne 1 : Bascule et Édition */}
        <div className="flex items-center justify-between gap-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 backdrop-blur-md">
          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-fss-blue to-blue-600 hover:from-blue-600 hover:to-fss-blue text-white rounded-lg font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <RotateCcw className={`w-4 h-4 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            <span>Voir {isFlipped ? 'le Recto (Avers)' : 'le Verso (Revers)'}</span>
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(cadre)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Modifier</span>
            </button>
          )}

          {onPrintSingle && (
            <button
              onClick={() => onPrintSingle(cadre)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg font-medium text-xs border border-slate-700 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>Imprimer</span>
            </button>
          )}
        </div>

        {/* Ligne 2 : Téléchargements HD & PDF */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-200" />
            <span>PDF Officiel (2P)</span>
          </button>

          <button
            onClick={() => handleExportPNG('front')}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Recto PNG HD</span>
          </button>

          <button
            onClick={() => handleExportPNG('back')}
            disabled={isExporting}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-semibold text-[11px] border border-slate-700 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-purple-400" />
            <span>Verso PNG HD</span>
          </button>
        </div>

        {/* Encart Informatif QR Code */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="p-1.5 bg-[#0080C8]/20 text-[#0080C8] rounded-lg">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Cible QR Code ({cadre.category})
              </span>
              <span className="font-mono text-[11px] text-slate-300 truncate block">
                {qrTarget}
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            className="shrink-0 p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-[11px] border border-slate-700 flex items-center gap-1 transition-all"
            title="Copier l'URL cible"
          >
            {copiedLink ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 text-[10px]">Copié</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3 h-3" />
                <span className="text-[10px]">Copier</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
