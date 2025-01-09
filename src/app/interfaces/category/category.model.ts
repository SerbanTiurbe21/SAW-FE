import { Product } from '../product/product.model';

export interface Category {
  categoryId?: number;
  categoryName: string;
  description?: string;
  products?: Product[];
}
