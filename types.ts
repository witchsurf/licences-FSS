export enum LicenseCategory {
  OPEN = 'OPEN',
  JUNIOR = 'JUNIOR',
  CADET = 'CADET',
  MINIME = 'MINIME',
  BENJAMIN = 'BENJAMIN',
  ONDINE_OPEN = 'ONDINE OPEN',
  ONDINE_U16 = 'ONDINE U16'
}

export enum LicenseType {
  COMPETITION = 'Compétition',
  LIGUE_PRO = 'Ligue Pro',
  LOISIR = 'Loisir'
}

export enum LicenseStatus {
  VALID = 'VALIDE',
  EXPIRED = 'EXPIRÉ',
  DISABLED = 'DÉSACTIVÉ'
}

export enum DocumentType {
  PASSPORT = 'Passeport',
  CARTE_IDENTITE = "Carte d'identité",
  EXTRAIT_NAISSANCE = 'Extrait de naissance'
}

export interface License {
  id: string; // The specific FSS-YYYY-XXXXXX format
  firstName: string;
  lastName: string;
  birthDate: string;
  nationality: string;
  address: string;
  phone: string;
  email: string;
  club: string;
  category: LicenseCategory;
  type: LicenseType;
  issueDate: string;
  expirationDate: string;
  photoUrl: string;
  documentUrl?: string;
  documentType?: DocumentType;
  status: LicenseStatus;
  createdAt: number;
}

export interface UserSession {
  isAuthenticated: boolean;
}