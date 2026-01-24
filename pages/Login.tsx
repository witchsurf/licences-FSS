import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { Lock } from 'lucide-react';

export const Login: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await LicenseService.login(password);
    if (success) {
      LicenseService.setAuthUIState(true);
      navigate('/admin');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border-t-4 border-fss-green">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-fss-green rounded-full flex items-center justify-center text-white mb-4">
            <Lock size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Accès Administration</h2>
          <p className="text-sm text-gray-500 mt-2">Veuillez entrer le code administrateur de la FSS</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-fss-green focus:ring-fss-green outline-none"
              placeholder="••••••••"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fss-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fss-green transition-colors"
          >
            Se connecter
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-gray-400">
            Fédération Sénégalaise de Surf &copy; {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};