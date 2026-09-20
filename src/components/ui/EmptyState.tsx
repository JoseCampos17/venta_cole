import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = <PackageOpen className="w-12 h-12 text-pink-300" />,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-pink-50/40 rounded-3xl border border-dashed border-pink-200 my-4">
      <div className="mb-4">{icon}</div>
      <h4 className="text-base font-bold text-gray-800 mb-1">{title}</h4>
      {description && <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
