import { z } from 'zod';

export const licenseSchema = z.object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
    nationality: z.string().min(1, "La nationalité est requise"),
    address: z.string().min(1, "L'adresse est requise"),
    phone: z.string().min(1, "Le téléphone est requis"),
    email: z.string().email("Email invalide").or(z.literal("")).or(z.null()).optional(),
    club: z.string().min(1, "Le club est requis"),
    category: z.enum(['OPEN', 'JUNIOR', 'CADET', 'MINIME', 'BENJAMIN', 'ONDINE OPEN', 'ONDINE U16']),
    type: z.enum(['Compétition', 'Ligue Pro', 'Loisir']),
    issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
    expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
    photoUrl: z.string().optional(),
});

export const updateLicenseSchema = licenseSchema.partial();

export const statusSchema = z.object({
    status: z.enum(['VALIDE', 'EXPIRÉ', 'DÉSACTIVÉ'])
});
