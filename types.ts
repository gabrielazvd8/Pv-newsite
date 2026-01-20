
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
  isLancamento: boolean; // New field for launch section
  featured?: boolean;
  price?: string; // Optional price for display
}

export interface AppSettings {
  prontaEntregaSectionActive: boolean;
  lancamentoSectionActive: boolean; // New setting for visibility control
}

export type AppView = 'store' | 'admin' | 'login';
