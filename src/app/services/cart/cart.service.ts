import { Injectable } from '@angular/core';
import { Product } from '../../interfaces/product/product.model';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor() {
    this.loadInitialCart();
  }

  get cartChanges(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  private loadInitialCart(): void {
    const storedCart = sessionStorage.getItem('shoppingCart');
    if (storedCart) {
      this.cartItems = JSON.parse(storedCart);
      this.cartSubject.next(this.cartItems);
    }
  }

  addProductToCart(product: Product, quantity: number): Observable<any> {
    const productId: number = product.productId!;
    const existingItem =
      this.cartItems.length > 0
        ? this.cartItems.find((item) => item.product.productId === productId)
        : null;
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.cartItems.push({ product, quantity });
    }
    this.updateLocalStorage();
    return of({ success: true });
  }

  removeProductFromCart(productId: number): void {
    this.cartItems = this.cartItems.filter(
      (item) => item.product.productId !== productId
    );
    this.updateLocalStorage();
  }

  private updateLocalStorage(): void {
    sessionStorage.setItem('shoppingCart', JSON.stringify(this.cartItems));
    this.cartSubject.next(this.cartItems);
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateLocalStorage();
  }

  updateQuantity(index: number, quantity: number): void {
    this.cartItems[index].quantity = quantity;
    this.updateLocalStorage();
  }
}
