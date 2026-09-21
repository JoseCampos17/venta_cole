'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutSchema, CheckoutFormValues } from '@/lib/validation/checkout.schema';
import { useCart } from '@/features/cart/CartContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CartSummary } from '@/components/cart/CartSummary';
import { useRouter } from 'next/navigation';
import {
  Banknote,
  Smartphone,
  Calendar,
  Clock,
  MapPin,
  Send,
  School,
  Home,
  CheckCircle2,
} from 'lucide-react';

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
    resolver: zodResolver(checkoutSchema) as any,
    defaultValues: {
      customerType: 'colegio',
      paymentMethod: 'cash',
      deliveryDate: 'Hoy',
      deliveryTime: 'Receso',
      customerClassroom: '',
      notes: '',
    },
  });

  const customerType = watch('customerType');
  const selectedPayment = watch('paymentMethod');
  const selectedDeliveryTime = watch('deliveryTime');

  // Adjust defaults when toggling between school and external
  useEffect(() => {
    if (customerType === 'externo') {
      setValue('deliveryTime', 'Fuera del colegio (Coordinar por WhatsApp)');
      if (!watch('customerClassroom')) {
        setValue('customerClassroom', 'Cliente externo');
      }
    } else {
      if (selectedDeliveryTime?.includes('Fuera del colegio')) {
        setValue('deliveryTime', 'Receso');
      }
      if (watch('customerClassroom') === 'Cliente externo') {
        setValue('customerClassroom', '');
      }
    }
  }, [customerType, setValue]);

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
          customerClassroom:
            values.customerType === 'externo'
              ? values.customerClassroom || 'Cliente externo (Fuera del colegio)'
              : values.customerClassroom,
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

      {/* Customer Type Selector */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-3">
        <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
          ¿Dónde deseas tu entrega?
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('customerType', 'colegio')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
              customerType === 'colegio'
                ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                : 'border-slate-200 hover:border-brand-200 bg-white'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                customerType === 'colegio' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                En el colegio
                {customerType === 'colegio' && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600 inline" />
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Entrega a la entrada, receso o salida
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setValue('customerType', 'externo')}
            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 ${
              customerType === 'externo'
                ? 'border-gold-500 bg-gold-50/60 shadow-xs'
                : 'border-slate-200 hover:border-gold-200 bg-white'
            }`}
          >
            <div
              className={`p-2.5 rounded-xl ${
                customerType === 'externo' ? 'bg-gold-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                Cliente externo / Fuera del colegio
                {customerType === 'externo' && (
                  <CheckCircle2 className="w-4 h-4 text-gold-600 inline" />
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Entrega coordinada por WhatsApp
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <span>👤</span> Tus datos de contacto
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
            helperText="Para confirmar y avisarte de tu entrega"
            error={errors.customerWhatsapp?.message}
            {...register('customerWhatsapp')}
          />

          {customerType === 'colegio' ? (
            <Input
              label="Tu Salón / Grado escolar"
              placeholder="Ej: 10B, 9A, Profesores..."
              error={errors.customerClassroom?.message}
              {...register('customerClassroom')}
            />
          ) : (
            <Input
              label="Dirección o Punto de encuentro"
              placeholder="Ej: Barrio Centro, Cra 5 # 10-20..."
              helperText="O indica dónde te queda más fácil recibir"
              error={errors.customerClassroom?.message}
              {...register('customerClassroom')}
            />
          )}
        </div>
      </div>

      {/* Delivery details */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <span>{customerType === 'colegio' ? '🎒' : '📦'}</span>{' '}
          {customerType === 'colegio' ? 'Horario de entrega escolar' : 'Detalles de la entrega'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" /> ¿Qué día lo quieres?
            </label>
            <select
              className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 font-medium"
              {...register('deliveryDate')}
            >
              <option value="Hoy">Hoy</option>
              <option value="Mañana">Mañana</option>
              <option value="Esta semana">Esta semana</option>
              <option value="A coordinar">A coordinar con el vendedor</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-500" /> Momento de entrega
            </label>

            {customerType === 'colegio' ? (
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 font-medium"
                {...register('deliveryTime')}
              >
                <option value="Entrada">🌅 Entrada al colegio</option>
                <option value="Receso">🥪 Receso escolar</option>
                <option value="Salida">🎒 Salida del colegio</option>
              </select>
            ) : (
              <select
                className="w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm bg-white text-slate-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 font-medium"
                {...register('deliveryTime')}
              >
                <option value="Fuera del colegio (Coordinar por WhatsApp)">
                  📲 Coordinar por WhatsApp
                </option>
                <option value="Mañana (Fuera del colegio)">☀️ Mañana</option>
                <option value="Tarde (Fuera del colegio)">🌇 Tarde</option>
              </select>
            )}
          </div>
        </div>

        <Input
          label="Comentarios u observaciones adicionales (opcional)"
          placeholder={
            customerType === 'colegio'
              ? 'Ej: Entregarme en el pasillo o frente a la cafetería'
              : 'Ej: Llamar antes de llevar o entregar a partir de las 3pm'
          }
          {...register('notes')}
        />
      </div>

      {/* Payment method selector */}
      <div className="bg-white rounded-3xl p-5 border border-brand-100 shadow-sm space-y-3">
        <h3 className="font-extrabold text-slate-900 text-base">
          💳 Método de pago (al recibir)
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setValue('paymentMethod', 'cash')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selectedPayment === 'cash'
                ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                : 'border-slate-200 hover:border-brand-200'
            }`}
          >
            <Banknote className="w-6 h-6 text-emerald-600 mb-1.5" />
            <div className="font-bold text-sm text-slate-900">Efectivo</div>
            <div className="text-[11px] text-slate-500">Pagas al momento de recibir</div>
          </button>

          <button
            type="button"
            onClick={() => setValue('paymentMethod', 'nequi')}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selectedPayment === 'nequi'
                ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                : 'border-slate-200 hover:border-brand-200'
            }`}
          >
            <Smartphone className="w-6 h-6 text-gold-500 mb-1.5" />
            <div className="font-bold text-sm text-slate-900">Nequi</div>
            <div className="text-[11px] text-slate-500">Transferencia al recibir</div>
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
