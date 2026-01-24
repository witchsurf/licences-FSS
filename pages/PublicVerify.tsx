import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { License, LicenseStatus } from '../types';
import { ShieldCheck, ShieldAlert, Ban } from 'lucide-react';

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
          <Ban className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Licence Introuvable</h2>
          <p className="text-gray-600">Le numéro de licence <b>{id}</b> n'existe pas dans la base de données de la FSS.</p>
       </div>
    </div>
  );

  const isValid = license.status === LicenseStatus.VALID && new Date(license.expirationDate) > new Date();
  
  // Explicitly check for expired dates even if status says valid in DB
  const displayStatus = !isValid && license.status === LicenseStatus.VALID ? 'EXPIRÉ' : license.status;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg border border-gray-100">
        <div className={`h-3 w-full ${isValid ? 'bg-fss-green' : 'bg-red-500'}`}></div>
        <div className="p-8">
          <div className="text-center mb-8">
             <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gray-50 mb-4 ring-4 ring-white shadow-lg">
                {isValid ? <ShieldCheck className="h-10 w-10 text-fss-green" /> : <ShieldAlert className="h-10 w-10 text-red-500" />}
             </div>
             <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Vérification Officielle</h2>
             <p className="text-sm text-gray-500 font-medium mt-1">Fédération Sénégalaise de Surf</p>
          </div>

          <div className="space-y-6">
            <div className={`p-4 rounded-lg flex items-center justify-center gap-2 font-bold text-lg ${isValid ? 'bg-green-50 text-fss-green border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
               <span>STATUT:</span>
               <span>{displayStatus}</span>
            </div>

            <div className="border-t border-gray-100 pt-6">
               <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                 <div className="sm:col-span-2">
                   <dt className="text-sm font-medium text-gray-500">Numéro de Licence</dt>
                   <dd className="mt-1 text-2xl font-mono font-bold text-gray-900">{license.id}</dd>
                 </div>
                 <div className="sm:col-span-2">
                   <dt className="text-sm font-medium text-gray-500">Licencié</dt>
                   <dd className="mt-1 text-lg font-semibold text-gray-900">{license.firstName} {license.lastName}</dd>
                 </div>
                 <div>
                   <dt className="text-sm font-medium text-gray-500">Club</dt>
                   <dd className="mt-1 text-sm text-gray-900 font-medium">{license.club}</dd>
                 </div>
                 <div>
                   <dt className="text-sm font-medium text-gray-500">Catégorie</dt>
                   <dd className="mt-1 text-sm text-gray-900 font-medium">{license.category}</dd>
                 </div>
                 <div className="sm:col-span-2">
                   <dt className="text-sm font-medium text-gray-500">Date d'expiration</dt>
                   <dd className="mt-1 text-sm text-gray-900 font-medium">{new Date(license.expirationDate).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
                 </div>
               </dl>
            </div>
            
            <div className="text-center text-xs text-gray-400 pt-6">
              Ce document atteste que le titulaire est enregistré auprès de la FSS.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};