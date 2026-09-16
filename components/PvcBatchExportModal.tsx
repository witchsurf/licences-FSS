import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  FileText, 
  Archive, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Settings2, 
  Layers,
  Printer
} from 'lucide-react';
import { License, FederalOfficial } from '../types';
import { LicenseCard } from './LicenseCard';
import { FederalOfficialCard } from './FederalOfficialCard';
import { PvcExportService } from '../services/pvcExportService';

interface PvcBatchExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Either licenses or federal officials
  licenses?: License[];
  officials?: FederalOfficial[];
  entityName?: string;
  entityCountry?: string;
  entityLogo?: string;
  entityFlag?: string;
}

export const PvcBatchExportModal: React.FC<PvcBatchExportModalProps> = ({
  isOpen,
  onClose,
  licenses = [],
  officials = [],
  entityName,
  entityCountry,
  entityLogo,
  entityFlag,
}) => {
  const [exportFormat, setExportFormat] = useState<'pdf' | 'zip'>('pdf');
  const [includeBleed, setIncludeBleed] = useState(true);
  const [includeVerso, setIncludeVerso] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number; label: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hidden container for DOM rendering during capture
  const hiddenContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const isOfficials = officials.length > 0;
  const count = isOfficials ? officials.length : licenses.length;

  const handleStartExport = async () => {
    if (!hiddenContainerRef.current) return;
    setIsProcessing(true);
    setError(null);
    setProgress({ current: 0, total: count, label: 'Initialisation de l\'exportation...' });

    try {
      // 1. Gather all card DOM elements rendered in the hidden container
      const container = hiddenContainerRef.current;
      const cardNodes = container.querySelectorAll<HTMLElement>('[data-pvc-card]');

      const cardElements: Array<{ id: string; name: string; element: HTMLElement; side: 'recto' | 'verso' }> = [];

      cardNodes.forEach((node) => {
        const id = node.getAttribute('data-card-id') || 'card';
        const name = node.getAttribute('data-card-name') || 'Licence';
        const side = (node.getAttribute('data-card-side') || 'recto') as 'recto' | 'verso';
        cardElements.push({ id, name, element: node, side });
      });

      if (cardElements.length === 0) {
        throw new Error('Aucun élément de carte détecté pour l\'exportation.');
      }

      // 2. Build manifest data for ZIP CSV
      const manifestData = isOfficials
        ? officials.map((off, idx) => ({
            Index: idx + 1,
            Identifiant: off.id,
            Nom: off.lastName,
            Prenom: off.firstName,
            Titre_Fonction: off.title,
            Organisation: entityName || 'Organisation',
            Pays: entityCountry || 'SN',
          }))
        : licenses.map((lic, idx) => ({
            Index: idx + 1,
            Numero_Licence: lic.id,
            Nom: lic.lastName,
            Prenom: lic.firstName,
            Club: lic.club,
            Categorie: lic.category,
            Type: lic.type,
            Date_Expiration: lic.expirationDate,
          }));

      const dateStr = new Date().toISOString().slice(0, 10);
      const prefix = isOfficials ? 'cadres_pvc' : 'licences_pvc';

      if (exportFormat === 'pdf') {
        const pdfBlob = await PvcExportService.generatePvcPdf(cardElements, {
          includeBleed,
          onProgress: (current, total, label) => setProgress({ current, total, label }),
        });
        const bleedTag = includeBleed ? '_bleed2mm' : '';
        PvcExportService.downloadBlob(pdfBlob, `${prefix}_CR80_${dateStr}${bleedTag}.pdf`);
      } else {
        const zipBlob = await PvcExportService.generatePvcZip(cardElements, manifestData, {
          includeBleed,
          onProgress: (current, total, label) => setProgress({ current, total, label }),
        });
        PvcExportService.downloadBlob(zipBlob, `${prefix}_300DPI_pack_${dateStr}.zip`);
      }

      // Success, close after brief feedback
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('PVC Export error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'exportation PVC.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard size={22} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Export Cartes PVC (Spécial Imprimeur)</h2>
              <p className="text-xs text-slate-400">Norme ISO CR80 (85.6 × 54 mm) · Rendu Haute Définition 300 DPI</p>
            </div>
          </div>
          {!isProcessing && (
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          
          {/* Summary pill */}
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-sm">
                  {count} {isOfficials ? 'cadre' : 'licence'}{count > 1 ? 's' : ''} sélectionné{count > 1 ? 's' : ''} pour l'impression
                </span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Prêt pour tirage sur badges PVC rigides ou imprimante à cartes plastique.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-200/60 font-mono font-black text-xs text-emerald-800">
              {isOfficials && includeVerso ? count * 2 : count} face{count > 1 ? 's' : ''}
            </span>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-600" />
              1. Choix du format de livraison pour l'imprimeur
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* PDF Option */}
              <div 
                onClick={() => !isProcessing && setExportFormat('pdf')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'pdf' 
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <FileText size={18} className={exportFormat === 'pdf' ? 'text-emerald-600' : 'text-slate-400'} />
                    PDF CR80 Multipages
                  </div>
                  <input 
                    type="radio" 
                    name="format" 
                    checked={exportFormat === 'pdf'} 
                    onChange={() => setExportFormat('pdf')} 
                    className="text-emerald-600 focus:ring-emerald-500" 
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Un seul fichier PDF où chaque page est exactement une carte à l'échelle 1:1. Idéal pour plateformes d'imprimerie en ligne (Vistaprint, Exaprint, etc.).
                </p>
              </div>

              {/* ZIP Option */}
              <div 
                onClick={() => !isProcessing && setExportFormat('zip')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  exportFormat === 'zip' 
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/10' 
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Archive size={18} className={exportFormat === 'zip' ? 'text-emerald-600' : 'text-slate-400'} />
                    Pack ZIP (300 DPI + CSV)
                  </div>
                  <input 
                    type="radio" 
                    name="format" 
                    checked={exportFormat === 'zip'} 
                    onChange={() => setExportFormat('zip')} 
                    className="text-emerald-600 focus:ring-emerald-500" 
                  />
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Dossiers d'images PNG haute résolution (1058 × 685 px) + listing CSV. Idéal pour logiciels de badges (Zebra, Evolis, Badgy, CardPresso).
                </p>
              </div>

            </div>
          </div>

          {/* Options & Bleed */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Settings2 size={14} className="text-emerald-600" />
              2. Paramètres techniques d'impression
            </label>

            {/* Bleed toggle */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeBleed}
                disabled={isProcessing}
                onChange={(e) => setIncludeBleed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div>
                <span className="font-bold text-xs text-slate-900 block">
                  Fond perdu industriel de 2 mm (+2mm Bleed tout autour)
                </span>
                <span className="text-xs text-slate-500">
                  {includeBleed 
                    ? 'Dimensions étendues à 89.6 × 58.0 mm pour éviter les liserés blancs lors de la découpe mécanique (Recommandé imprimeur).' 
                    : 'Dimensions exactes sans débordement (85.6 × 54.0 mm, coupe nette).'}
                </span>
              </div>
            </label>

            {/* Verso toggle for federal officials */}
            {isOfficials && (
              <label className="flex items-start gap-3 cursor-pointer select-none pt-2 border-t border-slate-200">
                <input
                  type="checkbox"
                  checked={includeVerso}
                  disabled={isProcessing}
                  onChange={(e) => setIncludeVerso(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <div>
                  <span className="font-bold text-xs text-slate-900 block">
                    Inclure le verso officiel (Organigramme & QR Code)
                  </span>
                  <span className="text-xs text-slate-500">
                    Génère le verso pour chaque carte pour impression recto/verso.
                  </span>
                </div>
              </label>
            )}
          </div>

          {/* Error display */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs">
              <AlertCircle size={18} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Progress bar */}
          {isProcessing && progress && (
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                  {progress.label}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {Math.round((progress.current / Math.max(progress.total, 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((progress.current / Math.max(progress.total, 1)) * 100))}%` }}
                />
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors disabled:opacity-50"
          >
            Annuler
          </button>

          <button
            type="button"
            disabled={isProcessing || count === 0}
            onClick={handleStartExport}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Traitement en cours...
              </>
            ) : (
              <>
                <Printer size={16} />
                Lancer l'exportation ({exportFormat.toUpperCase()})
              </>
            )}
          </button>
        </div>

      </div>

      {/* Hidden Off-Screen Render Target for html2canvas */}
      <div 
        ref={hiddenContainerRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          width: '2000px',
          zIndex: -1,
          opacity: 0.01,
          pointerEvents: 'none',
        }}
      >
        {isOfficials ? (
          officials.map((official) => (
            <React.Fragment key={official.id}>
              {/* Recto */}
              <div
                data-pvc-card
                data-card-id={official.id}
                data-card-name={`${official.firstName}_${official.lastName}`}
                data-card-side="recto"
                style={{
                  width: includeBleed ? '89.6mm' : '85.6mm',
                  height: includeBleed ? '58.0mm' : '54.0mm',
                  padding: includeBleed ? '2mm' : '0mm',
                  backgroundColor: '#047857', // bleeds emerald color
                }}
              >
                <FederalOfficialCard
                  official={official}
                  side="front"
                  entityName={entityName}
                  entityCountry={entityCountry}
                  entityLogo={entityLogo}
                  entityFlag={entityFlag}
                />
              </div>

              {/* Verso */}
              {includeVerso && (
                <div
                  data-pvc-card
                  data-card-id={official.id}
                  data-card-name={`${official.firstName}_${official.lastName}`}
                  data-card-side="verso"
                  style={{
                    width: includeBleed ? '89.6mm' : '85.6mm',
                    height: includeBleed ? '58.0mm' : '54.0mm',
                    padding: includeBleed ? '2mm' : '0mm',
                    backgroundColor: '#047857',
                  }}
                >
                  <FederalOfficialCard
                    official={official}
                    side="back"
                    entityName={entityName}
                    entityCountry={entityCountry}
                    entityLogo={entityLogo}
                    entityFlag={entityFlag}
                  />
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          licenses.map((license) => (
            <div
              key={license.id}
              data-pvc-card
              data-card-id={license.id}
              data-card-name={`${license.firstName}_${license.lastName}`}
              data-card-side="recto"
              style={{
                width: includeBleed ? '89.6mm' : '85.6mm',
                height: includeBleed ? '58.0mm' : '54.0mm',
                padding: includeBleed ? '2mm' : '0mm',
                backgroundColor: '#047857',
              }}
            >
              <LicenseCard
                license={license}
                entityName={entityName}
                entityLogo={entityLogo}
              />
            </div>
          ))
        )}
      </div>

    </div>
  );
};
