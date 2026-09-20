import React from 'react';
import { OrderStatus, ORDER_STATUS_LABELS } from '@/types/order';
import { ORDER_STATUS_COLORS } from '@/config/constants';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  const label = ORDER_STATUS_LABELS[status] || status;
  const colorClass = ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
