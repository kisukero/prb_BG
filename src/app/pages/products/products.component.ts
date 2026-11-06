import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, ProductFormData, ProductLot } from '../../models/product';
import { ApiService } from '../../services/api.service';

@Component({ selector: 'app-products', imports: [CommonModule, ReactiveFormsModule], templateUrl: './products.component.html', styleUrl: './products.component.css' })
export class ProductsComponent {
  private readonly api = inject(ApiService); private readonly fb = inject(FormBuilder); private readonly router = inject(Router); private readonly token = localStorage.getItem('token') ?? '';
  protected readonly userName = localStorage.getItem('userName') ?? ''; protected readonly products = signal<Product[]>([]); protected readonly message = signal('');
  protected editingId: number | null = null; protected editingLotId: number | null = null; protected selectedProduct: Product | null = null;

  protected readonly productForm = this.fb.nonNullable.group({ codigo: ['', Validators.required], nombre: ['', Validators.required], descripcion: [''], activo: [true], numeroLote: ['', Validators.required], proveedor: ['', Validators.required], precio: [0, [Validators.required, Validators.min(0)]], stock: [0, [Validators.required, Validators.min(0)]] });

  constructor() { if (!this.token) { this.router.navigateByUrl('/login'); return; } this.loadProducts(); }
  protected loadProducts(): void { this.api.getProducts(this.token).subscribe({ next: (products) => this.products.set(products), error: () => this.logout() }); }
  protected saveProduct(): void {
    if (this.productForm.invalid) { this.productForm.markAllAsTouched(); this.message.set('Completa Código, Nombre, Número de lote y Proveedor antes de guardar.'); return; }
    const product = this.productForm.getRawValue() as ProductFormData;
    const existing = this.products().find((item) => item.code.trim().toLowerCase() === product.codigo.trim().toLowerCase());
    if (existing && this.editingId !== null && existing.id !== this.editingId) { this.message.set('El código de producto ya existe.'); return; }
    const duplicateLot = existing?.lots.some((lot) => lot.lotNumber.trim().toLowerCase() === product.numeroLote.trim().toLowerCase() && lot.supplier.trim().toLowerCase() === product.proveedor.trim().toLowerCase() && lot.id !== this.editingLotId);
    if (duplicateLot) { this.message.set('Ese lote y proveedor ya están registrados para el producto.'); return; }
    const isNewLotForExistingProduct = !this.selectedProduct && !!existing;
    const operation = this.selectedProduct ? this.api.updateProductLot(this.token, this.selectedProduct, product, this.editingLotId) : existing ? this.api.updateProductLot(this.token, existing, product, null) : this.api.createProduct(this.token, product);
    operation.subscribe({ next: () => { this.message.set(isNewLotForExistingProduct ? 'Lote agregado al producto.' : 'Producto guardado.'); this.resetProductForm(); this.loadProducts(); }, error: (error) => this.message.set(error.error?.message ?? 'No se pudo guardar el producto.') });
  }
  protected edit(product: Product, lot: ProductLot): void { this.prepareForm(product, lot); this.message.set(`Editando ${product.name} y el lote ${lot.lotNumber}.`); }
  protected remove(id: number): void { if (!confirm('¿Eliminar este producto y todos sus lotes?')) return; this.api.deleteProduct(this.token, id).subscribe({ next: () => { this.message.set('Producto eliminado.'); this.loadProducts(); }, error: (error) => this.message.set(error.error?.message ?? 'No se pudo eliminar el producto.') }); }
  protected cancelEdit(): void { this.resetProductForm(); }
  protected logout(): void { localStorage.clear(); this.products.set([]); this.router.navigateByUrl('/login'); }
  private prepareForm(product: Product, lot: ProductLot): void { this.editingId = product.id; this.editingLotId = lot.id ?? null; this.selectedProduct = product; this.productForm.reset({ codigo: product.code, nombre: product.name, descripcion: product.description ?? '', activo: product.isActive, numeroLote: lot.lotNumber, proveedor: lot.supplier, precio: lot.price, stock: lot.stock }); }
  private resetProductForm(): void { this.editingId = null; this.editingLotId = null; this.selectedProduct = null; this.productForm.reset({ codigo: '', nombre: '', descripcion: '', activo: true, numeroLote: '', proveedor: '', precio: 0, stock: 0 }); }
}
