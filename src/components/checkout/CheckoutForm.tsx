'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormValues } from '@/lib/validation/checkout.schema';
import { useCart } from '@/features/cart/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CartSummary } from '@/components/cart/CartSummary';
import { useRouter } from 'next/navigation';
import { Banknote, Smartphone, Calendar, Clock, MapPin, Send } from 'lucide-react';

export function CheckoutForm() {
  const { items, totalAmount, totalItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: 'cash',
      deliveryDate: 'Hoy en el descanso',
      deliveryTime: 'Primer descanso (10:00 AM)',
    },
  });

  const selectedPayment = watch('paymentMethod');

  const onSubmit = async (values: CheckoutFormValues) => {
    if (items.length === 0) {
      setServerError('Tu carrito está vacío');
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: values.customerName,
          customerWhatsapp: values.customerWhatsapp,
          customerClassroom: values.customerClassroom,
          deliveryDate: values.deliveryDate,
          deliveryTime: values.deliveryTime,
          paymentMethod: values.paymentMethod,
          notes: values.notes,
          items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || 'No se pudo registrar el pedido');
        return;
      }

      clearCart();
      router.push(`/checkout/confirmacion?orderId=${data.id}`);
    } catch {
      setServerError('Error al comunicarse con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {serverError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
          {serverError}
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
          <span>👤</span> Tus datos personales
        </h3>

        <Input
          label="Tu Nombre Completo"
          placeholder="Ej: Sofía Gómez"
          error={errors.customerName?.message}
          {...register('customerName')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Número de WhatsApp"
            placeholder="Ej: 3101234567"
            type="tel"
            helperText="Para avisarte cuando esté listo tu pedido"
            error={errors.customerWhatsapp?.message}
            {...register('customerWhatsapp')}
          />

          <Input
            label="Tu Salón / Grado"
            placeholder="Ej: 10B / 9A"
            error={errors.customerClassroom?.message}
            {...register('customerClassroom')}
          />
        </div>
      </div>

      {/* Delivery details */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-gray-900 text-base flex items-center gap-2">
          <span>🏫</span> Entrega en el colegio
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" /> ¿Qué día lo quieres?
            </label>
            <select
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              {...register('deliveryDate')}
            >
              <option value="Hoy en el descanso">Hoy en el descanso</option>
              <option value="Mañana en el colegio">Mañana en el colegio</option>
              <option value="Esta semana">Esta semana</option>
              <option value="A la salida">A la salida del colegio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" /> Hora / Descanso
            </label>
            <select
              className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              {...register('deliveryTime')}
            >
              <option value="Primer descanso (10:00 AM)">Primer descanso (10:00 AM)</option>
              <option value="Segundo descanso (12:00 PM)">Segundo descanso (12:00 PM)</option>
              <option value="A la salida (2:00 PM)">A la salida (2:00 PM)</option>
              <option value="En el cambio de clase">En el cambio de clase</option>
            </select>
          </div>
        </div>

        <Input
          label="Comentarios u observaciones (opcional)"
          placeholder="Ej: Entregar a la hora de almuerzo frente al salón 9B"
          {...register('notes')}
        />
      </div>

      {/* Payment method selector */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-3">
        <h3 className="font-extrabold text-gray-900 text-base">
          💳 Método de pago (al recibir)
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('paymentMethod', 'cash')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selectedPayment === 'cash'
                ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                : 'border-gray-200 hover:border-brand-200'
            }`}
          >
            <Banknote className="w-6 h-6 text-emerald-600 mb-1.5" />
            <div className="font-bold text-sm text-gray-900">Efectivo</div>
            <div className="text-[11px] text-gray-500">Pagas en el colegio</div>
          </button>

          <button
            type="button"
            onClick={() => setValue('paymentMethod', 'nequi')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selectedPayment === 'nequi'
                ? 'border-brand-500 bg-brand-50/50 shadow-sm'
                : 'border-gray-200 hover:border-brand-200'
            }`}
          >
            <Smartphone className="w-6 h-6 text-gold-500 mb-1.5" />
            <div className="font-bold text-sm text-gray-900">Nequi</div>
            <div className="text-[11px] text-gray-500">Transferencia al recibir</div>
          </button>
        </div>
      </div>

      {/* Summary */}
      <CartSummary totalAmount={totalAmount} totalItems={totalItems} />

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        className="w-full shadow-lg shadow-brand-200 text-base font-bold py-4"
      >
        <Send className="w-5 h-5 mr-1" /> Confirmar encargo ({totalItems} artículos)
      </Button>
    </form>
  );
}
