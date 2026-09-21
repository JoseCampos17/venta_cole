'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ProductWithCategory, Product } from '@/types/product';
import { Category } from '@/types/category';
import { ProductForm } from '@/components/admin/ProductForm';
import { PriceDisplay } from '@/components/products/PriceDisplay';
import { StockBadge } from '@/components/products/StockBadge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePreviewModal } from '@/components/ui/ImagePreviewModal';
import { formatCurrency } from '@/lib/utils/format';
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  Check,
  X,
  ImageIcon,
  ZoomIn,
} from 'lucide-react';
import { ProductFormValues } from '@/lib/validation/product.schema';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal create/edit state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview photo state
  const [previewProduct, setPreviewProduct] = useState<ProductWithCategory | null>(null);

  // Delete confirm state
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        setProducts(prodData);
        setCategories(catData);
      }
    } catch (e) {
      console.error(e);
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
    const handleInventoryChange = () => loadData(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('app:inventory-changed', handleInventoryChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('app:inventory-changed', handleInventoryChange);
    };
  }, [loadData]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        const savedProduct = await res.json();
        const categoryObj = categories.find(c => c.id === savedProduct.categoryId) || {
          id: savedProduct.categoryId,
          name: 'Categoría',
          slug: 'cat',
        };

        const enrichedProduct: ProductWithCategory = {
          ...savedProduct,
          category: categoryObj,
        };

        if (editingProduct) {
          setProducts(prev => prev.map(p => (p.id === savedProduct.id ? enrichedProduct : p)));
        } else {
          setProducts(prev => [enrichedProduct, ...prev]);
        }

        setIsFormOpen(false);
        setEditingProduct(undefined);
        window.dispatchEvent(new Event('app:inventory-changed'));
      } else {
        const err = await res.json();
        alert(err.error || 'Error al guardar el producto');
      }
    } catch {
      alert('Error al conectar con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStock = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);

    // Instant optimistic update in React state
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, stock: newStock } : p))
    );

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      window.dispatchEvent(new Event('app:inventory-changed'));
    } catch (e) {
      console.error('Failed to sync stock delta', e);
      await loadData(false); // Revert if request failed
    }
  };

  const handleToggleActive = async (product: Product) => {
    const newActive = !product.isActive;

    // Instant optimistic update
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, isActive: newActive } : p))
    );

    try {
      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newActive }),
      });
      window.dispatchEvent(new Event('app:inventory-changed'));
    } catch (e) {
      console.error('Failed to toggle active state', e);
      await loadData(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;
    const idToDelete = deletingProductId;
    setDeletingProductId(null);

    // Instant optimistic removal from UI
    setProducts(prev => prev.filter(p => p.id !== idToDelete));

    try {
      await fetch(`/api/products/${idToDelete}`, {
        method: 'DELETE',
      });
      window.dispatchEvent(new Event('app:inventory-changed'));
    } catch {
      alert('Error al eliminar producto');
      await loadData(false);
    }
  };

  return (
    <div className="space-y-5 pb-16 md:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Mis Productos</h1>
          <p className="text-xs text-slate-500">
            {products.length} productos registrados • Toca para editar o cambiar stock
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingProduct(undefined);
            setIsFormOpen(true);
          }}
          className="font-bold text-sm shadow-sm w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Agregar Nuevo Producto
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando tus productos..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package className="w-12 h-12 text-slate-300" />}
          title="No tienes productos registrados"
          description="Crea tu primer producto para empezar a vender."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                setEditingProduct(undefined);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1.5" /> Agregar Producto
            </Button>
          }
        />
      ) : (
        /* Mobile-First Card List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {products.map(product => {
            const profit = product.salePrice - product.costPrice;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-brand-200 transition-all flex flex-col justify-between space-y-3"
              >
                {/* Top Info: Thumbnail + Title + Status */}
                <div className="flex items-start gap-3">
                  <div
                    onClick={() => product.imageUrl && setPreviewProduct(product)}
                    className={`w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden relative group/thumb ${
                      product.imageUrl ? 'cursor-zoom-in hover:border-brand-400' : ''
                    }`}
                    title={product.imageUrl ? 'Toca para ampliar fotografía' : undefined}
                  >
                    {product.imageUrl ? (
                      <>
                        <img src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                          <ZoomIn className="w-3.5 h-3.5 text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-extrabold text-slate-900 text-sm truncate">
                        {product.name}
                      </h3>
                      <button
                        onClick={() => handleToggleActive(product)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 flex-shrink-0 cursor-pointer ${
                          product.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                        title="Toca para activar/desactivar en la tienda"
                      >
                        {product.isActive ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {product.isActive ? 'Activo' : 'Oculto'}
                      </button>
                    </div>

                    <span className="text-[11px] font-semibold text-slate-500 block">
                      {product.category?.name}
                    </span>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  </div>
                </div>

                {/* Price, Cost & Profit Badges */}
                <div className="bg-slate-50 rounded-xl p-2.5 grid grid-cols-3 gap-1 text-center text-xs border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Venta</span>
                    <strong className="text-slate-900 font-extrabold">{formatCurrency(product.salePrice)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Costo</span>
                    <span className="text-slate-500 font-medium">{formatCurrency(product.costPrice)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Ganancia</span>
                    <strong className="text-emerald-600 font-black">+{formatCurrency(profit)}</strong>
                  </div>
                </div>

                {/* Stock Controls + Edit/Delete actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  {/* Quick stock stepper */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleQuickStock(product, -1)}
                      disabled={product.stock <= 0}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm disabled:opacity-30 cursor-pointer"
                      title="Disminuir 1 unidad"
                    >
                      -
                    </button>

                    <StockBadge stock={product.stock} />

                    <button
                      onClick={() => handleQuickStock(product, 1)}
                      className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm cursor-pointer"
                      title="Aumentar 1 unidad"
                    >
                      +
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setIsFormOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>

                    <button
                      onClick={() => setDeletingProductId(product.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(undefined);
        }}
        title={editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
        maxWidth="lg"
      >
        <ProductForm
          initialData={editingProduct}
          categories={categories}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Soft Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProductId)}
        onClose={() => setDeletingProductId(null)}
        onConfirm={handleDelete}
        title="¿Eliminar producto?"
        message="El producto se ocultará de la tienda pública. El historial de ventas y pedidos no se perderá."
        confirmText="Sí, eliminar"
        variant="danger"
      />

      {/* Full image preview modal */}
      {previewProduct?.imageUrl && (
        <ImagePreviewModal
          isOpen={Boolean(previewProduct)}
          onClose={() => setPreviewProduct(null)}
          imageUrl={previewProduct.imageUrl}
          title={previewProduct.name}
          subtitle={`${previewProduct.category?.name} • Stock: ${previewProduct.stock} uds`}
          price={previewProduct.salePrice}
        />
      )}
    </div>
  );
}
