export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt'>;
