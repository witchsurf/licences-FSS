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
    <div className="min-h-screen bg-white sm:bg-gray-100 flex flex-col fixed inset-0 z-[9999] sm:relative sm:inset-auto sm:z-auto">
      {/* Toolbar - Hidden on mobile */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm no-print hidden sm:block">
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
      <div className="flex-1 flex items-center justify-center p-0 bg-white overflow-hidden">
        <div className="bg-white w-full h-full flex flex-col items-center justify-center">
          <div className="mb-6 text-center no-print px-4 hidden sm:block">
            <h2 className="text-xl font-bold text-gray-800">Aperçu de la Licence</h2>
            <p className="text-gray-500 text-sm">Prêt pour l'impression ou l'affichage mobile.</p>
          </div>

          <div className="flex justify-center w-full">
            <div className="flex justify-center scale-[1.0] xs:scale-[1.6] sm:scale-100 md:scale-110 lg:scale-125 rotate-90 sm:rotate-0 origin-center transition-all duration-300">
              <LicenseCard license={license} />
            </div>
          </div>

          <div className="mt-8 border-t border-gray-100 pt-6 no-print w-full max-w-md hidden sm:block">
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