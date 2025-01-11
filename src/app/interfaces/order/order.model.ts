import { OrderItem } from '../order-item/order-item.model';

export interface Order {
  orderId?: number;
  orderDate: Date | string;
  status?: string;
  orderItems: OrderItem[];
}
