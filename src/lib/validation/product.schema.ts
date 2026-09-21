import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(3, 'La descripción debe tener al menos 3 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  salePrice: z.coerce.number().min(0, 'El precio de venta no puede ser negativo'),
  costPrice: z.coerce.number().min(0, 'El costo no puede ser negativo'),
  stock: z.coerce.number().int('El stock debe ser un número entero').min(0, 'El stock no puede ser negativo'),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export type ProductFormValues = {
  name: string;
  description: string;
  categoryId: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  imageUrl?: string | null;
  isActive: boolean;
};
