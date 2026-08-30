export type LicenceCategory = 'CADRE' | 'COMPETITION' | 'LOISIR' | 'LIGUE_PRO';

export type PosteCadre =
  | 'PRÉSIDENT'
  | 'VICE-PRÉSIDENT'
  | 'VICE-PRÉSIDENTE'
  | 'SECRÉTAIRE GÉNÉRAL'
  | 'TRÉSORIER'
  | 'TRÉSORIER ADJOINT'
  | 'COACH'
  | 'DIRECTEUR TECHNIQUE NATIONAL'
  | string;

export type DisciplineSurf =
  | 'Shortboard'
  | 'Longboard'
  | 'Bodyboard'
  | 'Stand Up Paddle (SUP)'
  | 'Groms / Junior'
  | 'Open';

export type CategorieAge =
  | 'Poussin (-10 ans)'
  | 'Benjamin (-12 ans)'
  | 'Minime (-14 ans)'
  | 'Cadet (-16 ans)'
  | 'Junior (-18 ans)'
  | 'Open / Senior'
  | 'Master (+35 ans)'
  | 'Grand Master (+40 ans)';

export interface BaseLicence {
  id: string;
  category: LicenceCategory;
  prenom: string;
  nom: string;
  photoUrl: string;
  numeroLicence: string;
  saison: string;
  mandat?: string;
  dateEmission: string;
  dateExpiration: string;
  telephone?: string;
  email?: string;
  nationalite: string;
  institution: string;
  statut: 'ACTIF' | 'EN ATTENTE' | 'ARCHIVÉ';
  qrCustomUrl?: string;
}

// 1. Cadre Fédéral (Administration)
export interface CadreLicence extends BaseLicence {
  category: 'CADRE';
  poste: PosteCadre;
  sousTitre?: string;
  commission?: string;
}

// 2. Licence Compétition
export interface CompetitionLicence extends BaseLicence {
  category: 'COMPETITION';
  club: string;
  discipline: DisciplineSurf;
  categorieAge: CategorieAge;
  classementNational?: number;
  certificatMedicalValide: boolean;
  surfeurIdISA?: string;
  pointsFSS?: number;
}

// 3. Licence Loisir
export interface LoisirLicence extends BaseLicence {
  category: 'LOISIR';
  club: string;
  niveauPratique: 'Débutant' | 'Intermédiaire' | 'Confirmé' | 'Expert';
  numeroAssurance: string;
  contactUrgenceNom?: string;
  contactUrgenceTel?: string;
  groupeSanguin?: string;
}

// 4. Licence Ligue Pro
export interface LigueProLicence extends BaseLicence {
  category: 'LIGUE_PRO';
  club: string;
  discipline: DisciplineSurf;
  rangWSL?: number;
  sponsorsPrincipaux?: string;
  divisionPro: 'World Qualifying Series (QS)' | 'Championship Tour (CT)' | 'Ligue Pro Africaine' | 'Élite Sénégal';
  statutAthletique: 'Professionnel' | 'Semi-Professionnel' | 'Espoir Pro';
}

export type AnyLicence =
  | CadreLicence
  | CompetitionLicence
  | LoisirLicence
  | LigueProLicence;

export type CadreFederal = CadreLicence;

export interface FederationSettings {
  nomFederation: string;
  nomSousTitre: string;
  siteWebUrl: string;
  organigrammeUrl: string;
  verificationLicenceUrl: string;
  contactEmail: string;
  contactTelephone: string;
  adresse: string;
  nomSignataire: string;
  titreSignataire: string;
  qrDestinationType: 'organigramme' | 'site_web' | 'verification' | 'vcard' | 'personnalise';
  qrCustomGlobalUrl: string;
  showOlympicLogo: boolean;
  showWslLogo: boolean;
  showIsaLogo: boolean;
  formatBadge: 'standard_cr80' | 'badge_evenementiel';
}
