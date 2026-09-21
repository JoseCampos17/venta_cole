import { z } from 'zod';

export const checkoutSchema = z.object({
  customerType: z.enum(['colegio', 'externo']),
  customerName: z.string().min(2, 'Por favor ingresa tu nombre (mínimo 2 letras)'),
  customerWhatsapp: z
    .string()
    .min(7, 'Ingresa un número de WhatsApp válido')
    .regex(/^[0-9+\s()-]+$/, 'Número de WhatsApp inválido'),
  customerClassroom: z.string().min(1, 'Indica tu salón o punto de entrega'),
  deliveryDate: z.string().min(1, 'Selecciona el día de entrega'),
  deliveryTime: z.string().min(1, 'Selecciona el momento de entrega'),
  paymentMethod: z.enum(['cash', 'nequi']),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
