import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { License, LicenseStatus } from '../types';
import { ShieldCheck, ShieldAlert, Ban } from 'lucide-react';
import { LicenseCard } from '../components/LicenseCard';

export const PublicVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      LicenseService.getById(id).then(data => {
        setLicense(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fss-green"></div></div>;

  if (!license) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md w-full border-t-4 border-red-500">
        < Ban className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Licence Introuvable</h2>
        <p className="text-gray-600">Le numéro de licence <b>{id}</b> n'existe pas dans la base de données de la FSS.</p>
      </div>
    </div>
  );

  const isValid = license.status === LicenseStatus.VALID && new Date(license.expirationDate) > new Date();
  const displayStatus = !isValid && license.status === LicenseStatus.VALID ? 'EXPIRÉ' : license.status;

  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex flex-col items-center">
      {/* Visual Card Display - Fixed Fullscreen on Mobile */}
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center sm:relative sm:inset-auto sm:z-auto sm:bg-transparent sm:py-8 sm:overflow-visible overflow-hidden">
        <div className="scale-[1.5] portrait:rotate-90 landscape:rotate-0 sm:rotate-0 sm:scale-100 origin-center transition-all duration-300">
          <LicenseCard license={license} />
        </div>
      </div>

      {/* Verification Details - Hidden behind the card on mobile, but available for scrolling if needed or on desktop */}
      <div className="relative z-10 mt-[120vh] sm:mt-0 w-full max-w-md px-4 pb-12 sm:px-0">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className={`h-2 w-full ${isValid ? 'bg-fss-green' : 'bg-red-500'}`}></div>
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 mb-3 ring-4 ring-white shadow-sm">
                {isValid ? <ShieldCheck className="h-6 w-6 text-fss-green" /> : <ShieldAlert className="h-6 w-6 text-red-500" />}
              </div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Vérification Officielle</h2>
              <p className="text-xs text-gray-500 font-medium">Fédération Sénégalaise de Surf</p>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg flex items-center justify-center gap-2 font-bold text-base ${isValid ? 'bg-green-50 text-fss-green border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                <span>STATUT:</span>
                <span>{displayStatus}</span>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <dl className="grid grid-cols-1 gap-x-2 gap-y-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase font-semibold text-gray-400">Numéro de Licence</dt>
                    <dd className="text-xl font-mono font-bold text-gray-900 tracking-tighter">{license.id}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[10px] uppercase font-semibold text-gray-400">Titulaire</dt>
                    <dd className="text-base font-bold text-gray-900">{license.firstName} {license.lastName}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase font-semibold text-gray-400">Club</dt>
                    <dd className="text-sm text-gray-700 font-bold">{license.club}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] uppercase font-semibold text-gray-400">Expiration</dt>
                    <dd className="text-sm text-gray-700 font-bold">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-gray-400">
          Cette page numérique est l'attestation officielle de votre licence FSS.
        </div>
      </div>
    </div>
  );
};