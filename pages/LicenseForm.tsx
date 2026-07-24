import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { LicenseCategory, LicenseType, DocumentType } from '../types';
import { PREDEFINED_CLUBS } from '../shared/clubs.js';
import {
  ArrowLeft, Camera, Save, User, MapPin,
  Phone, Mail, Building2, Calendar, ShieldCheck,
  Upload, Info, FileText, X, CheckCircle2, AlertCircle
} from 'lucide-react';

export const LicenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  const [availableClubs, setAvailableClubs] = useState<string[]>(PREDEFINED_CLUBS);

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
    documentUrl: '',
    documentType: '' as any,
  });

  useEffect(() => {
    const init = async () => {
      const isAuth = await LicenseService.isAuthenticated();
      if (!isAuth) {
        navigate('/login');
        return;
      }

      let clubs = PREDEFINED_CLUBS;
      try {
        clubs = await LicenseService.getClubs();
        setAvailableClubs(clubs);
      } catch (error) {
        console.error('Erreur lors du chargement des clubs :', error);
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
            documentUrl: data.documentUrl || '',
            documentType: data.documentType || '' as any,
          });
          setPhotoPreview(data.photoUrl);
          if (data.documentUrl) {
            setDocumentPreview(data.documentUrl);
            setDocumentFileName('Document existant');
          }
          if (data.club && !clubs.includes(data.club)) {
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

  const compressImage = (file: File, maxDim: number, quality: number): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height *= maxDim / width;
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width *= maxDim / height;
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Erreur lors de la compression de l'image"));
              }
            }, 'image/jpeg', quality);
          } else {
            reject(new Error("Impossible d'obtenir le contexte canvas"));
          }
        };
        img.onerror = () => reject(new Error("Erreur de chargement de l'image"));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Erreur de lecture du fichier"));
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert("Veuillez sélectionner une image valide.");
        return;
      }

      try {
        const compressedFile = await compressImage(file, 800, 0.8);
        setPhotoFile(compressedFile);
        setPhotoPreview(URL.createObjectURL(compressedFile));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDocumentChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Format non supporté. Formats acceptés : JPEG, PNG, WebP, PDF');
        return;
      }
      
      // We don't check file.size here if it's an image, because we're going to compress it anyway.
      // But for PDF, we still need to keep an eye on it or alert if it's too big since we can't compress it.
      if (file.type === 'application/pdf' && file.size > 5 * 1024 * 1024) {
        alert('Le fichier PDF est trop volumineux. Taille max : 5 Mo');
        return;
      }

      try {
        let fileToUpload = file;
        
        if (file.type.startsWith('image/')) {
          // Compress documents to 1600px max (better resolution for text readability)
          fileToUpload = await compressImage(file, 1600, 0.75);
          setDocumentPreview(URL.createObjectURL(fileToUpload));
        } else {
          setDocumentPreview(null); // PDF — no image preview
        }

        setDocumentFile(fileToUpload);
        setDocumentFileName(fileToUpload.name);
      } catch (err: any) {
        alert("Erreur lors du traitement du document : " + err.message);
      }
    }
  };

  const removeDocument = () => {
    setDocumentFile(null);
    setDocumentPreview(null);
    setDocumentFileName(null);
    setFormData({ ...formData, documentUrl: '', documentType: '' as any });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let photoUrl = formData.photoUrl;
      if (photoFile) {
        photoUrl = await LicenseService.uploadPhoto(photoFile);
      }

      let documentUrl = formData.documentUrl;
      if (documentFile) {
        documentUrl = await LicenseService.uploadDocument(documentFile);
      }

      const finalData = { ...formData, photoUrl, documentUrl };
      // Remove empty documentType if not set
      if (!finalData.documentType) {
        delete (finalData as any).documentType;
        delete (finalData as any).documentUrl;
      }

      if (id) {
        await LicenseService.update(id, finalData);
      } else {
        await LicenseService.create(finalData);
      }
      navigate('/admin');
    } catch (err: any) {
      let msg = err.message || "Une erreur est survenue";
      if (err.details) {
        if (typeof err.details === 'string') {
          msg += `\n\nErreur serveur:\n${err.details}`;
        } else {
          try {
            const details = Object.entries(err.details)
              .map(([field, info]: [string, any]) => `${field}: ${info._errors?.join(', ')}`)
              .join('\n');
            msg += `\n\nDétails techniques:\n${details}`;
          } catch (e) {
            msg += `\n\nDétails:\n${JSON.stringify(err.details)}`;
          }
        }
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

            {/* Document Upload Section */}
            <div className="premium-card p-6 space-y-4">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-600" />
                Document d'Identité
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed -mt-2">
                Téléchargez une copie d'un document officiel : passeport, carte d'identité ou extrait de naissance.
              </p>

              <div>
                <label className={labelClasses}>Type de Document</label>
                <select
                  value={formData.documentType || ''}
                  onChange={e => setFormData({ ...formData, documentType: e.target.value as DocumentType })}
                  className={inputClasses}
                >
                  <option value="">Sélectionner...</option>
                  {Object.values(DocumentType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Upload Zone */}
              {!documentFileName ? (
                <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleDocumentChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-blue-500 transition-colors">
                    <Upload size={28} strokeWidth={1.5} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Choisir un fichier</span>
                    <span className="text-[9px] text-slate-400">JPEG, PNG, WebP ou PDF — Max 5 Mo</span>
                  </div>
                </label>
              ) : (
                <div className="relative bg-slate-50 border border-slate-200 rounded-2xl p-4 animate-fade-in">
                  <button
                    type="button"
                    onClick={removeDocument}
                    className="absolute top-2 right-2 p-1 bg-white border border-slate-200 rounded-full hover:bg-red-50 hover:border-red-200 hover:text-red-500 text-slate-400 transition-all shadow-sm"
                  >
                    <X size={14} />
                  </button>
                  <div className="flex items-center gap-3">
                    {documentPreview ? (
                      <img src={documentPreview} alt="Aperçu" className="h-16 w-16 rounded-xl object-cover border border-slate-200 shadow-sm" />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <FileText size={24} className="text-red-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-700 truncate">{documentFileName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Fichier prêt</span>
                        {formData.documentUrl && documentFileName === 'Document existant' && (
                           <a href={formData.documentUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-[10px] text-blue-600 hover:text-blue-800 underline font-medium">
                             Voir l'original
                           </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formData.documentType && !documentFileName && !formData.documentUrl && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <AlertCircle size={14} className="text-amber-600 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 font-medium">N'oubliez pas de joindre le document sélectionné.</p>
                </div>
              )}
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
                      value={availableClubs.includes(formData.club) ? formData.club : ''}
                      onChange={e => {
                        if (e.target.value === 'Autre') setIsOtherClub(true);
                        else setFormData({ ...formData, club: e.target.value });
                      }}
                      className={inputClasses}
                    >
                      <option value="">Sélectionner...</option>
                      {availableClubs.map(c => <option key={c} value={c}>{c}</option>)}
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
