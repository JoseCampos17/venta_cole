'use client';

import React, { useEffect } from 'react';
import { X, ZoomIn, ShoppingBag } from 'lucide-react';
import { Button } from './Button';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  price?: number;
  onAddToCart?: () => void;
  addToCartLabel?: string;
}

export function ImagePreviewModal({
  isOpen,
  onClose,
  imageUrl,
  title,
  subtitle,
  price,
  onAddToCart,
  addToCartLabel = 'Agregar al carrito',
}: ImagePreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Dark Blur Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative z-10 max-w-2xl w-full flex flex-col items-center max-h-[92vh]">
        {/* Floating Top Bar with Close */}
        <div className="w-full flex items-center justify-between pb-3 text-white px-2">
          <div className="min-w-0 pr-4">
            {title && (
              <h3 className="font-extrabold text-base sm:text-lg text-white truncate drop-shadow-sm">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-brand-200 font-medium truncate drop-shadow-xs">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all active:scale-95 flex-shrink-0 cursor-pointer shadow-lg"
            title="Cerrar previsualización (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Box */}
        <div
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-black/40 border border-white/15 shadow-2xl flex items-center justify-center max-h-[70vh] sm:max-h-[76vh] w-full"
          onClick={e => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={title || 'Previsualización de producto'}
            className="w-auto h-auto max-h-[70vh] sm:max-h-[76vh] max-w-full object-contain rounded-2xl select-none"
          />
        </div>

        {/* Bottom Actions if in Catalog */}
        {onAddToCart && (
          <div className="mt-3 w-full flex items-center justify-between gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            {price !== undefined && (
              <div className="text-white">
                <span className="text-[10px] text-brand-200 uppercase font-bold block leading-none">
                  Precio
                </span>
                <span className="text-lg font-black text-white leading-tight">
                  ${price.toLocaleString('es-CO')}
                </span>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => {
                onAddToCart();
                onClose();
              }}
              className="ml-auto font-bold shadow-lg shadow-brand-500/30 text-xs sm:text-sm px-5"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" /> {addToCartLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
