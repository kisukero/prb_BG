import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Product, ProductRequest } from '../models/product';

interface LoginResponse {
  token: string;
  user: { id: number; userName: string; fullName: string };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5189/api';

  login(userName: string, password: string) {
    return this.http.post<LoginResponse>(`${this.baseUrl}/Auth/login`, { userName, password });
  }

  getProducts(token: string) {
    return this.http.get<Product[]>(`${this.baseUrl}/Products`, { headers: this.headers(token) });
  }

  createProduct(token: string, product: ProductRequest) {
    return this.http.post<Product>(`${this.baseUrl}/Products`, product, { headers: this.headers(token) });
  }

  updateProduct(token: string, id: number, product: ProductRequest) {
    return this.http.put(`${this.baseUrl}/Products/${id}`, product, { headers: this.headers(token) });
  }

  deleteProduct(token: string, id: number) {
    return this.http.delete(`${this.baseUrl}/Products/${id}`, { headers: this.headers(token) });
  }

  private headers(token: string) {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
