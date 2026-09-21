import React from 'react';
import { formatCurrency } from '@/lib/utils/format';

interface PriceDisplayProps {
  price: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function PriceDisplay({ price, size = 'md', className = '' }: PriceDisplayProps) {
  const sizes = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-lg font-extrabold',
    xl: 'text-2xl font-black',
  };

  return (
    <span className={`text-brand-600 tracking-tight ${sizes[size]} ${className}`}>
      {formatCurrency(price)}
    </span>
  );
}
