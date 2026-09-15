import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { License } from '../types';
import { LicenseService } from '../services/licenseService';
import { LicenseCard } from '../components/LicenseCard';
import { Printer, ArrowLeft, Loader2 } from 'lucide-react';

export const BatchPrint: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  const idsParam = searchParams.get('ids') || '';

  useEffect(() => {
    const fetchLicenses = async () => {
      const ids = idsParam.split(',').map(s => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const all = await LicenseService.getAll();
        const selected = all.filter(l => ids.includes(l.id));
        setLicenses(selected);
      } catch (e) {
        console.error('Failed to load batch licenses:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, [idsParam]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 size={24} className="animate-spin text-emerald-600" />
          <span>Préparation de la planche d'impression...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8">
      {/* Top Action Toolbar (Hidden during print) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <button
          onClick={() => navigate('/admin')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors"
        >
          <ArrowLeft size={16} />
          Retour au tableau de bord
        </button>

        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-700">
            {licenses.length} licence{licenses.length > 1 ? 's' : ''} sur cette planche
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Printer size={16} />
            Lancer l'impression A4
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div className="max-w-[210mm] mx-auto bg-white p-6 sm:p-8 shadow-xl print:shadow-none print:p-0 print:m-0 rounded-2xl print:rounded-none">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:gap-4 justify-items-center">
          {licenses.map((license) => (
            <div 
              key={license.id} 
              className="border border-dashed border-slate-300 print:border-slate-400 p-1.5 rounded-2xl print:rounded-none relative break-inside-avoid"
            >
              <LicenseCard license={license} />
            </div>
          ))}
        </div>

        {licenses.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm">
            Aucune licence sélectionnée pour l'impression.
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
