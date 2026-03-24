import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { LicenseCategory, LicenseType } from '../types';
import {
  ArrowLeft, Camera, Save, User, MapPin,
  Phone, Mail, Building2, Calendar, ShieldCheck,
  Upload, Info
} from 'lucide-react';

export const LicenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const predefinedClubs = [
    'SURF CLUB NGOR',
    'TAKEOFF NGOR',
    'HAPPY SECRET GARDEN',
    'MALIKA SURF',
    'COPACABANA SURF VILLAGE',
    'SURF ATTITUDE',
    'SOMONE SURF',
    'BLACK AND WHITE'
  ];

  const [isOtherClub, setIsOtherClub] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: 'Sénégalaise',
    address: '',
    phone: '',
    email: '',
    club: '',
    category: LicenseCategory.OPEN,
    type: LicenseType.COMPETITION,
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    photoUrl: '',
  });

  useEffect(() => {
    const init = async () => {
      const isAuth = await LicenseService.isAuthenticated();
      if (!isAuth) {
        navigate('/login');
        return;
      }

      if (id) {
        const data = await LicenseService.getById(id);
        if (data) {
          // Normalize Category
          let category = (data.category as string || '').toUpperCase() as LicenseCategory;
          if (category.toString() === 'SENIOR') category = LicenseCategory.OPEN;
          if (!Object.values(LicenseCategory).includes(category)) category = LicenseCategory.OPEN;

          // Normalize Type
          let type = (data.type as string || '').toLowerCase();
          let finalType = LicenseType.COMPETITION;
          if (type.includes('loisir')) finalType = LicenseType.LOISIR;
          if (type.includes('pro')) finalType = LicenseType.LIGUE_PRO;

          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            birthDate: data.birthDate || '',
            nationality: data.nationality || 'Sénégalaise',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            club: data.club || '',
            category: category,
            type: finalType,
            issueDate: data.issueDate || '',
            expirationDate: data.expirationDate || '',
            photoUrl: data.photoUrl || '',
          });
          setPhotoPreview(data.photoUrl);
          if (data.club && !predefinedClubs.includes(data.club)) {
            setIsOtherClub(true);
          }
        }
      } else {
        const expDate = new Date();
        expDate.setFullYear(expDate.getFullYear() + 1);
        setFormData(prev => ({ ...prev, expirationDate: expDate.toISOString().split('T')[0] }));
      }
    };
    init();
  }, [id, navigate]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        photoUrl = await LicenseService.uploadPhoto(photoFile);
      }

      const finalData = { ...formData, photoUrl };

      if (id) {
        await LicenseService.update(id, finalData);
      } else {
        await LicenseService.create(finalData);
      }
      navigate('/admin');
    } catch (err: any) {
      let msg = err.message || "Une erreur est survenue";
      if (err.details) {
        const details = Object.entries(err.details)
          .map(([field, info]: [string, any]) => `${field}: ${info._errors?.join(', ')}`)
          .join('\n');
        msg += `\n\nDétails techniques:\n${details}`;
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-fss-green/20 focus:border-fss-green outline-none transition-all";
  const labelClasses = "text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1.5 flex items-center gap-2";

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-500">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{id ? 'Modifier la Licence' : 'Nouvelle Licence'}</h1>
            <p className="text-xs text-slate-500">Gestion administrative FSS</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin')} className="btn-secondary h-11 px-6 hidden sm:flex">Annuler</button>
          <button
            type="submit"
            form="license-form"
            disabled={loading}
            className="btn-primary h-11 px-8 shadow-lg shadow-fss-green/20"
          >
            {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={18} /> Enregistrer</>}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <form id="license-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Photo & Details */}
          <div className="space-y-8 lg:col-span-1">
            <div className="premium-card p-6 flex flex-col items-center">
              <label className={labelClasses}>Photo Officielle</label>
              <div className="relative group cursor-pointer mt-4">
                <div className="h-48 w-48 bg-slate-100 rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-slate-200 relative">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Camera size={40} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Choisir Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white pointer-events-none">
                    <Upload size={24} />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-6 text-center italic">Format recommandé: 400x400px, fond neutre</p>
            </div>

            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <ShieldCheck size={18} className="text-fss-green" />
                Statut et Validité
              </h3>
              <div>
                <label className={labelClasses}><Calendar size={14} /> Date d'émission</label>
                <input
                  type="date"
                  value={formData.issueDate}
                  onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label className={labelClasses}><Calendar size={14} /> Date d'expiration</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                  className={inputClasses}
                  required
                />
              </div>
            </div>
          </div>

          {/* Right Column: Information Forms */}
          <div className="lg:col-span-2 space-y-8 animate-fade-in">
            <div className="premium-card p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="h-8 w-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                  <User size={18} />
                </div>
                <h2 className="text-lg font-bold">Informations Personnelles</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Prénom</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    className={inputClasses}
                    placeholder="Prénom du licencié"
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Nom</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    className={inputClasses}
                    placeholder="Nom du licencié"
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Date de Naissance</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Nationalité</label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className={labelClasses}><MapPin size={14} /> Adresse Résidentielle</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={inputClasses}
                  placeholder="Adresse complète"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={labelClasses}><Phone size={14} /> Téléphone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className={inputClasses}
                    placeholder="+221 ..."
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}><Mail size={14} /> Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className={inputClasses}
                    placeholder="email@domaine.com"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="premium-card p-8">
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
                <div className="h-8 w-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center">
                  <Building2 size={18} />
                </div>
                <h2 className="text-lg font-bold">Affiliation Sportive</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClasses}>Club Actuel</label>
                  {!isOtherClub ? (
                    <select
                      value={predefinedClubs.includes(formData.club) ? formData.club : ''}
                      onChange={e => {
                        if (e.target.value === 'Autre') setIsOtherClub(true);
                        else setFormData({ ...formData, club: e.target.value });
                      }}
                      className={inputClasses}
                    >
                      <option value="">Sélectionner...</option>
                      {predefinedClubs.map(c => <option key={c} value={c}>{c}</option>)}
                      <option value="Autre">Autre / Nouveau...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={formData.club}
                        onChange={e => setFormData({ ...formData, club: e.target.value })}
                        className={inputClasses}
                        placeholder="Nom du club..."
                      />
                      <button onClick={() => setIsOtherClub(false)} className="px-3 bg-slate-200 rounded-xl text-slate-600">X</button>
                    </div>
                  )}
                </div>
                <div>
                  <label className={labelClasses}>Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as LicenseCategory })}
                    className={inputClasses}
                  >
                    {Object.values(LicenseCategory).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClasses}>Type de Pratique</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as LicenseType })}
                    className={inputClasses}
                  >
                    {Object.values(LicenseType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3">
                <Info size={20} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  En enregistrant cette licence, vous certifiez que le licencié est apte à la pratique du surf et que son club est à jour de ses cotisations fédérales.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};