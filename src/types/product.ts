export interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  salePrice: number;
  costPrice: number;
  stock: number;
  imageUrl: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithCategory extends Product {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export type CreateProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted'>;
export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductFilters {
  categoryId?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}
