import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Podaj imię i nazwisko'),
    email: z.string().email('Nieprawidłowy adres e-mail'),
    password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
    confirmPassword: z.string(),
    organizationName: z.string().min(2, 'Podaj nazwę organizacji'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są takie same',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Nieprawidłowy adres e-mail'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Hasła nie są takie same',
    path: ['confirmPassword'],
  });

export const locationSchema = z.object({
  name: z.string().min(2, 'Nazwa jest wymagana'),
  address: z.string().optional(),
  city: z.string().optional(),
  voivodeship: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  status: z.enum(['SIGNED', 'NEGOTIATION', 'INSTALLATION', 'REJECTED', 'FREE']),
  type: z.enum(['OSIEDLE', 'SKLEP', 'GALERIA', 'URZAD', 'PARKING', 'INNE']),
  description: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email('Nieprawidłowy e-mail').optional().or(z.literal('')),
  ownerName: z.string().optional(),
  roi: z.coerce.number().optional(),
  forecastPackages: z.coerce.number().int().optional(),
  deviceNumber: z.string().optional(),
  regionId: z.string().optional(),
  agentId: z.string().optional(),
  investorId: z.string().optional(),
  operatorId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
