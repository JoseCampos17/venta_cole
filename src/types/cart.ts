export interface CartItem {
  productId: string;
  productName: string;
  productImage: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
  subtotal: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}
