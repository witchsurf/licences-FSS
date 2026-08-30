import React, { useState, useMemo } from 'react';
import {
  POSTES_DISPONIBLES,
  CLUBS_SENEGAL,
} from './data/initialData';
import { BadgePreview } from './components/BadgePreview';
import { SettingsModal } from './components/SettingsModal';
import { BatchPrintModal } from './components/BatchPrintModal';
import { OfficialFSSLogo } from './components/Logos';
import {
  Shield,
  Plus,
  Printer,
  LayoutDashboard,
  Users,
  Search,
  RotateCw,
  LogOut,
  Eye,
  Edit,
  Trash2,
  Clock,
  Download,
  Filter,
  BarChart2,
  SlidersHorizontal,
} from 'lucide-react';
import { AnyLicence, FederationSettings } from './types';

// Données officielles avec FÉDÉRATION SÉNÉGALAISE DE SURF
const INITIAL_LICENCES_EXACT: AnyLicence[] = [
  {
    id: 'lic-067',
    category: 'COMPETITION',
    prenom: 'Habib',
    nom: 'DIAKHATE',
    club: 'TAKE OFF NGOR',
    discipline: 'Shortboard',
    categorieAge: 'Open / Senior',
    classementNational: 1,
    certificatMedicalValide: true,
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-2026-000067',
    saison: '2026',
    dateEmission: '2026-07-27',
    dateExpiration: '2026-12-31',
    telephone: '784067519',
    email: 'takeoffngor@gmail.com',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'lic-068',
    category: 'COMPETITION',
    prenom: 'Damian',
    nom: 'MORO',
    club: 'TAKE OFF NGOR',
    discipline: 'Shortboard',
    categorieAge: 'Open / Senior',
    classementNational: 2,
    certificatMedicalValide: true,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-2026-000068',
    saison: '2026',
    dateEmission: '2026-07-27',
    dateExpiration: '2026-12-31',
    telephone: '771234567',
    email: 'damian.moro@takeoffngor.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },

  // 🏛️ Les Cadres Fédéraux
  {
    id: 'cad-001',
    category: 'CADRE',
    prenom: 'SOULEYE',
    nom: 'MBENGUE',
    poste: 'SECRÉTAIRE GÉNÉRAL',
    sousTitre: 'ADJOINT',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-001',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 543 21 00',
    email: 'souleye.mbengue@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
    commission: 'Secrétariat Général',
  },
  {
    id: 'cad-002',
    category: 'CADRE',
    prenom: 'OUMAR',
    nom: 'SÈNE',
    poste: 'PRÉSIDENT',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-002',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 600 11 22',
    email: 'president@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'cad-003',
    category: 'CADRE',
    prenom: 'AÏDA',
    nom: 'DIOP',
    poste: 'VICE-PRÉSIDENTE',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-003',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 450 33 44',
    email: 'aida.diop@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'cad-004',
    category: 'CADRE',
    prenom: 'MAMADOU',
    nom: 'NDIAYE',
    poste: 'TRÉSORIER',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-004',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 123 45 67',
    email: 'tresorier@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'cad-005',
    category: 'CADRE',
    prenom: 'FATOU',
    nom: 'SOW',
    poste: 'TRÉSORIER ADJOINT',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-005',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 889 90 01',
    email: 'fatou.sow@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'cad-006',
    category: 'CADRE',
    prenom: 'IBRAHIMA',
    nom: 'DIALLO',
    poste: 'DIRECTEUR TECHNIQUE NATIONAL',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-006',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 334 55 66',
    email: 'dtn@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
  {
    id: 'cad-007',
    category: 'CADRE',
    prenom: 'BABACAR',
    nom: 'FALL',
    poste: 'COACH',
    sousTitre: 'ÉQUIPE NATIONALE',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    numeroLicence: 'FSS-CAD-2025-007',
    saison: '2025 - 2028',
    dateEmission: '2025-01-15',
    dateExpiration: '2028-12-31',
    telephone: '+221 77 998 77 66',
    email: 'coach.national@senegalsurf.sn',
    nationalite: 'Sénégalaise',
    institution: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    statut: 'ACTIF',
  },
];

const DEFAULT_SETTINGS_EXACT: FederationSettings = {
  nomFederation: 'FÉDÉRATION SÉNÉGALAISE DE SURF',
  nomSousTitre: 'CONFÉDÉRATION AFRICAINE DE SURF',
  siteWebUrl: 'https://senegalsurf.sn',
  organigrammeUrl: 'https://senegalsurf.sn/organigramme',
  verificationLicenceUrl: 'https://senegalsurf.sn/verifier',
  contactEmail: 'contact@senegalsurf.sn',
  contactTelephone: '+221 33 820 45 12',
  adresse: 'Plage de Ngor / Almadies, Dakar, Sénégal',
  nomSignataire: 'Oumar SÈNE',
  titreSignataire: 'Président FSS',
  qrDestinationType: 'organigramme',
  qrCustomGlobalUrl: 'https://senegalsurf.sn/organigramme',
  showOlympicLogo: true,
  showWslLogo: false,
  showIsaLogo: true,
  formatBadge: 'standard_cr80',
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cadres'>('dashboard');

  const [licences] = useState<AnyLicence[]>(INITIAL_LICENCES_EXACT);
  const [settings, setSettings] = useState<FederationSettings>(DEFAULT_SETTINGS_EXACT);

  // Filtres
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('TOUTES');
  const [clubFilter, setClubFilter] = useState<string>('TOUS');
  const [statutFilter, setStatutFilter] = useState<string>('TOUS');

  // Sélection Cadre
  const [selectedCadreId, setSelectedCadreId] = useState<string>('cad-001');

  // Modales
  const [previewBadge, setPreviewBadge] = useState<AnyLicence | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState<boolean>(false);

  // Cadres Fédéraux
  const cadresFederaux = useMemo(() => {
    return licences.filter((l) => l.category === 'CADRE');
  }, [licences]);

  const currentSelectedCadre =
    cadresFederaux.find((c) => c.id === selectedCadreId) || cadresFederaux[0];

  // Filtrage
  const filteredLicences = useMemo(() => {
    return licences.filter((l) => {
      const matchSearch =
        l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.numeroLicence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCat =
        categoryFilter === 'TOUTES' ||
        (categoryFilter === 'CADRE' && l.category === 'CADRE') ||
        (categoryFilter === 'OPEN' && l.category === 'COMPETITION') ||
        (categoryFilter === 'LOISIR' && l.category === 'LOISIR');

      const matchClub =
        clubFilter === 'TOUS' || (l as any).club === clubFilter;

      const matchStatut =
        statutFilter === 'TOUS' || l.statut === statutFilter;

      return matchSearch && matchCat && matchClub && matchStatut;
    });
  }, [licences, searchTerm, categoryFilter, clubFilter, statutFilter]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-800 font-sans">
      {/* 1. HEADER OFFICIEL FSS AVEC LE BON LOGO OFFICIEL */}
      <header className="bg-white border-b-2 border-[#00853F] shadow-sm sticky top-0 z-40">
        <div className="w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Logo officiel de la Fédération Sénégalaise de Surf */}
            <div className="w-16 h-14 shrink-0">
              <OfficialFSSLogo className="w-full h-full" />
            </div>

            <div>
              <h1 className="text-xl font-black text-[#00853F] uppercase tracking-tight font-sans leading-none">
                FÉDÉRATION SÉNÉGALAISE DE SURF
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Gestion des Licences Officielles
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Tableau de bord</span>
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              title="Configuration du QR Code (Organigramme & Site Web)"
            >
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>Paramètres QR</span>
            </button>

            <button
              onClick={() => alert('Session administrative sécurisée.')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. CORPS DE L'APPLICATION AVEC SIDEBAR */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR GAUCHE */}
        <aside className="w-64 bg-[#0b1727] text-slate-300 flex flex-col justify-between shrink-0 shadow-xl">
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-[#12233c] rounded-xl border border-slate-700/60">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-sm font-black text-white uppercase tracking-wider">
                FSS Admin
              </span>
            </div>

            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-emerald-600/90 text-white shadow-md'
                    : 'text-slate-400 hover:bg-[#12233c] hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span>Tableau de bord</span>
              </button>

              {/* VOLET CADRES FÉDÉRAUX */}
              <button
                onClick={() => setActiveTab('cadres')}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'cadres'
                    ? 'bg-[#0080C8] text-white shadow-lg ring-1 ring-blue-300'
                    : 'text-slate-300 hover:bg-[#12233c] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Cadres Fédéraux</span>
                </div>
                <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded-full font-bold uppercase">
                  Badge
                </span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-xs font-semibold text-slate-400 hover:bg-[#12233c] hover:text-white transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>+ Nouvelle Licence</span>
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="block text-slate-500">Saison 2026 • FSS</span>
          </div>
        </aside>

        {/* CONTENU CENTRAL */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#f8fafc]">
          {/* VUE 1 : TABLEAU DE BORD EXISTANT */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une licence, un membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 shadow-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('TOUTES');
                    }}
                    className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-all"
                    title="Actualiser"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>

                  <button className="flex items-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all">
                    <BarChart2 className="w-4 h-4" />
                    <span>Statistiques</span>
                  </button>

                  <button className="flex items-center gap-2 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all">
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cadres')}
                    className="flex items-center gap-2 py-2.5 px-4 bg-[#0080C8] hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md transition-all"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Voir Cadres Fédéraux</span>
                  </button>

                  <button className="flex items-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                    <Plus className="w-4 h-4" />
                    <span>Créer Licence</span>
                  </button>
                </div>
              </div>

              {/* Filtres */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TOUTES">Toutes Catégories</option>
                    <option value="CADRE">Cadres Fédéraux</option>
                    <option value="OPEN">Compétition (Open)</option>
                    <option value="LOISIR">Loisir</option>
                  </select>
                </div>

                <div>
                  <select
                    value={clubFilter}
                    onChange={(e) => setClubFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TOUS">Tous les Clubs</option>
                    <option value="TAKE OFF NGOR">TAKE OFF NGOR</option>
                    {CLUBS_SENEGAL.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={statutFilter}
                    onChange={(e) => setStatutFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TOUS">Tous les Statuts</option>
                    <option value="ACTIF">Valides</option>
                  </select>
                </div>
              </div>

              {/* Cartes KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Total Licences</span>
                    <div className="text-3xl font-black text-slate-900">66</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">Valides</span>
                    <div className="text-3xl font-black text-slate-900">62</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase">En attente / Expire</span>
                    <div className="text-3xl font-black text-slate-900">0</div>
                  </div>
                </div>
              </div>

              {/* Table des licenciés */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">
                      Répertoire des Licenciés
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 font-bold text-xs rounded-full">
                      66
                    </span>
                  </div>
                  <Filter className="w-4 h-4 text-slate-400" />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-slate-100">
                        <th className="py-3 px-6">MEMBRE / CLUB</th>
                        <th className="py-3 px-6">ID LICENCE</th>
                        <th className="py-3 px-6">CATÉGORIE</th>
                        <th className="py-3 px-6">STATUT</th>
                        <th className="py-3 px-6 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredLicences.map((licence) => {
                        const isCadre = licence.category === 'CADRE';
                        return (
                          <tr key={licence.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  <img
                                    src={licence.photoUrl}
                                    alt={licence.nom}
                                    className="w-full h-full object-cover object-top"
                                  />
                                </div>
                                <div>
                                  <span className="font-black text-slate-900 uppercase block">
                                    {licence.prenom} {licence.nom}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                    {isCadre ? 'FÉDÉRATION SÉNÉGALAISE DE SURF' : (licence as any).club || 'TAKE OFF NGOR'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-6">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 font-mono text-[11px] font-bold rounded-lg border border-slate-200">
                                {licence.numeroLicence}
                              </span>
                            </td>

                            <td className="py-3.5 px-6">
                              <div>
                                <span className="font-black text-slate-800 uppercase block text-[11px]">
                                  {isCadre ? (licence as any).poste : 'OPEN'}
                                </span>
                                <span className="text-[10px] text-slate-400 font-semibold uppercase">
                                  {isCadre ? 'CADRE FÉDÉRAL' : 'COMPÉTITION'}
                                </span>
                              </div>
                            </td>

                            <td className="py-3.5 px-6">
                              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-full border border-emerald-200 uppercase">
                                VALIDE
                              </span>
                            </td>

                            <td className="py-3.5 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setPreviewBadge(licence)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-[#0080C8] rounded-lg transition-colors"
                                  title="Aperçu du Badge"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VUE 2 : NOUVEAU VOLET CADRES FÉDÉRAUX */}
          {activeTab === 'cadres' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Volet Administration — Cadres Fédéraux
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Générateur des badges officiels pour les postes statutaires de la Fédération
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsBatchPrintOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimer Badges</span>
                  </button>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="flex items-center gap-2 py-2 px-4 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 transition-all"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                    <span>Paramètres QR</span>
                  </button>
                </div>
              </div>

              {/* Sélecteur des Postes avec VICE-PRÉSIDENT & VICE-PRÉSIDENTE */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Sélectionnez un Poste de Cadre Fédéral :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {POSTES_DISPONIBLES.map((poste) => {
                    const match = cadresFederaux.find((c) => (c as any).poste === poste.id);
                    const isSelected = match && match.id === selectedCadreId;
                    return (
                      <button
                        key={poste.id}
                        onClick={() => {
                          if (match) setSelectedCadreId(match.id);
                        }}
                        className={`py-2.5 px-2 rounded-xl text-[10.5px] font-black uppercase transition-all text-center border truncate ${
                          isSelected
                            ? 'bg-[#0080C8] text-white border-[#0080C8] shadow-md ring-2 ring-blue-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {poste.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Rendu du Badge Officiel FSS */}
              <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl flex flex-col items-center">
                <div className="mb-4 text-center">
                  <span className="text-xs font-black uppercase text-[#0080C8] tracking-widest block">
                    BADGE OFFICIEL • {currentSelectedCadre.prenom} {currentSelectedCadre.nom}
                  </span>
                  <span className="text-xs text-slate-400 font-bold">
                    {(currentSelectedCadre as any).poste} • FÉDÉRATION SÉNÉGALAISE DE SURF
                  </span>
                </div>

                <BadgePreview
                  cadre={currentSelectedCadre}
                  settings={settings}
                  onPrintSingle={() => setIsBatchPrintOpen(true)}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal Badge Aperçu */}
      {previewBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 max-w-xl w-full flex flex-col items-center shadow-2xl relative">
            <button
              onClick={() => setPreviewBadge(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              ✕
            </button>
            <h3 className="text-white text-sm font-black uppercase mb-4 tracking-wide">
              Carte d'Accréditation FSS
            </h3>
            <BadgePreview
              cadre={previewBadge}
              settings={settings}
              onPrintSingle={() => setIsBatchPrintOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Modals Paramètres & Impression */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={(newSettings) => setSettings(newSettings)}
      />

      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        cadres={licences}
        settings={settings}
      />
    </div>
  );
};

export default App;
