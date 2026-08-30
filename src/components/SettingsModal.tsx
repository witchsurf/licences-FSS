import React, { useState } from 'react';
import { FederationSettings } from '../types';
import { Settings, X, Globe, Link2, Shield, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FederationSettings;
  onSave: (settings: FederationSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSave,
}) => {
  const [formData, setFormData] = useState<FederationSettings>(settings);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* En-tête Modal */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-wide font-sans">
                Paramètres Fédéraux & QR Code
              </h2>
              <p className="text-xs text-slate-400">
                Configuration des liens du Verso (Site Web, Organigramme) et signatures
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

        {/* Formulaire de configuration */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Alerte explicative */}
          <div className="flex items-start gap-3 bg-blue-950/40 border border-blue-800/60 p-3.5 rounded-xl text-blue-200 text-xs">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <p>
              Les liens du QR code sont actuellement configurables et s'adapteront automatiquement lorsque les URL finales de l'organigramme et du site web officiel seront fournies.
            </p>
          </div>

          {/* Section 1 : Cible du QR Code du Verso */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-fss-blue" />
              <span>Comportement du QR Code Verso</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type de destination par défaut
              </label>
              <select
                value={formData.qrDestinationType}
                onChange={(e) =>
                  setFormData({ ...formData, qrDestinationType: e.target.value as any })
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
              >
                <option value="organigramme">Lien Organigramme Fédéral (Recommandé)</option>
                <option value="site_web">Site Web Officiel de la Fédération</option>
                <option value="vcard">Fiche Contact Numérique (vCard automatique)</option>
                <option value="personnalise">URL Globale Personnalisée</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL de l'Organigramme Officiel
              </label>
              <input
                type="url"
                value={formData.organigrammeUrl}
                onChange={(e) => setFormData({ ...formData, organigrammeUrl: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue font-mono"
                placeholder="https://senegalsurf.sn/organigramme"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                URL du Site Web Officiel
              </label>
              <input
                type="url"
                value={formData.siteWebUrl}
                onChange={(e) => setFormData({ ...formData, siteWebUrl: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue font-mono"
                placeholder="https://senegalsurf.sn"
              />
            </div>
          </div>

          {/* Section 2 : Identité & Signataire Officiel */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Identité Fédérale & Signataire</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nom du Président / Signataire
                </label>
                <input
                  type="text"
                  value={formData.nomSignataire}
                  onChange={(e) => setFormData({ ...formData, nomSignataire: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Titre du Signataire
                </label>
                <input
                  type="text"
                  value={formData.titreSignataire}
                  onChange={(e) => setFormData({ ...formData, titreSignataire: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email de Contact
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Téléphone Officiel
                </label>
                <input
                  type="text"
                  value={formData.contactTelephone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactTelephone: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-fss-blue"
                />
              </div>
            </div>
          </div>

          {/* Section 3 : Logos Partenaires sur le Recto */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Logos Partenaires Visibles (Recto)
            </h3>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showOlympicLogo}
                  onChange={(e) =>
                    setFormData({ ...formData, showOlympicLogo: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-fss-blue focus:ring-fss-blue bg-slate-900 border-slate-700"
                />
                <span>Anneaux Olympiques</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showWslLogo}
                  onChange={(e) =>
                    setFormData({ ...formData, showWslLogo: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-fss-blue focus:ring-fss-blue bg-slate-900 border-slate-700"
                />
                <span>World Surf League (WSL)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.showIsaLogo}
                  onChange={(e) =>
                    setFormData({ ...formData, showIsaLogo: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-fss-blue focus:ring-fss-blue bg-slate-900 border-slate-700"
                />
                <span>ISA Surf</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Fermer
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 py-2 px-5 rounded-xl text-xs font-bold bg-fss-blue hover:bg-blue-600 text-white shadow-lg transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les paramètres</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
