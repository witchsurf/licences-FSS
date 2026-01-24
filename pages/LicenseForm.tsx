import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LicenseService } from '../services/licenseService';
import { LicenseCategory, LicenseType } from '../types';
import { Save, ArrowLeft, Upload } from 'lucide-react';

export const LicenseForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    nationality: 'Sénégalaise',
    address: '',
    phone: '',
    email: '',
    club: '',
    category: LicenseCategory.SENIOR,
    type: LicenseType.LOISIR,
    issueDate: new Date().toISOString().split('T')[0],
    expirationDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    photoUrl: '/logo.png', // Default placeholder
  });

  /* New Club List from User Request */
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

  /* State to manage if the selected club is "Other" */
  const [isOtherClub, setIsOtherClub] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      setLoading(true);
      LicenseService.getById(id).then((license) => {
        if (license) {
          setFormData({
            firstName: license.firstName,
            lastName: license.lastName,
            birthDate: license.birthDate,
            nationality: license.nationality,
            address: license.address,
            phone: license.phone,
            email: license.email,
            club: license.club,
            category: license.category,
            type: license.type,
            issueDate: license.issueDate,
            expirationDate: license.expirationDate,
            photoUrl: license.photoUrl,
          });
          setPhotoPreview(license.photoUrl);

          // Check if loaded club is in our list, otherwise it's custom
          if (license.club && !predefinedClubs.includes(license.club)) {
            setIsOtherClub(true);
          }
        } else {
          alert("Licence introuvable");
          navigate('/admin');
        }
        setLoading(false);
      });
    }
  }, [id, isEditMode, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Special handler for the Club dropdown
  const handleClubSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Autre') {
      setIsOtherClub(true);
      setFormData(prev => ({ ...prev, club: '' })); // Clear so they can type
    } else {
      setIsOtherClub(false);
      setFormData(prev => ({ ...prev, club: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Le fichier est trop volumineux (Max 2MB)");
        return;
      }

      setPhotoFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalPhotoUrl = formData.photoUrl;

      // Upload photo if a new file is selected
      if (photoFile) {
        finalPhotoUrl = await LicenseService.uploadPhoto(photoFile);
      }

      const submissionData = {
        ...formData,
        photoUrl: finalPhotoUrl
      };

      if (isEditMode && id) {
        await LicenseService.update(id, submissionData);
      } else {
        await LicenseService.create(submissionData);
      }
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert('Erreur lors de l\'enregistrement de la licence. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode && !formData.firstName) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Modifier la Licence' : 'Nouvelle Licence'}
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="h-32 w-32 bg-gray-100 rounded-full overflow-hidden mb-2 relative group border border-gray-200">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <Upload size={32} />
                </div>
              )}
            </div>
            <label className="cursor-pointer text-sm font-medium text-fss-green hover:underline">
              <span>{isEditMode ? 'Changer la photo' : 'Télécharger une photo'} (Max 2MB)</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
            <p className="text-xs text-gray-500 mt-1">Formats acceptés : JPG, PNG</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isEditMode && (
              <div className="md:col-span-2 bg-blue-50 p-3 rounded text-blue-800 text-sm border border-blue-100 mb-2">
                Modification de la licence <strong>{id}</strong>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Prénom</label>
              <input required name="firstName" type="text" value={formData.firstName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input required name="lastName" type="text" value={formData.lastName} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
              <input required name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nationalité</label>
              <input required name="nationality" type="text" value={formData.nationality} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Adresse / Ville</label>
              <input required name="address" type="text" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Téléphone</label>
              <input required name="phone" type="tel" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Club</label>

              {!isOtherClub ? (
                <select
                  value={predefinedClubs.includes(formData.club) ? formData.club : 'Autre'}
                  onChange={handleClubSelectChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border"
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
                    name="club"
                    value={formData.club}
                    onChange={handleInputChange}
                    placeholder="Entrez le nom du club..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOtherClub(false)}
                    className="mt-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 text-sm"
                  >
                    Annuler
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Catégorie</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border">
                {Object.values(LicenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select name="type" value={formData.type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-fss-green focus:ring-fss-green p-2 border">
                {Object.values(LicenseType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="bg-gray-50 p-4 rounded-md md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Délivrée le</label>
                <input type="date" name="issueDate" value={formData.issueDate} onChange={handleInputChange} className="mt-1 block w-full text-sm bg-transparent border-none p-0 focus:ring-0" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase">Expire le</label>
                <input type="date" name="expirationDate" value={formData.expirationDate} onChange={handleInputChange} className="mt-1 block w-full text-sm bg-transparent border-none p-0 focus:ring-0" />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`bg-fss-green text-white px-6 py-3 rounded-md font-bold shadow hover:bg-green-700 transition-colors flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={20} />
              {loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Enregistrer la Licence')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};