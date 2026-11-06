import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, ProductFormData } from '../../models/product';
import { ApiService } from '../../services/api.service';

@Component({ selector: 'app-products', imports: [CommonModule, ReactiveFormsModule], templateUrl: './products.component.html', styleUrl: './products.component.css' })
export class ProductsComponent {
  private readonly api = inject(ApiService); private readonly fb = inject(FormBuilder); private readonly router = inject(Router); private readonly token = localStorage.getItem('token') ?? '';
  protected readonly userName = localStorage.getItem('userName') ?? ''; protected readonly products = signal<Product[]>([]); protected readonly message = signal(''); protected editingId: number | null = null;

  // Un producto se guarda junto con un lote.
  protected readonly productForm = this.fb.nonNullable.group({
    codigo: ['', Validators.required], nombre: ['', Validators.required], descripcion: [''], activo: [true], numeroLote: ['', Validators.required], proveedor: ['', Validators.required], precio: [0, [Validators.required, Validators.min(0)]], stock: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() { if (!this.token) { this.router.navigateByUrl('/login'); return; } this.loadProducts(); }
  protected loadProducts(): void { this.api.getProducts(this.token).subscribe({ next: (products) => this.products.set(products), error: () => this.logout() }); }
  protected saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); this.message.set('Completa Código, Nombre, Número de lote y Proveedor antes de guardar.'); return; }
    const product = this.productForm.getRawValue() as ProductFormData;
    const codeExists = this.products().some((existing) => existing.code.trim().toLowerCase() === product.codigo.trim().toLowerCase() && existing.id !== this.editingId);
    if (codeExists) { this.message.set('El código de producto ya existe.'); return; }
    const operation = this.editingId === null ? this.api.createProduct(this.token, product) : this.api.updateProduct(this.token, this.editingId, product);
    operation.subscribe({ next: () => { this.message.set('Producto guardado.'); this.resetProductForm(); this.loadProducts(); }, error: (error) => this.message.set(error.error?.message ?? 'No se pudo guardar el producto.') });
  }
  protected edit(product: Product): void {
    const lot = product.lots[0];
    if (!lot) { this.message.set('El producto no tiene un lote para editar.'); return; }
    this.editingId = product.id;
    this.productForm.patchValue({ codigo: product.code, nombre: product.name, descripcion: product.description ?? '', activo: product.isActive, numeroLote: lot.lotNumber, proveedor: lot.supplier, precio: lot.price, stock: lot.stock });
    this.message.set(`Editando ${product.name}.`);
  }
  protected remove(id: number): void { if (!confirm('¿Eliminar este producto?')) return; this.api.deleteProduct(this.token, id).subscribe({ next: () => { this.message.set('Producto eliminado.'); this.loadProducts(); }, error: (error) => this.message.set(error.error?.message ?? 'No se pudo eliminar el producto.') }); }
  protected cancelEdit(): void { this.resetProductForm(); }
  protected logout(): void { localStorage.clear(); this.products.set([]); this.router.navigateByUrl('/login'); }
  private resetProductForm(): void { this.editingId = null; this.productForm.reset({ codigo: '', nombre: '', descripcion: '', activo: true, numeroLote: '', proveedor: '', precio: 0, stock: 0 }); }
}
