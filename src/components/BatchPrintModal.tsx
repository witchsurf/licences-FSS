import React, { useRef, useState } from 'react';
import { AnyLicence, FederationSettings, LicenceCategory } from '../types';
import { BadgeFront } from './BadgeFront';
import { BadgeBack } from './BadgeBack';
import { CATEGORIES_LICENCES_CONFIG } from '../data/initialData';
import { Printer, X, LayoutGrid, Check, Filter } from 'lucide-react';

interface BatchPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  cadres: AnyLicence[];
  settings: FederationSettings;
}

export const BatchPrintModal: React.FC<BatchPrintModalProps> = ({
  isOpen,
  onClose,
  cadres,
  settings,
}) => {
  const [filterCategory, setFilterCategory] = useState<LicenceCategory | 'ALL'>('ALL');
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const filteredToPrint = cadres.filter(
    (c) => filterCategory === 'ALL' || c.category === filterCategory
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:w-full print:max-w-none print:my-0 print:bg-white">
        {/* Header non imprimable */}
        <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide font-sans">
                Planche d'Impression des Badges ({filteredToPrint.length})
              </h2>
              <p className="text-xs text-slate-400">
                Génération des planches Recto/Verso prêtes pour imprimante à cartes PVC ou papier 300g
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtre de catégorie pour impression */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="bg-slate-800 border border-slate-700 text-xs text-white rounded-lg px-2.5 py-2 focus:outline-none focus:border-fss-blue"
            >
              <option value="ALL">Toutes les Licences ({cadres.length})</option>
              <option value="CADRE">Cadres Fédéraux uniquement</option>
              <option value="COMPETITION">Compétition uniquement</option>
              <option value="LOISIR">Loisir uniquement</option>
              <option value="LIGUE_PRO">Ligue Pro uniquement</option>
            </select>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Zone de prévisualisation / d'impression */}
        <div
          ref={printRef}
          className="p-8 max-h-[75vh] overflow-y-auto space-y-12 bg-slate-950/50 print:p-0 print:max-h-none print:overflow-visible print:bg-white print:space-y-8"
        >
          {filteredToPrint.map((cadre, index) => (
            <div
              key={cadre.id}
              className="flex flex-col items-center bg-slate-900/60 p-6 rounded-2xl border border-slate-800 print:bg-transparent print:border-none print:p-0 print:break-after-page"
            >
              <div className="mb-3 text-center print:hidden">
                <span className="text-xs font-bold text-slate-400 uppercase">
                  Badge #{index + 1} • {cadre.prenom} {cadre.nom} ({CATEGORIES_LICENCES_CONFIG[cadre.category].label})
                </span>
              </div>

              {/* Disposition Recto & Verso côte à côte */}
              <div className="flex flex-wrap items-center justify-center gap-6 print:gap-4 print:my-4">
                <div className="transform origin-top scale-95 print:scale-100">
                  <BadgeFront cadre={cadre} settings={settings} />
                </div>
                <div className="transform origin-top scale-95 print:scale-100">
                  <BadgeBack cadre={cadre} settings={settings} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
