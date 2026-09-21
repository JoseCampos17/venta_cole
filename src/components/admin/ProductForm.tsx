'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, ProductFormValues } from '@/lib/validation/product.schema';
import { Category } from '@/types/category';
import { Product } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { calcMargin, calcProfit, formatCurrency, formatPercentage } from '@/lib/utils/format';
import { UploadCloud, Image as ImageIcon, Trash2, Sparkles, Camera } from 'lucide-react';

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  onSubmit: (values: ProductFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      categoryId: initialData?.categoryId ?? categories[0]?.id ?? '',
      salePrice: initialData?.salePrice ?? 0,
      costPrice: initialData?.costPrice ?? 0,
      stock: initialData?.stock ?? 1,
      imageUrl: initialData?.imageUrl ?? '',
      isActive: initialData?.isActive ?? true,
    },
  });

  const salePrice = Number(watch('salePrice') || 0);
  const costPrice = Number(watch('costPrice') || 0);
  const profit = calcProfit(salePrice, costPrice);
  const margin = calcMargin(salePrice, costPrice);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
        setValue('imageUrl', data.url);
      } else {
        const err = await res.json();
        alert(err.error || 'Error al subir la imagen');
      }
    } catch {
      alert('Error de conexión al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Photo Uploader Dropzone */}
      <div className="space-y-2">
        <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <span>📸</span> Fotografía del producto
        </label>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {imageUrl ? (
          <div className="relative w-full aspect-video sm:aspect-[2/1] rounded-3xl overflow-hidden border-2 border-brand-200 bg-brand-50 flex items-center justify-center group shadow-sm">
            <img src={imageUrl} alt="Foto producto" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-white text-gray-800"
              >
                <Camera className="w-4 h-4 mr-1" /> Cambiar foto
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemoveImage}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Quitar
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-brand-300 hover:border-brand-500 bg-brand-50/40 hover:bg-brand-50/80 rounded-3xl p-6 text-center cursor-pointer transition-colors space-y-2"
          >
            {isUploading ? (
              <div className="py-4 space-y-2">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-brand-600 animate-pulse">Subiendo fotografía...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-500 mx-auto flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-800 block">
                    Toca aquí para seleccionar una foto
                  </span>
                  <span className="text-xs text-gray-500">
                    Desde tu galería o archivos de tu celular / computador
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <Input
        label="Nombre del producto"
        placeholder="Ej: Gloss Brillo Mágico"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Descripción corta
        </label>
        <textarea
          rows={3}
          placeholder="Describe el producto, color, tamaño, etc."
          className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          {...register('description')}
        />
        {errors.description?.message && (
          <p className="mt-1 text-xs text-red-600 font-medium">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Categoría
          </label>
          <select
            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm bg-white text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            {...register('categoryId')}
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId?.message && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.categoryId.message}
            </p>
          )}
        </div>

        <Input
          label="Stock / Cantidad disponible"
          type="number"
          min={0}
          error={errors.stock?.message}
          {...register('stock', { valueAsNumber: true })}
        />
      </div>

      {/* Pricing & Profit calculation */}
      <div className="bg-brand-50/60 rounded-3xl p-4 border border-brand-100 space-y-3">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          💰 Precios y Rentabilidad
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Precio de venta al público"
            type="number"
            min={0}
            step="any"
            placeholder="Ej: 1250 o 5000"
            error={errors.salePrice?.message}
            {...register('salePrice', { valueAsNumber: true })}
          />

          <Input
            label="Costo del producto (lo que te costó)"
            type="number"
            min={0}
            step="any"
            placeholder="Ej: 800 o 3500"
            error={errors.costPrice?.message}
            {...register('costPrice', { valueAsNumber: true })}
          />
        </div>

        {/* Real-time Profit & Margin display */}
        <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-brand-100 text-xs">
          <div>
            <span className="text-gray-500">Ganancia por unidad:</span>{' '}
            <strong className="text-emerald-600 font-bold text-sm">
              {formatCurrency(profit)}
            </strong>
          </div>
          <div>
            <span className="text-gray-500">Margen:</span>{' '}
            <strong className="text-gold-600 font-bold text-sm">
              {formatPercentage(margin)}
            </strong>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="isActive"
          className="rounded text-brand-500 focus:ring-brand-400 h-4 w-4"
          {...register('isActive')}
        />
        <label htmlFor="isActive" className="text-sm font-semibold text-gray-800">
          Producto activo (visible en catálogo público)
        </label>
      </div>

      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading || isUploading}
          className="w-full font-bold"
        >
          {initialData ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}
