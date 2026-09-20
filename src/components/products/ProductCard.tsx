'use client';

import React from 'react';
import { ProductWithCategory } from '@/types/product';
import { Button } from '@/components/ui/Button';
import { PriceDisplay } from './PriceDisplay';
import { StockBadge } from './StockBadge';
import { useCart } from '@/features/cart/CartContext';
import { Plus, Minus, ShoppingBag, ImageIcon } from 'lucide-react';

interface ProductCardProps {
  product: ProductWithCategory;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, updateQuantity, items } = useCart();
  const isOutOfStock = product.stock <= 0;
  const inCartItem = items.find(i => i.productId === product.id);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-rose-200 hover:shadow-md transition-all duration-200 flex flex-col h-full overflow-hidden group">
      {/* Product Image */}
      <div className="relative aspect-square w-full bg-slate-100/70 overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
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
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200/50">
            {product.category?.name}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-2 right-2">
          <StockBadge stock={product.stock} />
        </div>
      </div>

      {/* Product Details */}
      <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-1 mb-1 group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 flex-grow leading-relaxed">
          {product.description}
        </p>

        {/* Price & Cart Controls */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Precio</span>
            <PriceDisplay price={product.salePrice} size="md" />
          </div>

          {isOutOfStock ? (
            <span className="text-xs font-bold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-xl">
              Agotado
            </span>
          ) : inCartItem ? (
            /* Direct Stepper to add / decrease / remove directly on the card! */
            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 rounded-xl p-0.5">
              <button
                onClick={() => updateQuantity(product.id, inCartItem.quantity - 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-rose-700 hover:bg-rose-100 font-bold shadow-xs active:scale-95 transition-all"
                title="Quitar 1 unidad"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="w-6 text-center font-black text-xs text-rose-700">
                {inCartItem.quantity}
              </span>

              <button
                onClick={() => updateQuantity(product.id, inCartItem.quantity + 1)}
                disabled={inCartItem.quantity >= product.stock}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 font-bold shadow-xs active:scale-95 transition-all disabled:opacity-40"
                title="Agregar 1 unidad más"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => addItem(product, 1)}
              className="font-bold text-xs px-3 py-2 rounded-xl shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
