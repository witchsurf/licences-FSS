import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { Lock, ShieldCheck, Waves } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await LicenseService.login(password);
      if (success) {
        LicenseService.setAuthUIState(true);
        navigate('/admin');
      } else {
        setError('Accès refusé. Vérifiez votre code administrateur.');
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-fss-green/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-fss-green/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-fss-green/10 rounded-2xl mb-6 ring-1 ring-fss-green/20">
            <Waves size={40} className="text-fss-green" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">FSS Manager</h1>
          <p className="text-slate-400">Portail d'administration sécurisé</p>
        </div>

        <div className="glass-effect p-8 rounded-3xl shadow-2xl border border-white/10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 bg-fss-green rounded-xl flex items-center justify-center text-white shadow-lg shadow-fss-green/20">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Authentification</h2>
              <p className="text-xs text-slate-400">Entrez votre code d'accès</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Mot de passe</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-fss-green/50 focus:border-fss-green outline-none transition-all"
                  placeholder="••••••••"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                <ShieldCheck size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary h-12 text-base"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Accéder au Dashboard'
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Fédération Sénégalaise de Surf &bull; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
};