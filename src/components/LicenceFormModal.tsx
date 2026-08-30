import React, { useState, useEffect } from 'react';
import {
  AnyLicence,
  LicenceCategory,
  PosteCadre,
  DisciplineSurf,
  CategorieAge,
} from '../types';
import {
  POSTES_DISPONIBLES,
  CLUBS_SENEGAL,
  DISCIPLINES_SURF,
  CATEGORIES_AGE,
  CATEGORIES_LICENCES_CONFIG,
} from '../data/initialData';
import {
  X,
  Upload,
  User,
  Shield,
  Check,
  Award,
  Waves,
  Trophy,
  HeartPulse,
  Phone,
} from 'lucide-react';

interface LicenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (licence: AnyLicence) => void;
  licenceToEdit?: AnyLicence | null;
  defaultCategory?: LicenceCategory;
}

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
];

export const LicenceFormModal: React.FC<LicenceFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  licenceToEdit,
  defaultCategory = 'CADRE',
}) => {
  const [category, setCategory] = useState<LicenceCategory>(
    licenceToEdit ? licenceToEdit.category : defaultCategory
  );

  const [formData, setFormData] = useState<any>({
    prenom: '',
    nom: '',
    photoUrl: SAMPLE_AVATARS[0],
    numeroLicence: '',
    saison: '2025',
    dateEmission: '2025-01-15',
    dateExpiration: '2025-12-31',
    telephone: '+221 77 ',
    email: '',
    nationalite: 'Sénégalaise',
    institution: 'CONFÉDÉRATION AFRICAINE DE SURF',
    statut: 'ACTIF',
    // Cadre fields
    poste: 'PRÉSIDENT',
    sousTitre: '',
    commission: '',
    // Competition fields
    club: CLUBS_SENEGAL[0],
    discipline: 'Shortboard',
    categorieAge: 'Open / Senior',
    classementNational: 1,
    pointsFSS: 1000,
    certificatMedicalValide: true,
    surfeurIdISA: '',
    // Loisir fields
    niveauPratique: 'Intermédiaire',
    numeroAssurance: `AXA-FSS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    contactUrgenceNom: '',
    contactUrgenceTel: '',
    groupeSanguin: 'O+',
    // Ligue Pro fields
    divisionPro: 'Ligue Pro Africaine',
    rangWSL: 100,
    sponsorsPrincipaux: '',
    statutAthletique: 'Professionnel',
    qrCustomUrl: '',
  });

  useEffect(() => {
    if (licenceToEdit) {
      setCategory(licenceToEdit.category);
      setFormData(licenceToEdit);
    } else {
      setCategory(defaultCategory);
      const prefix =
        defaultCategory === 'CADRE'
          ? 'FSS-CAD'
          : defaultCategory === 'COMPETITION'
          ? 'FSS-CMP'
          : defaultCategory === 'LOISIR'
          ? 'FSS-LOI'
          : 'FSS-PRO';

      setFormData({
        prenom: '',
        nom: '',
        photoUrl: SAMPLE_AVATARS[Math.floor(Math.random() * SAMPLE_AVATARS.length)],
        numeroLicence: `${prefix}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        saison: defaultCategory === 'CADRE' ? '2025 - 2028' : '2025',
        dateEmission: '2025-01-15',
        dateExpiration: defaultCategory === 'CADRE' ? '2028-12-31' : '2025-12-31',
        telephone: '+221 77 ',
        email: '',
        nationalite: 'Sénégalaise',
        institution: defaultCategory === 'CADRE' ? 'CONFÉDÉRATION AFRICAINE DE SURF' : 'FÉDÉRATION SÉNÉGALAISE DE SURF',
        statut: 'ACTIF',
        poste: 'PRÉSIDENT',
        sousTitre: '',
        commission: '',
        club: CLUBS_SENEGAL[0],
        discipline: 'Shortboard',
        categorieAge: 'Open / Senior',
        classementNational: 1,
        pointsFSS: 1000,
        certificatMedicalValide: true,
        surfeurIdISA: '',
        niveauPratique: 'Intermédiaire',
        numeroAssurance: `AXA-FSS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        contactUrgenceNom: '',
        contactUrgenceTel: '',
        groupeSanguin: 'O+',
        divisionPro: 'Ligue Pro Africaine',
        rangWSL: 100,
        sponsorsPrincipaux: '',
        statutAthletique: 'Professionnel',
        qrCustomUrl: '',
      });
    }
  }, [licenceToEdit, defaultCategory, isOpen]);

  if (!isOpen) return null;

  const handleCategorySwitch = (cat: LicenceCategory) => {
    setCategory(cat);
    const prefix =
      cat === 'CADRE'
        ? 'FSS-CAD'
        : cat === 'COMPETITION'
        ? 'FSS-CMP'
        : cat === 'LOISIR'
        ? 'FSS-LOI'
        : 'FSS-PRO';

    setFormData((prev: any) => ({
      ...prev,
      numeroLicence: `${prefix}-2025-${Math.floor(100 + Math.random() * 900)}`,
      saison: cat === 'CADRE' ? '2025 - 2028' : '2025',
      institution: cat === 'CADRE' ? 'CONFÉDÉRATION AFRICAINE DE SURF' : 'FÉDÉRATION SÉNÉGALAISE DE SURF',
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev: any) => ({ ...prev, photoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.prenom || !formData.nom) return;

    const baseData = {
      id: licenceToEdit ? licenceToEdit.id : `lic-${Date.now()}`,
      category: category,
      prenom: formData.prenom.trim().toUpperCase(),
      nom: formData.nom.trim().toUpperCase(),
      photoUrl: formData.photoUrl || SAMPLE_AVATARS[0],
      numeroLicence: formData.numeroLicence,
      saison: formData.saison || '2025',
      dateEmission: formData.dateEmission || '2025-01-15',
      dateExpiration: formData.dateExpiration || '2025-12-31',
      telephone: formData.telephone,
      email: formData.email,
      nationalite: formData.nationalite || 'Sénégalaise',
      institution: formData.institution || 'CONFÉDÉRATION AFRICAINE DE SURF',
      statut: formData.statut || 'ACTIF',
      qrCustomUrl: formData.qrCustomUrl,
    };

    let finalLicence: AnyLicence;

    if (category === 'CADRE') {
      finalLicence = {
        ...baseData,
        category: 'CADRE',
        poste: formData.poste as PosteCadre,
        sousTitre: formData.sousTitre?.trim().toUpperCase() || undefined,
        commission: formData.commission,
      };
    } else if (category === 'COMPETITION') {
      finalLicence = {
        ...baseData,
        category: 'COMPETITION',
        club: formData.club || CLUBS_SENEGAL[0],
        discipline: formData.discipline as DisciplineSurf,
        categorieAge: formData.categorieAge as CategorieAge,
        classementNational: Number(formData.classementNational) || undefined,
        pointsFSS: Number(formData.pointsFSS) || undefined,
        certificatMedicalValide: Boolean(formData.certificatMedicalValide),
        surfeurIdISA: formData.surfeurIdISA,
      };
    } else if (category === 'LOISIR') {
      finalLicence = {
        ...baseData,
        category: 'LOISIR',
        club: formData.club || CLUBS_SENEGAL[0],
        niveauPratique: formData.niveauPratique || 'Intermédiaire',
        numeroAssurance: formData.numeroAssurance || `AXA-FSS-2025-001`,
        contactUrgenceNom: formData.contactUrgenceNom,
        contactUrgenceTel: formData.contactUrgenceTel,
        groupeSanguin: formData.groupeSanguin,
      };
    } else {
      finalLicence = {
        ...baseData,
        category: 'LIGUE_PRO',
        club: formData.club || CLUBS_SENEGAL[0],
        discipline: formData.discipline as DisciplineSurf,
        divisionPro: formData.divisionPro || 'Ligue Pro Africaine',
        rangWSL: Number(formData.rangWSL) || undefined,
        sponsorsPrincipaux: formData.sponsorsPrincipaux,
        statutAthletique: formData.statutAthletique || 'Professionnel',
      };
    }

    onSave(finalLicence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-fss-blue/20 text-fss-blue rounded-xl border border-fss-blue/30">
              {category === 'CADRE' && <Shield className="w-5 h-5 text-amber-400" />}
              {category === 'COMPETITION' && <Award className="w-5 h-5 text-emerald-400" />}
              {category === 'LOISIR' && <Waves className="w-5 h-5 text-cyan-400" />}
              {category === 'LIGUE_PRO' && <Trophy className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide font-sans">
                {licenceToEdit ? 'Modifier la Licence' : 'Délivrer une Nouvelle Licence'}
              </h2>
              <p className="text-xs text-slate-400">
                Fédération Sénégalaise de Surf • Système centralisé des titres
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Sélection du Type de Licence */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Type de Licence & Statut <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['CADRE', 'COMPETITION', 'LOISIR', 'LIGUE_PRO'] as LicenceCategory[]).map((cat) => {
                const conf = CATEGORIES_LICENCES_CONFIG[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategorySwitch(cat)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold uppercase text-center transition-all border flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-fss-blue text-white border-fss-blue ring-2 ring-fss-blue/30 shadow-md scale-[1.02]'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Spécifique 1 : CADRE FÉDÉRAL (Sélection des 7 postes demandés) */}
          {category === 'CADRE' && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Poste Officiel (Cadre Fédéral) <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POSTES_DISPONIBLES.map((poste) => {
                  const isSelected = formData.poste === poste.id;
                  return (
                    <button
                      key={poste.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, poste: poste.id })}
                      className={`py-2 px-2.5 rounded-lg text-[11px] font-bold uppercase text-left transition-all border ${
                        isSelected
                          ? 'bg-fss-blue text-white border-fss-blue ring-2 ring-fss-blue/30 shadow-sm'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                      }`}
                    >
                      <div className="truncate">{poste.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section Spécifique 2 : COMPÉTITION */}
          {category === 'COMPETITION' && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Club Affilié</label>
                  <select
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    {CLUBS_SENEGAL.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Discipline</label>
                  <select
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    {DISCIPLINES_SURF.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Catégorie d'Âge</label>
                  <select
                    value={formData.categorieAge}
                    onChange={(e) => setFormData({ ...formData, categorieAge: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    {CATEGORIES_AGE.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rang National</label>
                  <input
                    type="number"
                    value={formData.classementNational || ''}
                    onChange={(e) => setFormData({ ...formData, classementNational: e.target.value })}
                    placeholder="ex: 1"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Points FSS</label>
                  <input
                    type="number"
                    value={formData.pointsFSS || ''}
                    onChange={(e) => setFormData({ ...formData, pointsFSS: e.target.value })}
                    placeholder="ex: 3500"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Surfeur ID ISA</label>
                  <input
                    type="text"
                    value={formData.surfeurIdISA || ''}
                    onChange={(e) => setFormData({ ...formData, surfeurIdISA: e.target.value })}
                    placeholder="ISA-SEN-..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Spécifique 3 : LOISIR */}
          {category === 'LOISIR' && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">École / Club</label>
                  <select
                    value={formData.club}
                    onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    {CLUBS_SENEGAL.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Niveau Pratique</label>
                  <select
                    value={formData.niveauPratique}
                    onChange={(e) => setFormData({ ...formData, niveauPratique: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    <option value="Débutant">Débutant (Initiation)</option>
                    <option value="Intermédiaire">Intermédiaire (Autonome)</option>
                    <option value="Confirmé">Confirmé (Toutes vagues)</option>
                    <option value="Expert">Expert (Gros surf)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Police Assurance</label>
                  <input
                    type="text"
                    value={formData.numeroAssurance || ''}
                    onChange={(e) => setFormData({ ...formData, numeroAssurance: e.target.value })}
                    placeholder="AXA-FSS-2025-..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Urgence (Nom)</label>
                  <input
                    type="text"
                    value={formData.contactUrgenceNom || ''}
                    onChange={(e) => setFormData({ ...formData, contactUrgenceNom: e.target.value })}
                    placeholder="Parent / Proche"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Urgence (Tél)</label>
                  <input
                    type="text"
                    value={formData.contactUrgenceTel || ''}
                    onChange={(e) => setFormData({ ...formData, contactUrgenceTel: e.target.value })}
                    placeholder="+221 77 ..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Groupe Sanguin</label>
                  <select
                    value={formData.groupeSanguin}
                    onChange={(e) => setFormData({ ...formData, groupeSanguin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section Spécifique 4 : LIGUE PRO */}
          {category === 'LIGUE_PRO' && (
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Division Pro</label>
                  <select
                    value={formData.divisionPro}
                    onChange={(e) => setFormData({ ...formData, divisionPro: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    <option value="Ligue Pro Africaine">Ligue Pro Africaine</option>
                    <option value="World Qualifying Series (QS)">World Qualifying Series (QS)</option>
                    <option value="Championship Tour (CT)">Championship Tour (CT)</option>
                    <option value="Élite Sénégal">Élite Sénégal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rang WSL Mondial</label>
                  <input
                    type="number"
                    value={formData.rangWSL || ''}
                    onChange={(e) => setFormData({ ...formData, rangWSL: e.target.value })}
                    placeholder="ex: 142"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Statut Athlétique</label>
                  <select
                    value={formData.statutAthletique}
                    onChange={(e) => setFormData({ ...formData, statutAthletique: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                  >
                    <option value="Professionnel">Professionnel</option>
                    <option value="Semi-Professionnel">Semi-Professionnel</option>
                    <option value="Espoir Pro">Espoir Pro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Sponsors Principaux</label>
                <input
                  type="text"
                  value={formData.sponsorsPrincipaux || ''}
                  onChange={(e) => setFormData({ ...formData, sponsorsPrincipaux: e.target.value })}
                  placeholder="ex: Rip Curl • Surf Senegal • Orange SN"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                />
              </div>
            </div>
          )}

          {/* Nom, Prénom & Sous-titre */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Prénom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.prenom || ''}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                placeholder="ex: SOULEYE"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nom || ''}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                placeholder="ex: MBENGUE"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sous-titre / Complément (Optionnel)
              </label>
              <input
                type="text"
                value={formData.sousTitre || ''}
                onChange={(e) => setFormData({ ...formData, sousTitre: e.target.value })}
                placeholder="ex: ADJOINT, NATIONAL..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue uppercase"
              />
            </div>
          </div>

          {/* Photo de Profil */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Photo d'Identité Officielle
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/60 p-3 rounded-xl border border-slate-700/80">
              <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden border border-fss-blue/50 flex-shrink-0 relative">
                {formData.photoUrl ? (
                  <img
                    src={formData.photoUrl}
                    alt="Aperçu"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500">
                    <User className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-all">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Importer une photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">ou choisir un avatar démo :</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {SAMPLE_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, photoUrl: url })}
                      className={`w-8 h-8 rounded-full overflow-hidden border-2 flex-shrink-0 transition-all ${
                        formData.photoUrl === url
                          ? 'border-fss-yellow scale-110 shadow-md'
                          : 'border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Demo ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Numéro de Licence, Saison & Institution */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                N° Matricule / Licence
              </label>
              <input
                type="text"
                value={formData.numeroLicence || ''}
                onChange={(e) => setFormData({ ...formData, numeroLicence: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Saison / Mandat
              </label>
              <input
                type="text"
                value={formData.saison || '2025'}
                onChange={(e) => setFormData({ ...formData, saison: e.target.value })}
                placeholder="2025"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Institution
              </label>
              <select
                value={formData.institution}
                onChange={(e) =>
                  setFormData({ ...formData, institution: e.target.value as any })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue"
              >
                <option value="CONFÉDÉRATION AFRICAINE DE SURF">CONFÉDÉRATION AFRICAINE DE SURF</option>
                <option value="FÉDÉRATION SÉNÉGALAISE DE SURF">FÉDÉRATION SÉNÉGALAISE DE SURF</option>
              </select>
            </div>
          </div>

          {/* Contacts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Téléphone
              </label>
              <input
                type="text"
                value={formData.telephone || ''}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                placeholder="+221 77 ..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nom@domaine.sn"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fss-blue"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 py-2.5 px-6 rounded-xl text-xs font-bold bg-gradient-to-r from-fss-blue to-blue-600 hover:from-blue-600 hover:to-fss-blue text-white shadow-lg transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{licenceToEdit ? 'Mettre à jour la Licence' : 'Délivrer la Licence'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const CadreFormModal = LicenceFormModal;
