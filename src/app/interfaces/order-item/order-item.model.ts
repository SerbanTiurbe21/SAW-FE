import { Order } from '../order/order.model';
import { Product } from '../product/product.model';

export interface OrderItem {
  orderItemId?: number;
  order?: Order;
  product?: Product;
  quantity: number;
  price: number;
}
