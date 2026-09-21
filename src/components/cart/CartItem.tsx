'use client';

import React from 'react';
import { CartItem as CartItemType } from '@/types/cart';
import { useCart } from '@/features/cart/CartContext';
import { PriceDisplay } from '../products/PriceDisplay';
import { Plus, Minus, Trash2, Sparkles } from 'lucide-react';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className="flex items-center gap-3.5 py-3 border-b border-brand-50 last:border-0">
      {/* Product Image Thumbnail */}
      <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.productImage ? (
          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
        ) : (
          <Sparkles className="w-6 h-6 text-brand-300" />
        )}
      </div>

      {/* Info */}
      <div className="flex-grow min-w-0">
        <h4 className="font-bold text-gray-900 text-sm truncate">{item.productName}</h4>
        <div className="text-xs text-gray-500 mb-2">
          <PriceDisplay price={item.unitPrice} size="sm" /> cada uno
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center border border-brand-200 rounded-xl bg-brand-50/40 p-0.5">
            <button
              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-7 text-center font-bold text-xs text-gray-800">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              disabled={item.quantity >= item.stock}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white text-gray-600 transition-colors disabled:opacity-30"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => removeItem(item.productId)}
            className="text-gray-400 hover:text-red-500 p-1 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtotal */}
      <div className="text-right flex-shrink-0 self-center">
        <div className="text-[10px] uppercase font-bold text-gray-400">Subtotal</div>
        <PriceDisplay price={item.subtotal} size="md" />
      </div>
    </div>
  );
}
