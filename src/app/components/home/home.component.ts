import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProductService } from '../../services/product/product.service';
import { Product } from '../../interfaces/product/product.model';
import { Subject, takeUntil } from 'rxjs';
import { PrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { ImportsModule } from '../../imports';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { Category } from '../../interfaces/category/category.model';
import { CategoryService } from '../../services/category/category.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  imports: [ImportsModule],
  providers: [
    ProductService,
    MessageService,
    ConfirmationService,
    CategoryService,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  expandedRows: { [key: number]: boolean } = {};
  products!: Product[];
  categories!: Category[];
  displayAddProductDialog: boolean = false;
  productForm!: FormGroup;

  constructor(
    private productService: ProductService,
    private primeng: PrimeNG,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private categoryService: CategoryService,
    private fb: FormBuilder
  ) {
    this.primeng.theme.set({
      preset: Aura,
    });
  }

  ngOnInit() {
    this.fetchCategories();
    this.initializeForm();
  }

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

  initializeForm(): void {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      description: ['', Validators.required],
      category: [null, Validators.required],
      price: [null, Validators.required],
      stock: [null, Validators.required],
      productDetails: this.fb.array([this.createProductDetail()]),
    });
  }

  createProductDetail(): FormGroup {
    return this.fb.group({
      attribute: [''],
      value: [''],
    });
  }

  get productDetails(): FormArray {
    return this.productForm.get('productDetails') as FormArray;
  }

  addProductDetail(): void {
    this.productDetails.push(this.createProductDetail());
  }

  removeProductDetail(index: number): void {
    this.productDetails.removeAt(index);
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

  editProduct(product: Product) {
    console.log('Edit product', product);
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.productName + '?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteProductConfirmed(product);
      },
    });
  }

  deleteProductConfirmed(product: Product) {
    this.productService
      .deleteProduct(product.productId!)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Product Deleted',
            detail: product.productName + ' is deleted',
            life: 3000,
          });
          this.products = this.products.filter(
            (p) => p.productId !== product.productId
          );
          window.location.reload();
        },
      });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const newProduct: Product = this.productForm.value;
      const categoryId = newProduct.category?.categoryId;
      newProduct.orderItems = [];
      newProduct.category = {
        categoryId,
      };
      console.log(newProduct);
      this.productService
        .createProduct(newProduct)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (product: Product) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Product Added',
              detail: product.productName + ' is added',
              life: 3000,
            });
            this.products.push(product);
            this.displayAddProductDialog = false;
            this.productForm.reset();
            this.fetchCategories();
          },
          error: (error) => {
            console.error(error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message,
              life: 3000,
            });
          },
        });
    }
  }
}
