export interface CountryOption {
  code: string;
  name: string;
  flag: string; // Emoji
  flagEmoji?: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: 'GA', name: 'Gabon', flag: '🇬🇦' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: 'MA', name: 'Maroc', flag: '🇲🇦' },
  { code: 'PF', name: 'Tahiti / Polynésie', flag: '🇵🇫' },
  { code: 'CV', name: 'Cap-Vert', flag: '🇨🇻' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'BR', name: 'Brésil', flag: '🇧🇷' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸' },
  { code: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: 'MU', name: 'Maurice', flag: '🇲🇺' },
  { code: 'ZA', name: 'Afrique du Sud', flag: '🇿🇦' },
  { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'AU', name: 'Australie', flag: '🇦🇺' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
];

export function getCountryByCodeOrName(value?: string | null): CountryOption {
  if (!value) return COUNTRIES[0]; // Default Sénégal
  const normalized = value.trim().toUpperCase();
  const match = COUNTRIES.find(
    c => c.code.toUpperCase() === normalized || c.name.toUpperCase() === normalized
  );
  return match || { code: 'CUSTOM', name: value, flag: '🏳️' };
}
