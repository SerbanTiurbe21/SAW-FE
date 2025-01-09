import { OrderItem } from '../order-item/order-item.model';
import { User } from '../user/user.model';

export interface Order {
  orderId?: number;
  user: User;
  orderDate: Date | string;
  status?: string;
  orderItems: OrderItem[];
}
