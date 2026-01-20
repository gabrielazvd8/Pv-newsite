
export interface Category {
  id: string;
  name: string;
  image: string;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId: string;
  image: string;
  description: string;
  isProntaEntrega: boolean;
  featured?: boolean;
  price?: string; // Optional price for display
}

export interface AppSettings {
  prontaEntregaSectionActive: boolean;
}

export type AppView = 'store' | 'admin' | 'login';
