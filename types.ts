export enum LicenseCategory {
  JUNIOR = 'Junior',
  SENIOR = 'Senior',
  PRO = 'Pro'
}

export enum LicenseType {
  COMPETITION = 'Compétition',
  LOISIR = 'Loisir'
}

export enum LicenseStatus {
  VALID = 'VALIDE',
  EXPIRED = 'EXPIRÉ',
  DISABLED = 'DÉSACTIVÉ'
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
  status: LicenseStatus;
  createdAt: number;
}

export interface UserSession {
  isAuthenticated: boolean;
}