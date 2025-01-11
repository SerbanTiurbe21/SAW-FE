import { Component, OnInit } from '@angular/core';
import { ImportsModule } from '../../imports';
import { Product } from '../../interfaces/product/product.model';
import { CartService } from '../../services/cart/cart.service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { ProductService } from '../../services/product/product.service';
import { CategoryService } from '../../services/category/category.service';
import { Category } from '../../interfaces/category/category.model';
import { OrderService } from '../../services/order/order.service';
import { OrderItem } from '../../interfaces/order-item/order-item.model';
import { Order } from '../../interfaces/order/order.model';

interface CartItem {
  product: Product;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ImportsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
  providers: [MessageService, CartService, ProductService, OrderService],
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  private unsubscribe$ = new Subject<void>();
  products!: Product[];
  categories!: Category[];

  ngOnInit(): void {
    this.cartService.cartChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((cartItems: CartItem[]) => {
        this.cartItems = cartItems;
        console.log('cartItems', this.cartItems);
      });
    this.fetchCategories();
  }

  constructor(
    private cartService: CartService,
    private messageService: MessageService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private orderService: OrderService
  ) {}

  fetchCategories(): void {
    this.categoryService
      .getAllCategories()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((categories: Category[]) => {
        this.categories = categories;
        this.fetchProducts();
      });
  }

  fetchProducts(): void {
    this.products = this.categories.flatMap(
      (category) => category.products || []
    );
    this.products.forEach((product) => {
      product.category = this.categories.find((category) =>
        category.products?.includes(product)
      );
    });
  }

  removeItem(index: number): void {
    const product: Product = this.cartItems[index].product;
    const category: Category | undefined = this.categories.find(
      (category) => category.categoryId === product.category?.categoryId
    );
    if (category) {
      product.category = {
        categoryId: category.categoryId,
      };
    }
    this.cartService.removeProductFromCart(index);
    this.messageService.add({
      severity: 'success',
      summary: 'Product Removed',
      detail: `${this.cartItems[index].product.productName} has been removed from your cart.`,
      life: 3000,
    });
    this.cartItems.splice(index, 1);
    this.productService
      .updateProduct(product.productId!, product)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe();
  }

  updateQuantity(index: number, quantity: number): void {
    const cartItem: CartItem = this.cartItems[index];
    cartItem.quantity = quantity;
    const productStock = cartItem.product.stock - quantity;
    cartItem.product.stock = productStock;
    this.cartService.updateQuantity(index, quantity);
    this.messageService.add({
      severity: 'success',
      summary: 'Quantity Updated',
      detail: `${cartItem.product.productName} quantity has been updated to ${quantity}.`,
      life: 3000,
    });
  }

  checkout(): void {
    this.products.forEach((product) => {
      const cartItem = this.cartItems.find(
        (item) => item.product.productId === product.productId
      );
      if (cartItem) {
        product.stock = product.stock - cartItem.quantity;
        const category: Category | undefined = this.categories.find(
          (category) => category.categoryId === product.category?.categoryId
        );
        if (category) {
          product.category = {
            categoryId: category.categoryId,
          };
        }
        this.productService
          .updateProduct(product.productId!, product)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe();

        const orderItems: OrderItem[] = this.cartItems.map((item) => {
          return {
            product: item.product,
            quantity: item.quantity,
            price: item.product.price,
          };
        });
        const order: Order = {
          orderDate: new Date(),
          status: 'Pending',
          orderItems: orderItems,
        };
        this.orderService
          .createOrder(order)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Checkout Successful',
                detail: 'Your order has been placed successfully..',
                life: 3000,
              });
            },
          });
      }
    });
    setTimeout(() => {
      this.cartService.clearCart();
    }, 3000);
  }
}
