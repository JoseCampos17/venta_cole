'use client';

import React, { useState } from 'react';
import { ProductWithCategory } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from './PriceDisplay';
import { StockBadge } from './StockBadge';
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal';
import { useCart } from '@/features/cart/CartContext';
import { Plus, Minus, ShoppingBag, ImageIcon, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateQuantity, items } = useCart();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const isOutOfStock = product.stock <= 0;
  const inCartItem = items.find(i => i.productId === product.id);

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-brand-200 hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group">
        {/* Product Image Clickable */}
        <div
          onClick={() => product.imageUrl && setIsPreviewOpen(true)}
          className={`relative aspect-square w-full bg-slate-100/70 overflow-hidden flex items-center justify-center ${
            product.imageUrl ? 'cursor-zoom-in' : ''
          }`}
          title={product.imageUrl ? 'Toca para ver la foto en grande' : undefined}
        >
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="p-2 rounded-full bg-black/60 backdrop-blur-md text-white shadow-md">
                  <ZoomIn className="w-4 h-4" />
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 p-4 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/80 border border-slate-200 flex items-center justify-center mb-1.5 shadow-xs">
                <ImageIcon className="w-6 h-6 text-slate-300" />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {product.category?.name || 'Producto'}
              </span>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-2 left-2 max-w-[calc(50%-4px)] pointer-events-none">
            <span className="block truncate px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[9px] sm:text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200/50">
              {product.category?.name}
            </span>
          </div>

          {/* Stock Badge */}
          <div className="absolute top-2 right-2 max-w-[calc(50%-4px)] pointer-events-none">
            <StockBadge stock={product.stock} className="truncate text-[9px] sm:text-xs" />
          </div>
        </div>

      {/* Product Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 mb-0.5 sm:mb-1 group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 mb-2 sm:mb-3 flex-grow leading-relaxed">
          {product.description}
        </p>

        {/* Price & Cart Controls */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400">Precio</span>
            <PriceDisplay price={product.salePrice} size="md" className="font-extrabold" />
          </div>

          {isOutOfStock ? (
            <span className="w-full text-xs font-bold text-slate-400 py-2 bg-slate-100 rounded-xl text-center">
              Agotado
            </span>
          ) : inCartItem ? (
            /* Direct Stepper to add / decrease / remove directly on the card! */
            <div className="flex items-center justify-between bg-brand-50 border border-brand-200/80 rounded-xl p-1 w-full shadow-xs">
              <button
                type="button"
                onClick={() => updateQuantity(product.id, inCartItem.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-brand-700 hover:bg-brand-100 font-bold shadow-xs active:scale-95 transition-all"
                title="Quitar 1 unidad"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex flex-col items-center">
                <span className="font-black text-sm text-brand-800 leading-tight">
                  {inCartItem.quantity}
                </span>
                <span className="text-[9px] text-brand-600 font-semibold leading-none">
                  en carrito
                </span>
              </div>

              <button
                type="button"
                onClick={() => updateQuantity(product.id, inCartItem.quantity + 1)}
                disabled={inCartItem.quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-500 text-white hover:bg-brand-600 font-bold shadow-xs active:scale-95 transition-all disabled:opacity-40"
                title="Agregar 1 unidad más"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => addItem(product, 1)}
              className="w-full font-bold text-xs py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Agregar al carrito
            </Button>
          )}
        </div>
      </div>
    </div>

    {/* Full image preview modal */}
    {product.imageUrl && (
      <ImagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        imageUrl={product.imageUrl}
        title={product.name}
        subtitle={product.category?.name}
        price={product.salePrice}
        onAddToCart={!isOutOfStock ? () => addItem(product, 1) : undefined}
        addToCartLabel={inCartItem ? 'Agregar otra unidad' : 'Agregar al carrito'}
      />
    )}
  </>
  );
}
