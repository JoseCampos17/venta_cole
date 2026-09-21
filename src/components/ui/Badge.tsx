import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'pink' | 'purple' | 'green' | 'yellow' | 'red' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    pink: 'bg-brand-100 text-brand-700 border-brand-200',
    purple: 'bg-gold-100 text-gold-700 border-gold-200',
    green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
    blue: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
