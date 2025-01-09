import { Product } from '../product/product.model';

export interface ProductDetail {
  detailId?: number;
  product?: Product;
  attribute: string;
  value: string;
}
