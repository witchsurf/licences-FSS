import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { License } from '../types';
import { LicenseCard } from '../components/LicenseCard';
import { Printer, ArrowLeft, Download, Share2, Link as LinkIcon, Check } from 'lucide-react';

export const ViewLicense: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [license, setLicense] = useState<License | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      LicenseService.getById(id).then(setLicense);
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const shareUrl = `${window.location.origin}/#/verify/${license?.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Licence FSS - ${license?.firstName} ${license?.lastName}`,
          text: `Consultez ma licence officielle de la Fédération Sénégalaise de Surf.`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      handleCopy();
    }
  };

  if (!license) return <div>Chargement...</div>;

  return (
    <div className="min-h-screen bg-white sm:bg-gray-100 flex flex-col fixed inset-0 z-[9999] sm:relative sm:inset-auto sm:z-auto">
      {/* Toolbar - Header for desktop, but visible share on mobile */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm no-print">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <button onClick={() => navigate('/admin')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Retour</span>
          </button>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-2 rounded shadow-sm font-medium transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {copied ? <Check size={18} /> : <LinkIcon size={18} />}
              <span>{copied ? 'Copié !' : 'Copier le lien'}</span>
            </button>

            <button
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm flex items-center gap-2 font-medium"
            >
              <Share2 size={18} />
              <span className="hidden sm:inline">Partager</span>
              <span className="sm:hidden">Envoyer</span>
            </button>

            <button
              onClick={handlePrint}
              className="hidden sm:flex bg-fss-green hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm items-center gap-2 font-medium"
            >
              <Printer size={18} />
              Imprimer
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
            <div className="flex justify-center scale-[1.5] rotate-90 sm:scale-100 sm:rotate-0 md:scale-110 lg:scale-125 origin-center transition-all duration-300">
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