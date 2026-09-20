import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(5, 'La descripción debe tener al menos 5 caracteres'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  salePrice: z.number().min(0, 'El precio de venta no puede ser negativo'),
  costPrice: z.number().min(0, 'El costo no puede ser negativo'),
  stock: z.number().int('El stock debe ser un entero').min(0, 'El stock no puede ser negativo'),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean(),
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
