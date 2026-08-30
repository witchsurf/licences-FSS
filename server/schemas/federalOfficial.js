import { z } from 'zod';

const title = z.enum(['Président', 'Vice-président', 'Vice-présidente', 'Trésorier', 'Secrétaire général', 'Coach', 'Directeur technique national']);
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide');

export const federalOfficialSchema = z.object({
  title,
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  birthDate: date,
  nationality: z.string().min(1, 'La nationalité est requise'),
  address: z.string().min(1, "L'adresse est requise"),
  phone: z.string().min(1, 'Le téléphone est requis'),
  email: z.string().email('Email invalide'),
  issueDate: date,
  expirationDate: date,
  photoUrl: z.string().optional(),
});

export const updateFederalOfficialSchema = federalOfficialSchema.partial();
