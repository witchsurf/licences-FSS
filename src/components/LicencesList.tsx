import React, { useState, useMemo } from 'react';
import { AnyLicence, LicenceCategory, FederationSettings } from '../types';
import {
  POSTES_DISPONIBLES,
  CLUBS_SENEGAL,
  CATEGORIES_LICENCES_CONFIG,
} from '../data/initialData';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  UserCheck,
  Shield,
  Award,
  Waves,
  Trophy,
} from 'lucide-react';

interface LicencesListProps {
  licences: AnyLicence[];
  selectedLicence: AnyLicence;
  onSelectLicence: (licence: AnyLicence) => void;
  onAddLicence: (category?: LicenceCategory) => void;
  onEditLicence: (licence: AnyLicence) => void;
  onDeleteLicence: (id: string) => void;
  onDuplicateLicence: (licence: AnyLicence) => void;
  activeCategoryFilter: LicenceCategory | 'ALL';
  onCategoryFilterChange: (cat: LicenceCategory | 'ALL') => void;
  settings: FederationSettings;
}

export const LicencesList: React.FC<LicencesListProps> = ({
  licences,
  selectedLicence,
  onSelectLicence,
  onAddLicence,
  onEditLicence,
  onDeleteLicence,
  onDuplicateLicence,
  activeCategoryFilter,
  onCategoryFilterChange,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subFilter, setSubFilter] = useState<string>('TOUS');

  const filteredLicences = useMemo(() => {
    return licences.filter((l) => {
      // 1. Category filter
      const matchCat =
        activeCategoryFilter === 'ALL' || l.category === activeCategoryFilter;

      // 2. Search term
      const matchSearch =
        l.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.numeroLicence.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((l as any).club && (l as any).club.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((l as any).poste && (l as any).poste.toLowerCase().includes(searchTerm.toLowerCase()));

      // 3. Subfilter (post or club)
      let matchSub = true;
      if (subFilter !== 'TOUS') {
        if (l.category === 'CADRE') {
          matchSub = (l as any).poste === subFilter;
        } else if ((l as any).club) {
          matchSub = (l as any).club === subFilter;
        }
      }

      return matchCat && matchSearch && matchSub;
    });
  }, [licences, activeCategoryFilter, searchTerm, subFilter]);

  const counts = useMemo(() => {
    return {
      ALL: licences.length,
      CADRE: licences.filter((l) => l.category === 'CADRE').length,
      COMPETITION: licences.filter((l) => l.category === 'COMPETITION').length,
      LOISIR: licences.filter((l) => l.category === 'LOISIR').length,
      LIGUE_PRO: licences.filter((l) => l.category === 'LIGUE_PRO').length,
    };
  }, [licences]);

  return (
    <div className="space-y-4">
      {/* 1. Barre de navigation par catégorie principale */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {(['CADRE', 'COMPETITION', 'LOISIR', 'LIGUE_PRO'] as LicenceCategory[]).map((cat) => {
          const conf = CATEGORIES_LICENCES_CONFIG[cat];
          const isSelected = activeCategoryFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => {
                onCategoryFilterChange(cat);
                setSubFilter('TOUS');
              }}
              className={`p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-850 border-fss-blue ring-2 ring-fss-blue/30 shadow-lg scale-[1.01]'
                  : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {cat === 'CADRE' && <Shield className="w-4 h-4 text-amber-400" />}
                  {cat === 'COMPETITION' && <Award className="w-4 h-4 text-emerald-400" />}
                  {cat === 'LOISIR' && <Waves className="w-4 h-4 text-cyan-400" />}
                  {cat === 'LIGUE_PRO' && <Trophy className="w-4 h-4 text-purple-400" />}
                  <span className="text-xs font-bold text-white uppercase">{conf.label}</span>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                    isSelected ? 'bg-fss-blue text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {counts[cat]}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{conf.shortDesc}</p>
            </button>
          );
        })}
      </div>

      {/* 2. Barre d'outils : Recherche & Ajout */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, licence, club, rôle..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-fss-blue"
          />
        </div>

        <button
          onClick={() => onAddLicence(activeCategoryFilter === 'ALL' ? 'CADRE' : activeCategoryFilter)}
          className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-fss-blue to-blue-600 hover:from-blue-600 hover:to-fss-blue text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            Délivrer une Licence{' '}
            {activeCategoryFilter !== 'ALL' ? CATEGORIES_LICENCES_CONFIG[activeCategoryFilter].label : ''}
          </span>
        </button>
      </div>

      {/* 3. Filtres secondaires par poste (si Cadre) ou par Club (si Athlète/Loisir) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSubFilter('TOUS')}
          className={`py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase transition-all shrink-0 ${
            subFilter === 'TOUS'
              ? 'bg-fss-blue text-white shadow-sm'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
          }`}
        >
          Tous ({filteredLicences.length})
        </button>

        {activeCategoryFilter === 'CADRE' &&
          POSTES_DISPONIBLES.map((poste) => {
            const count = licences.filter((l) => l.category === 'CADRE' && (l as any).poste === poste.id).length;
            return (
              <button
                key={poste.id}
                onClick={() => setSubFilter(poste.id)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold uppercase transition-all shrink-0 ${
                  subFilter === poste.id
                    ? 'bg-fss-blue text-white shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {poste.label} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}

        {activeCategoryFilter !== 'CADRE' &&
          CLUBS_SENEGAL.map((club) => {
            const count = licences.filter((l) => (l as any).club === club).length;
            if (count === 0 && subFilter !== club) return null;
            return (
              <button
                key={club}
                onClick={() => setSubFilter(club)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-bold transition-all shrink-0 ${
                  subFilter === club
                    ? 'bg-fss-blue text-white shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {club} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
      </div>

      {/* 4. Grille des Licences */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredLicences.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
            <UserCheck className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-sm font-semibold">Aucune licence trouvée</p>
            <p className="text-slate-500 text-xs mt-1">
              Essayez de modifier votre recherche ou ajoutez une nouvelle licence.
            </p>
          </div>
        ) : (
          filteredLicences.map((licence) => {
            const isSelected = selectedLicence.id === licence.id;
            const isCadre = licence.category === 'CADRE';
            const isComp = licence.category === 'COMPETITION';
            const isLoisir = licence.category === 'LOISIR';
            const isPro = licence.category === 'LIGUE_PRO';

            return (
              <div
                key={licence.id}
                onClick={() => onSelectLicence(licence)}
                className={`relative flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-850 border-fss-blue shadow-lg shadow-fss-blue/10 ring-2 ring-fss-blue/30 scale-[1.01]'
                    : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Photo & Informations */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0">
                    <img
                      src={licence.photoUrl}
                      alt={licence.nom}
                      className="w-full h-full object-cover object-top"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-fss-blue/20 border-2 border-fss-yellow rounded-lg pointer-events-none" />
                    )}
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-white uppercase truncate font-sans">
                        {licence.prenom} {licence.nom}
                      </span>
                    </div>

                    <div
                      className={`text-[11px] font-bold uppercase tracking-wide truncate mt-0.5 ${
                        isCadre
                          ? 'text-amber-400'
                          : isComp
                          ? 'text-emerald-400'
                          : isLoisir
                          ? 'text-cyan-400'
                          : 'text-purple-400'
                      }`}
                    >
                      {isCadre && (licence as any).poste}
                      {isComp && `${(licence as any).discipline} • ${(licence as any).club}`}
                      {isLoisir && `Loisir • ${(licence as any).club}`}
                      {isPro && `${(licence as any).divisionPro}`}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                      <span>{licence.numeroLicence}</span>
                      <span>•</span>
                      <span className="text-slate-300 font-semibold">{licence.saison}</span>
                    </div>
                  </div>
                </div>

                {/* Actions contextuelles */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditLicence(licence);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Modifier"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateLicence(licence);
                    }}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                    title="Dupliquer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLicence(licence.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const CadresList = LicencesList;
