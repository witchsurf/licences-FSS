import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { License } from '../types';
import { LicenseCard } from '../components/LicenseCard';
import { Printer, ArrowLeft, Download } from 'lucide-react';

export const ViewLicense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [license, setLicense] = useState<License | null>(null);

  useEffect(() => {
    if (id) {
      LicenseService.getById(id).then(setLicense);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!license) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Toolbar - Hidden when printing */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm no-print">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/admin')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft size={20} />
            Retour
          </button>
          <div className="flex gap-3">
            <button 
              onClick={handlePrint}
              className="bg-fss-green hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 font-medium"
            >
              <Printer size={18} />
              Imprimer / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white p-12 rounded-xl shadow-2xl print:shadow-none print:p-0 print:m-0">
          <div className="mb-8 text-center no-print">
            <h2 className="text-xl font-bold text-gray-800">Aperçu avant impression</h2>
            <p className="text-gray-500 text-sm">Utilisez l'option "Imprimer" de votre navigateur pour générer le PDF.</p>
          </div>
          
          <div className="flex justify-center">
              <LicenseCard license={license} />
          </div>

          <div className="mt-12 border-t border-gray-100 pt-6 no-print">
              <h3 className="font-bold text-gray-700 mb-2">Instructions d'impression</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Format papier : <strong>Automatique</strong> ou A4</li>
                  <li>Marges : <strong>Aucune</strong> ou Minimales</li>
                  <li>Graphiques d'arrière-plan : <strong>Coché / Activé</strong></li>
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
};