import { Category } from '../category/category.model';
import { OrderItem } from '../order-item/order-item.model';
import { ProductDetail } from '../product-detail/product-detail.model';

export interface Product {
  productId?: number;
  productName: string;
  description?: string;
  category?: Category;
  price: number;
  stock: number;
  productDetails?: ProductDetail[];
  orderItems?: OrderItem[];
}
