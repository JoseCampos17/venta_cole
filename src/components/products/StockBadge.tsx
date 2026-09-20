import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { LOW_STOCK_THRESHOLD } from '@/config/constants';

interface StockBadgeProps {
  stock: number;
  className?: string;
}

export function StockBadge({ stock, className = '' }: StockBadgeProps) {
  if (stock <= 0) {
    return <Badge variant="red" className={className}>Agotado</Badge>;
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return <Badge variant="yellow" className={className}>¡Solo quedan {stock}!</Badge>;
  }
  return <Badge variant="green" className={className}>{stock} disponibles</Badge>;
}
