export interface ProductLot {
  id?: number;
  lotNumber: string;
  supplier: string;
  price: number;
  stock: number;
}
export interface ProductLotFormData {
  numeroLote: string;
  proveedor: string;
  precio: number;
  stock: number;
}

export interface ProductFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  numeroLote: string;
  proveedor: string;
  precio: number;
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
