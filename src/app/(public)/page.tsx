'use client';

import React, { useEffect, useState } from 'react';
import { ProductWithCategory } from '@/types/product';
import { Category } from '@/types/category';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { LoadingState } from '@/components/ui/LoadingState';
import { Search, Sparkles } from 'lucide-react';

export default function CatalogPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = React.useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products?isActive=true'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData);
        setCategories(catData.filter((c: Category) => c.isActive));
      }
    } catch (e) {
      console.error('Error loading catalog data:', e);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(true);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadData(false);
      }
    }, 10000);

    const handleFocus = () => loadData(false);
    const handleSync = () => loadData(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:inventory-changed', handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:inventory-changed', handleSync);
    };
  }, [loadData]);

  // Filter products by category and search
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryId ? p.categoryId === selectedCategoryId : true;
    const matchesSearch = searchQuery
      ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 via-rose-400 to-purple-400 p-6 sm:p-8 text-white shadow-md shadow-pink-200">
        <div className="relative z-10 max-w-md space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Novedades escolares
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            ¡Haz tu encargo y recíbelo en el colegio! 🌸
          </h2>
          <p className="text-xs sm:text-sm text-pink-100 font-medium">
            Cosméticos, ganchitos y accesorios. Separa tus favoritos y paga al recibir en efectivo o Nequi.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-6 text-7xl opacity-20 select-none pointer-events-none">
          ✨
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Buscar labiales, ganchos, sombras..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-pink-100 bg-white shadow-xs text-sm focus:outline-none focus:border-pink-400 focus:ring-2 focus:ring-pink-100 transition-all placeholder:text-gray-400"
        />
      </div>

      {/* Category Pills */}
      <CategoryFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />

      {/* Catalog Grid */}
      {isLoading ? (
        <LoadingState message="Cargando catálogo..." />
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
