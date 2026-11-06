import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { LoginFormData, LoginResponse } from '../models/login';
import { Product, ProductFormData } from '../models/product';
import { LoggerService } from './logger.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(LoggerService);
  private readonly baseUrl = 'http://localhost:5189/api';

  login(credentials: LoginFormData) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/login`, { userName: credentials.usuario, password: credentials.clave }).pipe(
      tap({ next: () => this.logger.info('Login correcto.'), error: (error) => this.logger.error('Error al iniciar sesión.', error) }),
    );
  }

  getProducts(token: string) {
    return this.http.get<Product[]>(`${this.baseUrl}/Products`, { headers: this.headers(token) }).pipe(
      tap({ next: (products) => this.logger.info('Productos consultados.', { total: products.length }), error: (error) => this.logger.error('Error al consultar productos.', error) }),
    );
  }

  createProduct(token: string, product: ProductFormData) {
    return this.http.post<Product>(`${this.baseUrl}/Products`, this.toApiProduct(product), { headers: this.headers(token) }).pipe(
      tap({ next: () => this.logger.info('Producto creado.'), error: (error) => this.logger.error('Error al crear producto.', error) }),
    );
  }

  updateProduct(token: string, id: number, product: ProductFormData) {
    return this.http.put(`${this.baseUrl}/Products/${id}`, this.toApiProduct(product), { headers: this.headers(token) }).pipe(
      tap({ next: () => this.logger.info('Producto actualizado.', { id }), error: (error) => this.logger.error('Error al actualizar producto.', error) }),
    );
  }

  deleteProduct(token: string, id: number) {
    return this.http.delete(`${this.baseUrl}/Products/${id}`, { headers: this.headers(token) }).pipe(
      tap({ next: () => this.logger.info('Producto eliminado.', { id }), error: (error) => this.logger.error('Error al eliminar producto.', error) }),
    );
  }

  private headers(token: string) {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  private toApiProduct(product: ProductFormData) {
    return {
      code: product.codigo,
      name: product.nombre,
      description: product.descripcion,
      isActive: product.activo,
      lots: [{ lotNumber: product.numeroLote, supplier: product.proveedor, price: product.precio, stock: product.stock }],
    };
  }
}
