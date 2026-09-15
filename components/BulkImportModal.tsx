import React, { useState } from 'react';
import { LicenseCategory, LicenseType } from '../types';
import { LicenseService } from '../services/licenseService';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Loader2 
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  club: string;
  category: LicenseCategory;
  type: LicenseType;
  issueDate: string;
  expirationDate: string;
  photoUrl: string;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const downloadTemplate = () => {
    const currentYear = new Date().getFullYear();
    const csvContent = [
      "Nom,Prenom,DateNaissance,Nationalite,Adresse,Telephone,Email,Club,Categorie,Type,DateEmission,DateExpiration",
      `DUPONT,Jean,1998-05-14,Française,12 Rue de l'Océan,0601020304,jean.dupont@email.com,Club Nautique,OPEN,Compétition,${currentYear}-01-01,${currentYear}-12-31`,
      `DIOP,Awa,2002-11-20,Sénégalaise,Almadies Dakar,771234567,awa.diop@email.com,Dakar Surfing,ONDINE OPEN,Compétition,${currentYear}-01-01,${currentYear}-12-31`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "modele_import_licences.csv";
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setSuccessCount(null);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);

        if (lines.length < 2) {
          setError('Le fichier CSV ne contient aucune donnée.');
          setLoading(false);
          return;
        }

        const rows: ParsedRow[] = [];
        const currentYear = new Date().getFullYear();

        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
          if (cols.length < 2 || !cols[0] || !cols[1]) continue;

          rows.push({
            lastName: cols[0] || '',
            firstName: cols[1] || '',
            birthDate: cols[2] || `${currentYear - 20}-01-01`,
            nationality: cols[3] || 'Sénégalaise',
            address: cols[4] || 'Non renseignée',
            phone: cols[5] || 'Non renseigné',
            email: cols[6] || '',
            club: cols[7] || 'Club Général',
            category: (cols[8] as LicenseCategory) || LicenseCategory.OPEN,
            type: (cols[9] as LicenseType) || LicenseType.COMPETITION,
            issueDate: cols[10] || `${currentYear}-01-01`,
            expirationDate: cols[11] || `${currentYear}-12-31`,
            photoUrl: '',
          });
        }

        setParsedRows(rows);
      } catch (err: any) {
        setError('Impossible d\'analyser le fichier CSV : ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;

    setImporting(true);
    setError(null);
    setProgress(0);

    let count = 0;
    try {
      for (let i = 0; i < parsedRows.length; i++) {
        await LicenseService.create(parsedRows[i]);
        count++;
        setProgress(Math.round(((i + 1) / parsedRows.length) * 100));
      }

      setSuccessCount(count);
      onSuccess();
    } catch (err: any) {
      setError(`Erreur à la ligne ${count + 1} : ` + (err.message || 'Échec'));
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Importer des Licences en Masse</h2>
            <p className="text-xs text-slate-500">Ajoutez rapidement plusieurs dizaines de membres via un fichier CSV</p>
          </div>
        </div>

        {/* Download Template Strip */}
        <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Format de fichier attendu (.CSV)</p>
            <p>Utilisez notre modèle pour vérifier l'ordre des colonnes.</p>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 shadow-sm transition-all"
          >
            <Download size={14} />
            Télécharger le Modèle
          </button>
        </div>

        {/* Upload Box */}
        {!successCount && (
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/20 rounded-2xl cursor-pointer transition-colors">
              <Upload size={32} className="text-slate-400 mb-2" />
              <span className="text-xs font-semibold text-slate-700">
                {file ? file.name : "Cliquez ou glissez-déposez votre fichier CSV ici"}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Fichier .csv (séparateur virgule)</span>
              <input 
                type="file" 
                accept=".csv,text/csv" 
                onChange={handleFileChange} 
                className="hidden" 
              />
            </label>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview of Parsed Rows */}
        {parsedRows.length > 0 && !successCount && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">
                Aperçu des données ({parsedRows.length} membre{parsedRows.length > 1 ? 's' : ''} détecté{parsedRows.length > 1 ? 's' : ''})
              </span>
            </div>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl text-xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Nom & Prénom</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Club</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Catégorie</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-1.5 font-medium text-slate-800">{row.lastName} {row.firstName}</td>
                      <td className="px-3 py-1.5 text-slate-500">{row.club}</td>
                      <td className="px-3 py-1.5 text-slate-500">{row.category}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedRows.length > 5 && (
                <div className="p-2 text-center text-slate-400 text-[11px] bg-slate-50 border-t border-slate-100">
                  ... et {parsedRows.length - 5} autres membres
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Bar during Import */}
        {importing && (
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Importation en cours...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}

        {/* Success message */}
        {successCount !== null && (
          <div className="mb-6 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-emerald-900">Importation réussie !</h3>
            <p className="text-xs text-emerald-700 mt-1">
              {successCount} licence{successCount > 1 ? 's ont été ajoutées' : ' a été ajoutée'} avec succès à votre base de données.
            </p>
          </div>
        )}

        {/* Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {successCount !== null ? 'Fermer' : 'Annuler'}
          </button>

          {parsedRows.length > 0 && !successCount && (
            <button
              type="button"
              disabled={importing || loading}
              onClick={handleImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              {importing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Importation ({progress}%)...
                </>
              ) : (
                `Importer les ${parsedRows.length} licences`
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
