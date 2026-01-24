import React, { useEffect, useState } from 'react';
import { License, LicenseStatus } from '../types';
import { LicenseService } from '../services/licenseService';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Printer, Ban, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    if (!LicenseService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
  }, [navigate]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const loadData = async () => {
    const data = await LicenseService.getAll();
    setLicenses(data.sort((a, b) => b.createdAt - a.createdAt));
  };

  const handleStatusChange = async (id: string, newStatus: LicenseStatus) => {
    if (confirm(`Voulez-vous changer le statut en ${newStatus}?`)) {
      await LicenseService.updateStatus(id, newStatus);
      loadData();
    }
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
  const totalPages = Math.ceil(filteredLicenses.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Licences</h1>
          <p className="text-gray-500 text-sm">Administration de la Fédération Sénégalaise de Surf</p>
        </div>
        <Link 
          to="/admin/create" 
          className="bg-fss-green hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} />
          Nouvelle Licence
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom, numéro de licence ou club..."
          className="pl-10 block w-full rounded-md border border-gray-300 py-2.5 px-3 focus:ring-fss-green focus:border-fss-green shadow-sm text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-grow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Licencié</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Club</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentLicenses.map((license) => (
                <tr key={license.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover border border-gray-200" src={license.photoUrl} alt="" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{license.firstName} {license.lastName}</div>
                        <div className="text-xs text-gray-500">{license.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono font-medium text-gray-700">{license.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{license.club}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{license.category} <span className="text-xs text-gray-400">({license.type})</span></span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${license.status === LicenseStatus.VALID ? 'bg-green-100 text-green-800' : 
                        license.status === LicenseStatus.EXPIRED ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {license.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                       <Link to={`/admin/edit/${license.id}`} className="text-blue-600 hover:text-blue-900 p-1" title="Modifier">
                         <Edit size={18} />
                       </Link>
                       <Link to={`/license/${license.id}`} className="text-indigo-600 hover:text-indigo-900 p-1" title="Voir Carte">
                         <Printer size={18} />
                       </Link>
                       {license.status === LicenseStatus.VALID ? (
                           <button onClick={() => handleStatusChange(license.id, LicenseStatus.DISABLED)} className="text-red-500 hover:text-red-700 p-1" title="Désactiver">
                              <Ban size={18} />
                           </button>
                       ) : (
                           <button onClick={() => handleStatusChange(license.id, LicenseStatus.VALID)} className="text-green-500 hover:text-green-700 p-1" title="Activer">
                              <CheckCircle size={18} />
                           </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
              {currentLicenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucune licence trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{indexOfFirstItem + 1}</span> à <span className="font-medium">{Math.min(indexOfLastItem, filteredLicenses.length)}</span> sur <span className="font-medium">{filteredLicenses.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  
                  {/* Simplified Page Number Display */}
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                     Page {currentPage} sur {totalPages}
                  </span>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Suivant</span>
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};