export interface InstitutionAffiliation {
  id: string;
  name: string;
  logoUrl?: string;
}

export interface EntityConfig {
  isSetup: boolean;
  entityName: string | null;
  entityAcronym?: string | null;
  entityCountry?: string | null;
  entityFlag?: string | null;
  entityLogo?: string | null;
  entityAddress?: string | null;
  entityPhone?: string | null;
  entityEmail?: string | null;
  entityAffiliations?: string | null;
}

export interface SetupPayload {
  entityName: string;
  entityAcronym?: string;
  entityCountry?: string;
  entityFlag?: string;
  entityLogo?: string;
  entityAddress?: string;
  entityPhone?: string;
  entityEmail?: string;
  adminPassword?: string;
  entityAffiliations?: string;
}

const LOCAL_CONFIG_KEY = 'fss_entity_config';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const getStoredConfig = (): Partial<EntityConfig> => {
  try {
    const raw = localStorage.getItem(LOCAL_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveStoredConfig = (updates: Partial<EntityConfig>): void => {
  try {
    const current = getStoredConfig();
    const merged = { ...current, ...updates };
    localStorage.setItem(LOCAL_CONFIG_KEY, JSON.stringify(merged));
  } catch {}
};

const notifyConfigChanged = (config?: Partial<EntityConfig>): void => {
  try {
    window.dispatchEvent(new CustomEvent('fss_entity_config_changed', { detail: config }));
  } catch {}
};

export const SetupService = {
  getStatus: async (): Promise<EntityConfig> => {
    const local = getStoredConfig();
    let serverConfig: Partial<EntityConfig> = {};

    try {
      const res = await fetch('/api/setup/status');
      if (res.ok) {
        serverConfig = await res.json();
      }
    } catch (e) {
      console.warn('API getStatus network error, using local storage cache:', e);
    }

    // Merge logic: user saved config (local) takes precedence for custom identity values
    const entityName = local.entityName || serverConfig.entityName || 'Licences Manager';
    const entityAcronym = local.entityAcronym || serverConfig.entityAcronym || 'FSS';
    const entityCountry = local.entityCountry || serverConfig.entityCountry || 'SN';
    const entityFlag = local.entityFlag !== undefined ? local.entityFlag : (serverConfig.entityFlag ?? null);
    const entityLogo = local.entityLogo !== undefined ? local.entityLogo : (serverConfig.entityLogo ?? null);
    const entityAddress = local.entityAddress !== undefined ? local.entityAddress : (serverConfig.entityAddress ?? null);
    const entityPhone = local.entityPhone !== undefined ? local.entityPhone : (serverConfig.entityPhone ?? null);
    const entityEmail = local.entityEmail !== undefined ? local.entityEmail : (serverConfig.entityEmail ?? null);
    const entityAffiliations = local.entityAffiliations !== undefined ? local.entityAffiliations : (serverConfig.entityAffiliations ?? '');

    const merged: EntityConfig = {
      isSetup: serverConfig.isSetup ?? local.isSetup ?? true,
      entityName,
      entityAcronym,
      entityCountry,
      entityFlag,
      entityLogo,
      entityAddress,
      entityPhone,
      entityEmail,
      entityAffiliations,
    };

    saveStoredConfig(merged);
    return merged;
  },

  getActivationStatus: async (): Promise<{ activated: boolean; valid: boolean; reason?: string }> => {
    try {
      const res = await fetch('/api/activation/status');
      if (!res.ok) {
        return { activated: true, valid: true };
      }
      return await res.json();
    } catch {
      return { activated: true, valid: true };
    }
  },

  uploadLogo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/setup/logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Disallow hardcoded mock logo response
        if (data.url && data.url !== '/logo.png') {
          return data.url;
        }
      }
    } catch (e) {
      console.warn('API upload logo failed, using client storage fallback:', e);
    }

    // Client-side fallback to base64 Data URL (ensures uploaded image is NEVER lost)
    return await fileToDataUrl(file);
  },

  uploadFlag: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('flag', file);

      const res = await fetch('/api/setup/flag', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url && data.url !== '/logo.png') {
          return data.url;
        }
      }
    } catch (e) {
      console.warn('API upload flag failed, using client storage fallback:', e);
    }

    return await fileToDataUrl(file);
  },

  uploadInstitutionLogo: async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const res = await fetch('/api/setup/institution-logo', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        // Crucial: Reject any dummy '/logo.png' returned from mock servers
        if (data.url && data.url !== '/logo.png') {
          return data.url;
        }
      }
    } catch (e) {
      console.warn('API upload institution logo failed, using client storage fallback:', e);
    }

    // Always convert to data URL so the user's custom uploaded institution logo (e.g. CNOSS) is displayed!
    return await fileToDataUrl(file);
  },

  initialize: async (payload: SetupPayload): Promise<{ success: boolean }> => {
    // Save to local storage cache immediately
    saveStoredConfig({ ...payload, isSetup: true });
    notifyConfigChanged({ ...payload, isSetup: true });

    let serverRes = { success: true };
    try {
      const res = await fetch('/api/setup/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        serverRes = await res.json().catch(() => ({ success: true }));
      }
    } catch (e) {
      console.warn('Server initialize warning:', e);
    }

    // Auto-activate license upon first setup
    try {
      await fetch('/api/activation/activate', { method: 'POST' });
    } catch (e) {
      console.warn('Activation call error:', e);
    }

    return serverRes;
  },

  getFullConfig: async (): Promise<Record<string, string>> => {
    const local = getStoredConfig();
    let serverConfig: Record<string, string> = {};

    try {
      const res = await fetch('/api/setup/config', { credentials: 'include' });
      if (res.ok) {
        serverConfig = await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch full config from server:', e);
    }

    const merged: Record<string, string> = { ...serverConfig };
    // Overlay local values
    for (const [k, v] of Object.entries(local)) {
      if (v !== undefined && v !== null) {
        merged[k] = String(v);
      }
    }

    return merged;
  },

  updateConfig: async (payload: Partial<SetupPayload>): Promise<boolean> => {
    // 1. Immediately store in localStorage for instant persistent feedback
    saveStoredConfig(payload);
    notifyConfigChanged(payload);

    // 2. Persist to server
    try {
      const res = await fetch('/api/setup/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.warn('Server config update response error:', err);
      }
    } catch (err) {
      console.warn('Server network error updating config, saved locally in browser:', err);
    }

    return true;
  },

  downloadBackup: async (): Promise<void> => {
    const res = await fetch('/api/backup/download', { credentials: 'include' });
    if (!res.ok) throw new Error('Erreur lors du téléchargement de la sauvegarde');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licences-backup-${new Date().toISOString().slice(0, 10)}.db`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  restoreBackup: async (file: File): Promise<{ success: boolean; message?: string }> => {
    const formData = new FormData();
    formData.append('backup', file);

    const res = await fetch('/api/backup/restore', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur lors de la restauration de la sauvegarde');
    }

    return await res.json();
  },
};
