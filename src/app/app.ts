import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from './services/api.service';
import { Product, ProductRequest } from './models/product';

@Component({
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly token = signal(localStorage.getItem('token') ?? '');
  protected readonly userName = signal(localStorage.getItem('userName') ?? '');
  protected readonly products = signal<Product[]>([]);
  protected readonly message = signal('');
  protected editingId: number | null = null;

  protected readonly loginForm = this.fb.nonNullable.group({
    userName: ['admin', Validators.required],
    password: ['Admin123*', Validators.required],
  });

  protected readonly productForm = this.fb.nonNullable.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    description: [''],
    isActive: [true],
    lots: this.fb.array([this.createLot()]),
  });

  constructor() {
    if (this.token()) this.loadProducts();
  }

  protected get lots(): FormArray { return this.productForm.controls.lots; }

  protected login(): void {
    if (this.loginForm.invalid) return;
    const { userName, password } = this.loginForm.getRawValue();
    this.api.login(userName, password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userName', response.user.userName);
        this.token.set(response.token);
        this.userName.set(response.user.userName);
        this.message.set('Sesión iniciada.');
        this.loadProducts();
      },
      error: (error) => this.message.set(error.error?.message ?? 'No se pudo iniciar sesión.'),
    });
  }

  protected loadProducts(): void {
    this.api.getProducts(this.token()).subscribe({
      next: (products) => this.products.set(products),
      error: () => this.logout('La sesión no es válida. Ingresa nuevamente.'),
    });
  }

  protected saveProduct(): void {
    if (this.productForm.invalid) return;
    const request = this.productForm.getRawValue() as ProductRequest;
    const operation = this.editingId === null
      ? this.api.createProduct(this.token(), request)
      : this.api.updateProduct(this.token(), this.editingId, request);

    operation.subscribe({
      next: () => { this.message.set('Producto guardado.'); this.resetProductForm(); this.loadProducts(); },
      error: (error) => this.message.set(error.error?.message ?? 'No se pudo guardar el producto.'),
    });
  }

  protected edit(product: Product): void {
    this.editingId = product.id;
    this.productForm.patchValue(product);
    this.lots.clear();
    product.lots.forEach((lot) => this.lots.push(this.createLot(lot)));
    this.message.set(`Editando ${product.name}.`);
  }

  protected remove(id: number): void {
    if (!confirm('¿Eliminar este producto?')) return;
    this.api.deleteProduct(this.token(), id).subscribe({
      next: () => { this.message.set('Producto eliminado.'); this.loadProducts(); },
      error: (error) => this.message.set(error.error?.message ?? 'No se pudo eliminar el producto.'),
    });
  }

  protected addLot(): void { this.lots.push(this.createLot()); }
  protected removeLot(index: number): void { if (this.lots.length > 1) this.lots.removeAt(index); }
  protected cancelEdit(): void { this.resetProductForm(); }
  protected logout(message = 'Sesión cerrada.'): void { localStorage.clear(); this.token.set(''); this.userName.set(''); this.products.set([]); this.message.set(message); }

  private createLot(lot?: { lotNumber: string; supplier: string; price: number; stock: number }) {
    return this.fb.nonNullable.group({ lotNumber: [lot?.lotNumber ?? '', Validators.required], supplier: [lot?.supplier ?? '', Validators.required], price: [lot?.price ?? 0, [Validators.required, Validators.min(0)]], stock: [lot?.stock ?? 0, [Validators.required, Validators.min(0)]] });
  }

  private resetProductForm(): void { this.editingId = null; this.productForm.reset({ code: '', name: '', description: '', isActive: true }); this.lots.clear(); this.addLot(); }
}
