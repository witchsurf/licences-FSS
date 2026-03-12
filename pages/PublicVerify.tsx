import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { License, LicenseStatus } from '../types';
import { ShieldCheck, ShieldAlert, Ban, RotateCw, CheckCircle2, Waves, Search } from 'lucide-react';
import { LicenseCard } from '../components/LicenseCard';

export const PublicVerify: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [rotated, setRotated] = useState(false);

  useEffect(() => {
    if (id) {
      LicenseService.getById(id).then(data => {
        setLicense(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    if (window.innerWidth < 640) {
      setRotated(true);
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 border-4 border-fss-green/20 border-t-fss-green rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Vérification sécurisée FSS...</p>
      </div>
    </div>
  );

  if (!license) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fade-in">
        <div className="glass-effect p-8 rounded-3xl border border-red-500/20 text-center shadow-2xl">
          <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-red-500/20">
            <Ban size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Licence Introuvable</h2>
          <p className="text-slate-400 mb-8 leading-relaxed">Le numéro de licence <span className="text-slate-200 font-mono">{id}</span> n'existe pas dans la base de données officielle de la FSS.</p>
          <a href="/" className="btn-secondary w-full py-3 bg-white/5 border border-white/10 text-white hover:bg-white/10">Retour à l'accueil</a>
        </div>
      </div>
    </div>
  );

  const isExpired = new Date(license.expirationDate) < new Date();
  const isValid = license.status === LicenseStatus.VALID && !isExpired;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center relative overflow-x-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-fss-green/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Header */}
      <div className="w-full max-w-lg pt-12 pb-8 px-6 text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-fss-green/10 text-fss-green rounded-full border border-fss-green/20 mb-6">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest tracking-tighter">Vérification Officielle</span>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Fédération Sénégalaise de Surf</h1>
        <p className="text-slate-400 text-sm">Système de certification numérique des licenciés</p>
      </div>

      {/* Card Section */}
      <div className="w-full flex-1 flex flex-col items-center justify-center py-10 px-6 z-10">
        <div className={`transition-all duration-700 ease-out origin-center ${rotated ? 'scale-[1.4] sm:scale-125 md:scale-150 rotate-90 my-20 sm:my-32' : 'scale-[0.9] sm:scale-110 md:scale-125 rotate-0 mb-12'
          } shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] rounded-2xl`}>
          <LicenseCard license={license} />
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={() => setRotated(!rotated)}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all font-bold text-sm"
          >
            <RotateCw size={18} />
            {rotated ? 'Vue Portrait' : 'Vue Paysage'}
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="w-full max-w-lg px-6 pb-20 z-10 animate-fade-in">
        <div className="glass-effect rounded-3xl p-8 border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${isValid ? 'bg-fss-green text-white shadow-lg shadow-fss-green/20' : 'bg-red-500 text-white shadow-lg shadow-red-500/20'}`}>
                {isValid ? <CheckCircle2 size={24} /> : <ShieldAlert size={24} />}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">État de Validité</p>
                <h3 className={`text-xl font-black uppercase ${isValid ? 'text-fss-green' : 'text-red-500'}`}>
                  {isValid ? 'Licence Valide' : (isExpired ? 'Licence Expirée' : 'Licence Invalide')}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authentifié le</p>
              <p className="text-sm font-bold text-white">{new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">ID Licence</p>
                <p className="text-lg font-mono font-bold text-white">{license.id}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Expiration</p>
                <p className="text-lg font-bold text-white">{new Date(license.expirationDate).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Titulaire</p>
              <p className="text-xl font-black text-white uppercase tracking-tight">{license.firstName} {license.lastName}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Club Affilié</p>
                <p className="text-base font-bold text-slate-200">{license.club}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Catégorie</p>
                <p className="text-base font-bold text-fss-green">{license.category}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 flex items-start gap-3">
            <Waves className="text-slate-600 flex-shrink-0" size={20} />
            <p className="text-[11px] text-slate-500 leading-relaxed italic">
              Ce certificat numérique généré par la FSS fait foi. En cas de doute, scannez le QR code présent sur la carte physique ou contactez la fédération.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};