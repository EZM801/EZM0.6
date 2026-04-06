import { z } from 'zod';

export const moveSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'completed', 'cancelled']),
  moveType: z.enum(['residential', 'commercial', 'office']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  fromAddressId: z.string().optional(),
  toAddressId: z.string().optional(),
  visibility: z.enum(['private', 'public']).default('private'),
});

export const moveCollaboratorSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(['viewer', 'editor', 'admin']).default('viewer'),
});

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
  country: z.string().min(1, 'Country is required'),
});

export const roomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  width: z.number().min(1, 'Width must be greater than 0'),
  length: z.number().min(1, 'Length must be greater than 0'),
  height: z.number().min(1, 'Height must be greater than 0'),
});

export const itemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional().nullable(),
  weight: z.number().nullable(),
  isFragile: z.boolean().default(false),
  specialInstructions: z.string().optional().nullable(),
  qrCode: z.string().optional().nullable(),
  image: z.object({
    url: z.string(),
    description: z.string().optional().nullable(),
    mimeType: z.string().optional(),
    size: z.number().optional(),
    isPrimary: z.boolean().optional(),
  }).optional().nullable(),
});

export const itemListSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  moveId: z.string().min(1, 'Move ID is required'),
});

export const supplySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  moveId: z.string().min(1, 'Move ID is required'),
}); 