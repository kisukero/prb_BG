export interface ProductLot {
  id?: number;
  lotNumber: string;
  supplier: string;
  price: number;
  stock: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  lots: ProductLot[];
}

export type ProductRequest = Omit<Product, 'id'>;
