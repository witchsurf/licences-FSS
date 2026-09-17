import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupService } from '../services/setupService';
import { LicenseService } from '../services/licenseService';
import { 
  Building2, 
  Upload, 
  Lock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Tag,
  Globe,
  Award,
  Check,
  Trash2,
  Plus,
  Image as ImageIcon
} from 'lucide-react';
import { COUNTRIES } from '../config/countries';
import { InstitutionAffiliation } from '../services/setupService';
import { CNOSSBadge, ISASurfLogo, ASCSurfLogo, OlympicRings } from '../components/FederalOfficialCard';

export const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form State
  const [entityName, setEntityName] = useState('');
  const [entityAcronym, setEntityAcronym] = useState('');
  const [entityCountry, setEntityCountry] = useState('SN');
  const [entityFlag, setEntityFlag] = useState('');
  const [entityLogo, setEntityLogo] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [entityEmail, setEntityEmail] = useState('');
  const [entityPhone, setEntityPhone] = useState('');
  const [entityAddress, setEntityAddress] = useState('');
  const [institutions, setInstitutions] = useState<InstitutionAffiliation[]>([]);
  const [newInstName, setNewInstName] = useState('');

  const togglePreset = (name: string) => {
    const exists = institutions.some(i => i.name.toUpperCase() === name.toUpperCase());
    if (exists) {
      setInstitutions(institutions.filter(i => i.name.toUpperCase() !== name.toUpperCase()));
    } else {
      let defaultLogo: string | undefined = undefined;
      if (name.toUpperCase() === 'ISA') defaultLogo = '/isa_logo.svg';
      setInstitutions([...institutions, { id: name.toLowerCase().replace(/\s+/g, '-'), name, logoUrl: defaultLogo }]);
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
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'upload du logo");
    }
  };

  const handleRemoveInstitutionLogo = (id: string) => {
    setInstitutions(prev => prev.map(inst => inst.id === id ? { ...inst, logoUrl: undefined } : inst));
  };

  const handleRemoveInstitution = (id: string) => {
    setInstitutions(prev => prev.filter(inst => inst.id !== id));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setLoading(true);
      const url = await SetupService.uploadLogo(file);
      setEntityLogo(url);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléchargement du logo');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    if (adminPassword.length < 4) {
      setError('Le mot de passe administrateur doit contenir au moins 4 caractères.');
      return;
    }
    if (adminPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await SetupService.initialize({
        entityName,
        entityAcronym: entityAcronym.trim() || 'LIC',
        entityCountry: entityCountry || 'SN',
        entityFlag: entityFlag || undefined,
        entityLogo: entityLogo || logoPreview,
        entityAddress,
        entityPhone,
        entityEmail,
        entityAffiliations: JSON.stringify(institutions),
        adminPassword,
      });

      // Auto login with new password
      await LicenseService.login(adminPassword);
      LicenseService.setAuthUIState(true);

      // Redirect to dashboard
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'enregistrement de la configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden text-slate-100">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-emerald-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-teal-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-10 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            Assistant de Première Installation
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Licences Manager
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">
            Personnalisez votre plateforme et sécurisez votre instance locale
          </p>
        </div>

        {/* Steps Progress Indicator */}
        <div className="flex items-center justify-between mb-8 px-2 sm:px-6">
          {[
            { num: 1, label: 'Entité' },
            { num: 2, label: 'Logo' },
            { num: 3, label: 'Sécurité' },
          ].map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-2">
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                    step === s.num
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30 scale-105'
                      : step > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {step > s.num ? <CheckCircle2 size={20} /> : s.num}
                </div>
                <span className={`text-xs font-medium ${step >= s.num ? 'text-slate-200' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {idx < 2 && (
                <div 
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors duration-300 ${
                    step > s.num ? 'bg-emerald-500' : 'bg-slate-800'
                  }`} 
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        {/* Wizard Form Steps */}
        <div className="min-h-[300px]">
          {/* STEP 1: Entity Name & Acronym */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-400" />
                  Identité de votre Organisation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ces informations figureront sur l'ensemble des licences générées et les cartes officielles.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nom officiel de l'entité *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Fédération de Surf, Club Nautique, Ligue..."
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Tag size={14} className="text-emerald-400" />
                  Sigle / Préfixe des numéros de licence
                </label>
                <input
                  type="text"
                  maxLength={8}
                  placeholder="Ex : FSS, CLB, FSURF (défaut : LIC)"
                  value={entityAcronym}
                  onChange={(e) => setEntityAcronym(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white uppercase placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Format des licences générées : <span className="text-emerald-400 font-mono font-medium">{entityAcronym || 'LIC'}-{new Date().getFullYear()}-000001</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Globe size={14} className="text-emerald-400" />
                  Pays officiel de l'organisation *
                </label>
                <select
                  value={entityCountry}
                  onChange={(e) => setEntityCountry(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                >
                  {COUNTRIES.map(c => (
                    <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1.5">
                  Le drapeau de ce pays apparaîtra dans le coin supérieur gauche des cartes officielles de cadres.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Award size={14} className="text-emerald-400" />
                    Affiliations aux institutions internationales & logos
                  </label>
                  <p className="text-xs text-slate-400">
                    Ajoutez vos institutions partenaires (ex: CIO, ISA, ASC) et téléversez leurs logos officiels pour les cartes de cadres.
                  </p>
                </div>

                {/* Presets Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">Raccourcis :</span>
                  {[
                    { name: 'CIO', label: '🏅 CIO (Olympique)' },
                    { name: 'CNOSS', label: '🇸🇳 CNOSS (Sénégal)' },
                    { name: 'ISA', label: '🏄 ISA (Surfing)' },
                    { name: 'ASC', label: '🌍 ASC (Afrique)' }
                  ].map(({ name, label }) => {
                    const selected = isPresetSelected(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => togglePreset(name)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border ${
                          selected
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                        }`}
                      >
                        {selected && <Check size={12} className="text-emerald-400" />}
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Custom institution inline add */}
                <div className="flex items-center gap-2">
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
                    className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCustomInstitution()}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shrink-0"
                  >
                    <Plus size={14} /> Ajouter
                  </button>
                </div>

                {/* Active Institutions Grid */}
                {institutions.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {institutions.map((inst) => (
                      <div key={inst.id} className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="h-10 w-16 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 overflow-hidden">
                            {inst.logoUrl ? (
                              <img src={inst.logoUrl} alt={inst.name} className="h-full w-full object-contain" />
                            ) : (
                              (() => {
                                const upper = inst.name.trim().toUpperCase();
                                if (upper.includes('CNOSS')) return <CNOSSBadge className="h-8 w-8" />;
                                if (upper === 'CIO' || upper.includes('OLYMP')) return <OlympicRings className="h-5 w-10" />;
                                if (upper === 'ASC') return <ASCSurfLogo className="h-5" />;
                                if (upper === 'ISA') return <ISASurfLogo className="h-5" />;
                                return (
                                  <div className="flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon size={14} />
                                    <span className="text-[7px] font-bold uppercase">Sans logo</span>
                                  </div>
                                );
                              })()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate uppercase">{inst.name}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <label className="cursor-pointer text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                                <Upload size={10} />
                                {inst.logoUrl ? 'Changer' : 'Image perso'}
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

                              {inst.logoUrl ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInstitutionLogo(inst.id)}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-0.5"
                                  title="Rétablir le logo vectoriel HD"
                                >
                                  <Sparkles size={9} />
                                  <span>Vectoriel HD</span>
                                </button>
                              ) : (
                                <span className="text-[9px] text-emerald-400/80 font-medium flex items-center gap-0.5">
                                  <Sparkles size={9} />
                                  HD actif
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveInstitution(inst.id)}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail size={14} className="text-emerald-400" />
                    Email de contact
                  </label>
                  <input
                    type="email"
                    placeholder="contact@organisation.org"
                    value={entityEmail}
                    onChange={(e) => setEntityEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Phone size={14} className="text-emerald-400" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    placeholder="+33 1 23 45 67 89"
                    value={entityPhone}
                    onChange={(e) => setEntityPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-400" />
                  Adresse du siège
                </label>
                <input
                  type="text"
                  placeholder="Adresse postale, Ville, Pays"
                  value={entityAddress}
                  onChange={(e) => setEntityAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Entity Logo */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-center">
              <div className="border-b border-slate-800 pb-4 text-left">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Upload size={20} className="text-emerald-400" />
                  Logo de votre Organisation
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Le logo sera imprimé en haute définition sur les licences, cartes officielles et en-têtes.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 bg-slate-950/60 rounded-3xl transition-colors">
                {logoPreview ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-32 h-32 rounded-2xl bg-slate-900 p-2 border border-slate-700 shadow-xl flex items-center justify-center overflow-hidden">
                      <img 
                        src={logoPreview} 
                        alt="Aperçu logo" 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <span className="text-xs text-emerald-400 font-medium">Logo prêt pour l'intégration</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 border border-slate-800">
                      <Building2 size={36} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">Sélectionnez le fichier du logo</p>
                      <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, SVG jusqu'à 5 MB (fond transparent recommandé)</p>
                    </div>
                  </div>
                )}

                <label className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer border border-slate-700 hover:border-emerald-500 transition-all shadow-md">
                  <Upload size={14} />
                  {logoPreview ? 'Changer de logo' : 'Parcourir les fichiers'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleLogoUpload} 
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 3: Admin Password & Machine Security */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Lock size={20} className="text-emerald-400" />
                  Sécurité & Code Administrateur
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Définissez le mot de passe d'accès et verrouillez l'application sur cette machine.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nouveau mot de passe administrateur *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Choisissez un mot de passe robuste"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirmez le mot de passe *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Retapez le mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                />
              </div>

              {/* Security Shield Card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 mt-4">
                <ShieldCheck size={24} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-wide">
                    Protection Matérielle Activée (Hardware Lock)
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Cette instance sera automatiquement verrouillée sur l'identifiant matériel unique de cette machine physique (CPU + Carte Mère + Réseau). L'installeur ne pourra pas être répliqué sur un autre ordinateur sans autorisation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => {
                setError('');
                setStep(step - 1);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <ArrowLeft size={16} />
              Précédent
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !entityName.trim()) {
                  setError("Le nom de l'organisation est obligatoire.");
                  return;
                }
                setError('');
                setStep(step + 1);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
            >
              Suivant
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleFinish}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/30 transition-all uppercase tracking-wider"
            >
              {loading ? 'Configuration en cours...' : 'Finaliser & Lancer'}
              <CheckCircle2 size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
