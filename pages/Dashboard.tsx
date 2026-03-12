import React, { useEffect, useState } from 'react';
import { License, LicenseStatus } from '../types';
import { LicenseService } from '../services/licenseService';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Search, Edit, Printer, Ban, CheckCircle,
  ChevronLeft, ChevronRight, LayoutDashboard, Users,
  Settings, LogOut, Search as SearchIcon, Filter,
  MoreVertical, ShieldCheck, AlertCircle, Clock
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await LicenseService.isAuthenticated();
      if (!isAuth) {
        navigate('/login');
        return;
      }
      loadData();
    };
    checkAuth();
  }, [navigate]);

  const loadData = async () => {
    try {
      const data = await LicenseService.getAll();
      setLicenses(data.sort((a, b) => b.createdAt - a.createdAt));
    } catch (err) {
      console.error("Failed to load licenses", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LicenseStatus) => {
    if (confirm(`Changer le statut en ${newStatus}?`)) {
      await LicenseService.updateStatus(id, newStatus);
      loadData();
    }
  };

  const handleLogout = async () => {
    await LicenseService.logout();
    LicenseService.setAuthUIState(false);
    navigate('/login');
  };

  // Filter Logic
  const filteredLicenses = licenses.filter(l =>
    l.lastName.toLowerCase().includes(search.toLowerCase()) ||
    l.firstName.toLowerCase().includes(search.toLowerCase()) ||
    l.id.toLowerCase().includes(search.toLowerCase()) ||
    l.club.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLicenses = filteredLicenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage) || 1;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-slate-900 flex-col fixed h-full z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="bg-fss-green p-2 rounded-xl">
              <ShieldCheck size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">FSS Admin</span>
          </div>

          <nav className="space-y-1">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-3 bg-fss-green/10 text-fss-green rounded-xl font-medium transition-all">
              <LayoutDashboard size={20} />
              Tableau de bord
            </Link>
            <Link to="/admin/create" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-all">
              <Plus size={20} />
              Nouvelle Licence
            </Link>
          </nav>
        </div>

        <div className="mt-auto p-8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-all"
          >
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-w-0">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900 lg:hidden">FSS Admin</h1>
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-fss-green transition-colors" size={18} />
              <input
                type="text"
                placeholder="Rechercher une licence, un nom ou un club..."
                className="w-full bg-slate-100 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-fss-green/20 transition-all text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin/create" className="btn-primary py-2 px-4 text-sm whitespace-nowrap">
              <Plus size={18} />
              <span className="hidden sm:inline">Créer Licence</span>
            </Link>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="premium-card p-6 flex items-center gap-5">
              <div className="h-12 w-12 bg-fss-green/10 text-fss-green rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Licences</p>
                <h3 className="text-2xl font-bold">{licenses.length}</h3>
              </div>
            </div>
            <div className="premium-card p-6 flex items-center gap-5">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Valides</p>
                <h3 className="text-2xl font-bold">{licenses.filter(l => l.status === LicenseStatus.VALID).length}</h3>
              </div>
            </div>
            <div className="premium-card p-6 flex items-center gap-5">
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">En attente / Expire</p>
                <h3 className="text-2xl font-bold">{licenses.filter(l => l.status === LicenseStatus.EXPIRED).length}</h3>
              </div>
            </div>
          </div>

          {/* Table Card */}
          <div className="premium-card overflow-hidden animate-fade-in shadow-premium">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold flex items-center gap-2">
                Répertoire des Licenciés
                <span className="bg-slate-200 text-slate-600 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">
                  {filteredLicenses.length}
                </span>
              </h2>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
                  <Filter size={20} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-widest font-bold">
                    <th className="px-8 py-4">Membre / Club</th>
                    <th className="px-6 py-4">ID Licence</th>
                    <th className="px-6 py-4">Catégorie</th>
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentLicenses.map((license) => (
                    <tr key={license.id} className="group hover:bg-slate-50/80 transition-all cursor-default">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <img
                            src={license.photoUrl}
                            alt=""
                            className="h-12 w-12 rounded-2xl object-cover ring-2 ring-white shadow-sm transition-transform group-hover:scale-105"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{license.firstName} {license.lastName}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full inline-block"></span>
                              {license.club}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-mono font-bold border border-slate-200">
                          {license.id}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <span className="text-slate-800 font-medium">{license.category}</span>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{license.type}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                          ${license.status === LicenseStatus.VALID ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            license.status === LicenseStatus.EXPIRED ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-red-50 text-red-700 border border-red-100'}`}>
                          {license.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/admin/edit/${license.id}`} className="p-2 text-slate-400 hover:text-fss-green hover:bg-fss-green/10 rounded-xl transition-all" title="Modifier">
                            <Edit size={18} />
                          </Link>
                          <Link to={`/license/${license.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Voir Carte">
                            <Printer size={18} />
                          </Link>
                          <button
                            onClick={() => handleStatusChange(license.id, license.status === LicenseStatus.VALID ? LicenseStatus.DISABLED : LicenseStatus.VALID)}
                            className={`p-2 rounded-xl transition-all ${license.status === LicenseStatus.VALID ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                            title={license.status === LicenseStatus.VALID ? 'Désactiver' : 'Activer'}
                          >
                            {license.status === LicenseStatus.VALID ? <Ban size={18} /> : <CheckCircle size={18} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentLicenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="h-16 w-16 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center">
                            <SearchIcon size={32} />
                          </div>
                          <p className="text-slate-400 font-medium">Aucun membre ne correspond à votre recherche</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  Page <span className="font-bold text-slate-900">{currentPage}</span> sur <span className="font-bold text-slate-900">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-white transition-all shadow-sm"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};