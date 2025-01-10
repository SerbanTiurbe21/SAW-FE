import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../interfaces/product/product.model';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ImportsModule } from '../../imports';
import { MessageService } from 'primeng/api';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ImportsModule],
  providers: [ProductService, MessageService],
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  expandedRows: { [key: number]: boolean } = {};

  products!: Product[];

  constructor(
    private productService: ProductService,
    private primeng: PrimeNG,
    private messageService: MessageService
  ) {
    this.primeng.theme.set({
      preset: Aura,
    });
  }

  ngOnInit() {
    this.productService
      .getAllProducts()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((products: Product[]) => {
        this.products = products;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  stockSeverity(product: Product) {
    if (product.stock === 0) return 'danger';
    else if (product.stock > 0 && product.stock < 10) return 'warn';
    else return 'success';
  }

  expandAll() {
    this.expandedRows = {};
    this.products.forEach((p) => {
      this.expandedRows[p.productId!] = true;
    });
  }

  collapseAll() {
    this.expandedRows = {};
  }

  getSeverity(status: number) {
    if (status === 0) {
      return 'danger';
    } else if (status > 0 && status < 10) {
      return 'warn';
    } else {
      return 'success';
    }
  }

  getProductStatus(status: number) {
    if (status === 0) {
      return 'Out of Stock';
    } else if (status > 0 && status < 10) {
      return 'Low Stock';
    } else {
      return 'In Stock';
    }
  }

  onRowExpand(event: TableRowExpandEvent) {
    console.log(event);
    this.messageService.add({
      severity: 'info',
      summary: 'Product Expanded',
      detail: event.data.productName,
      life: 3000,
    });
  }

  onRowCollapse(event: TableRowCollapseEvent) {
    this.messageService.add({
      severity: 'success',
      summary: 'Product Collapsed',
      detail: event.data.productName,
      life: 3000,
    });
  }
}
