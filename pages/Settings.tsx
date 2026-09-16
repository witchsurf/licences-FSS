import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupService, InstitutionAffiliation } from '../services/setupService';
import { LicenseService } from '../services/licenseService';
import { COUNTRIES, getCountryByCodeOrName } from '../config/countries';
import { parseAffiliations } from '../components/FederalOfficialCard';
import { 
  Building2, 
  Upload, 
  Lock, 
  Save, 
  Download, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Tag,
  ShieldCheck,
  Globe,
  Flag,
  RotateCcw,
  Award,
  Check,
  Trash2,
  Plus,
  Image as ImageIcon
} from 'lucide-react';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'backup'>('general');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [entityName, setEntityName] = useState('');
  const [entityAcronym, setEntityAcronym] = useState('');
  const [entityCountry, setEntityCountry] = useState('SN');
  const [entityLogo, setEntityLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [entityFlag, setEntityFlag] = useState('');
  const [flagPreview, setFlagPreview] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const [entityPhone, setEntityPhone] = useState('');
  const [entityEmail, setEntityEmail] = useState('');
  const [institutions, setInstitutions] = useState<InstitutionAffiliation[]>([]);
  const [newInstName, setNewInstName] = useState('');

  const togglePreset = (name: string) => {
    const exists = institutions.some(i => i.name.toUpperCase() === name.toUpperCase());
    if (exists) {
      setInstitutions(institutions.filter(i => i.name.toUpperCase() !== name.toUpperCase()));
    } else {
      setInstitutions([...institutions, { id: name.toLowerCase().replace(/\s+/g, '-'), name }]);
    }
  };

  const isPresetSelected = (name: string) => {
    return institutions.some(i => i.name.toUpperCase() === name.toUpperCase());
  };

  const handleAddCustomInstitution = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInstName.trim();
    if (!trimmed) return;
    if (institutions.some(i => i.name.toUpperCase() === trimmed.toUpperCase())) {
      setNewInstName('');
      return;
    }
    setInstitutions([...institutions, { id: 'inst-' + Date.now(), name: trimmed }]);
    setNewInstName('');
  };

  const handleUploadInstitutionLogo = async (id: string, file: File) => {
    try {
      const url = await SetupService.uploadInstitutionLogo(file);
      setInstitutions(prev => prev.map(inst => inst.id === id ? { ...inst, logoUrl: url } : inst));
      setMessage({ type: 'success', text: `Logo mis à jour avec succès` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors du téléversement du logo" });
    }
  };

  const handleRemoveInstitutionLogo = (id: string) => {
    setInstitutions(prev => prev.map(inst => inst.id === id ? { ...inst, logoUrl: undefined } : inst));
  };

  const handleRemoveInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(inst => inst.id !== id));
  };

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    if (!LicenseService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadSettings();
  }, [navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const config = await SetupService.getFullConfig();
      if (config.entityName) setEntityName(config.entityName);
      if (config.entityAcronym) setEntityAcronym(config.entityAcronym);
      if (config.entityCountry) setEntityCountry(config.entityCountry);
      if (config.entityLogo) {
        setEntityLogo(config.entityLogo);
        setLogoPreview(config.entityLogo);
      }
      if (config.entityFlag) {
        setEntityFlag(config.entityFlag);
        setFlagPreview(config.entityFlag);
      }
      if (config.entityAddress) setEntityAddress(config.entityAddress);
      if (config.entityPhone) setEntityPhone(config.entityPhone);
      if (config.entityEmail) setEntityEmail(config.entityEmail);
      if (config.entityAffiliations !== undefined) {
        setInstitutions(parseAffiliations(config.entityAffiliations));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const url = await SetupService.uploadLogo(file);
      setEntityLogo(url);
      setMessage({ type: 'success', text: 'Logo téléversé avec succès' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'upload" });
    } finally {
      setLoading(false);
    }
  };

  const handleFlagUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFlagPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const url = await SetupService.uploadFlag(file);
      setEntityFlag(url);
      setMessage({ type: 'success', text: 'Drapeau téléversé avec succès' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Erreur lors de l'upload du drapeau" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetFlag = () => {
    setEntityFlag('');
    setFlagPreview('');
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await SetupService.updateConfig({
        entityName,
        entityAcronym: entityAcronym.trim() || 'LIC',
        entityCountry,
        entityLogo,
        entityFlag,
        entityAddress,
        entityPhone,
        entityEmail,
        entityAffiliations: JSON.stringify(institutions),
      });
      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de l\'enregistrement' });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 4 caractères.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les deux mots de passe ne correspondent pas.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await SetupService.updateConfig({
        adminPassword: newPassword,
      });
      setNewPassword('');
      setConfirmPassword('');
      setMessage({ type: 'success', text: 'Mot de passe administrateur mis à jour avec succès !' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      setMessage(null);
      await SetupService.downloadBackup();
      setMessage({ type: 'success', text: 'Sauvegarde téléchargée avec succès.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors du téléchargement' });
    }
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier .db' });
      return;
    }

    if (!confirm('ATTENTION : La restauration remplacera toutes les données actuelles par la sauvegarde. Voulez-vous continuer ?')) {
      return;
    }

    setRestoring(true);
    setMessage(null);

    try {
      const res = await SetupService.restoreBackup(restoreFile);
      setMessage({ type: 'success', text: res.message || 'Base restaurée avec succès ! Rechargement...' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la restauration' });
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium mb-2 transition-colors"
          >
            <ArrowLeft size={16} />
            Retour au tableau de bord
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Paramètres de l'Application
          </h1>
          <p className="text-slate-500 text-sm">
            Gérez l'identité de l'organisation, la sécurité et la sauvegarde locale
          </p>
        </div>
      </div>

      {/* Message notification */}
      {message && (
        <div className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 text-sm animate-in fade-in duration-300 ${
          message.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-600" /> : <AlertTriangle size={18} className="text-red-600" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 space-x-8">
        <button
          onClick={() => { setActiveTab('general'); setMessage(null); }}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Building2 size={18} />
          Organisation & Marque
        </button>

        <button
          onClick={() => { setActiveTab('security'); setMessage(null); }}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Lock size={18} />
          Sécurité & Mot de Passe
        </button>

        <button
          onClick={() => { setActiveTab('backup'); setMessage(null); }}
          className={`pb-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'backup'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database size={18} />
          Sauvegarde & Données
        </button>
      </div>

      {/* TAB 1: General Organization */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
            {/* Logo */}
            <div className="flex items-center gap-4">
              {logoPreview ? (
                <img 
                  src={logoPreview} 
                  alt="Logo organisation" 
                  className="w-20 h-20 rounded-2xl object-contain border border-slate-200 p-1 bg-slate-50 shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <Building2 size={32} />
                </div>
              )}
              <div>
                <h3 className="text-base font-bold text-slate-900">Logo de l'entité</h3>
                <p className="text-xs text-slate-500 mb-2">Affiché sur les cartes de licence, en-têtes et exports</p>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200">
                  <Upload size={14} />
                  Changer le logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              </div>
            </div>

            {/* Drapeau des cadres */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center relative shadow-sm">
                {flagPreview ? (
                  <img src={flagPreview} alt="Drapeau personnalisé" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-3xl block leading-none">{getCountryByCodeOrName(entityCountry).flag}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-1 block tracking-wider">{entityCountry}</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <Flag size={16} className="text-emerald-600" />
                  Drapeau licences cadres
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  {flagPreview ? "Drapeau personnalisé actif" : `Drapeau officiel (${getCountryByCodeOrName(entityCountry).name})`}
                </p>
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-200">
                    <Upload size={14} />
                    {flagPreview ? "Changer" : "Personnaliser"}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFlagUpload} />
                  </label>
                  {flagPreview && (
                    <button
                      type="button"
                      onClick={handleResetFlag}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
                      title="Revenir au drapeau officiel national"
                    >
                      <RotateCcw size={13} />
                      Défaut
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nom officiel de l'organisation *
              </label>
              <input
                type="text"
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Tag size={14} className="text-emerald-600" />
                Sigle / Préfixe des licences
              </label>
              <input
                type="text"
                maxLength={8}
                value={entityAcronym}
                onChange={(e) => setEntityAcronym(e.target.value.toUpperCase())}
                placeholder="Ex: FFS, CLB, LIC"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
              <p className="text-xs text-slate-400 mt-1">Exemple : {entityAcronym || 'LIC'}-{new Date().getFullYear()}-000001</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Globe size={14} className="text-emerald-600" />
                Pays de l'organisateur *
              </label>
              <select
                value={entityCountry}
                onChange={(e) => setEntityCountry(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium cursor-pointer"
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">
                Définit le drapeau affiché sur le coin supérieur gauche des licences cadres.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-600" />
                Adresse du siège
              </label>
              <input
                type="text"
                value={entityAddress}
                onChange={(e) => setEntityAddress(e.target.value)}
                placeholder="Adresse, Ville, Code Postal"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail size={14} className="text-emerald-600" />
                Email officiel
              </label>
              <input
                type="email"
                value={entityEmail}
                onChange={(e) => setEntityEmail(e.target.value)}
                placeholder="contact@organisation.org"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Phone size={14} className="text-emerald-600" />
                Téléphone
              </label>
              <input
                type="tel"
                value={entityPhone}
                onChange={(e) => setEntityPhone(e.target.value)}
                placeholder="+33 1 23 45 67 89"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award size={15} className="text-emerald-600" />
                Affiliations aux institutions internationales & logos
              </label>
              <p className="text-xs text-slate-500">
                Configurez les institutions internationales ou continentales et téléversez leurs logos officiels. Ces logos apparaîtront en bas des cartes de cadres.
              </p>
            </div>

            {/* Quick Add Presets & Custom Input */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 mr-1">Raccourcis :</span>
              {[
                { name: 'CIO', label: '🏅 CIO (Olympique)' },
                { name: 'ISA', label: '🏄 ISA (Surfing)' },
                { name: 'ASC', label: '🌍 ASC (Afrique)' }
              ].map(({ name, label }) => {
                const selected = isPresetSelected(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => togglePreset(name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                      selected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {selected && <Check size={12} className="text-emerald-600" />}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Custom institution inline add form */}
            <div className="flex items-center gap-2 max-w-md">
              <input
                type="text"
                placeholder="Autre institution (ex: WSL, World Skate, FCS)..."
                value={newInstName}
                onChange={(e) => setNewInstName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomInstitution();
                  }
                }}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => handleAddCustomInstitution()}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all shrink-0"
              >
                <Plus size={14} /> Ajouter
              </button>
            </div>

            {/* Active Institutions Cards Grid */}
            {institutions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {institutions.map((inst) => (
                  <div key={inst.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-slate-800 tracking-wide">{inst.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveInstitution(inst.id)}
                        className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                        title="Retirer cette institution"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Logo thumbnail or placeholder */}
                      <div className="h-12 w-20 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                        {inst.logoUrl ? (
                          <img src={inst.logoUrl} alt={inst.name} className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-300">
                            <ImageIcon size={18} />
                            <span className="text-[8px] font-bold uppercase mt-0.5">Logo SVG/Vect</span>
                          </div>
                        )}
                      </div>

                      {/* Upload and remove buttons */}
                      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all truncate">
                          <Upload size={12} />
                          <span>{inst.logoUrl ? 'Changer logo' : 'Mettre un logo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadInstitutionLogo(inst.id, f);
                            }}
                          />
                        </label>

                        {inst.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInstitutionLogo(inst.id)}
                            className="text-[10px] text-slate-400 hover:text-red-500 font-semibold text-center transition-colors"
                          >
                            Supprimer le logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
                Aucune affiliation configurée. Les cartes de cadres n'afficheront aucun insigne par défaut.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Password */}
      {activeTab === 'security' && (
        <form onSubmit={handleSavePassword} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mot de Passe Administrateur</h3>
              <p className="text-xs text-slate-500">Modifiez le code d'accès principal de cette application</p>
            </div>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="4 caractères minimum"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirmez le nouveau mot de passe *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Lock size={16} />
              {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Export card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Download size={20} className="text-emerald-600" />
                  Exporter une Sauvegarde Complète
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Télécharge un instantané direct de votre base de données locale (`.db`). Conservez ce fichier sur une clé USB ou un disque externe pour mettre vos données à l'abri.
                </p>
              </div>
              <button
                onClick={handleDownloadBackup}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0 shadow-md"
              >
                <Download size={16} />
                Télécharger la Sauvegarde
              </button>
            </div>
          </div>

          {/* Restore card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Database size={20} className="text-amber-600" />
              Restaurer une Sauvegarde
            </h3>
            <p className="text-xs text-slate-500 mb-6 max-w-xl">
              Importez un fichier de sauvegarde (`.db`) préalablement exporté. Cette action remplacera toutes les données actuelles par le contenu du fichier.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <input
                type="file"
                accept=".db"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              <button
                disabled={!restoreFile || restoring}
                onClick={handleRestoreBackup}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold transition-colors shrink-0 shadow-md"
              >
                <Database size={16} />
                {restoring ? 'Restauration en cours...' : 'Restaurer la Base'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
