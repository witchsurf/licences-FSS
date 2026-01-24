import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard } from 'lucide-react';
import { LicenseService } from '../services/licenseService';
import { Logo } from './Logo';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const isAdmin = LicenseService.isAuthenticated();

  const handleLogout = async () => {
    await LicenseService.logout();
    LicenseService.setAuthUIState(false);
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md border-b-4 border-fss-green no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center gap-4 group">
            <Logo className="h-14 w-14 group-hover:scale-105 transition-transform" />
            
            <div className="flex flex-col">
              <span className="text-xl font-black text-fss-green tracking-tight uppercase">Fédération Sénégalaise de Surf</span>
              <span className="text-sm font-medium text-gray-500">Gestion des Licences Officielles</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {isAdmin ? (
              <>
                <Link to="/admin" className="text-gray-600 hover:text-fss-green flex items-center gap-2 font-medium">
                  <LayoutDashboard size={18} />
                  <span className="hidden sm:inline">Tableau de bord</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </>
            ) : (
               <Link to="/login" className="text-fss-green font-medium hover:underline">Connexion Admin</Link>
            )}
          </div>
        </div>
      </div>
      {/* Flag Strip */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-fss-green"></div>
        <div className="h-full w-1/3 bg-fss-yellow"></div>
        <div className="h-full w-1/3 bg-fss-red"></div>
      </div>
    </header>
  );
};