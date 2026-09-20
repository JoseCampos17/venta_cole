import React from 'react';
import { ProductWithCategory } from '@/types/product';
import { ProductCard } from './ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { PackageOpen } from 'lucide-react';

interface ProductGridProps {
  products: ProductWithCategory[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageOpen className="w-12 h-12 text-slate-300" />}
        title="No hay productos en esta categoría"
        description="Pronto agregaremos más artículos a la tienda."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
