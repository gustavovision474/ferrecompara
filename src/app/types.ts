export interface Product {
  id: string;
  name: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  image: string;
  status: 'available' | 'low-stock' | 'out-of-stock';
  tag?: string;
  category: string;
}

export const MOCK_PRODUCTS: Product[] = [];
