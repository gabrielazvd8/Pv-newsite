
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
  image: string; // Imagem Principal
  images: string[]; // Galeria de Imagens
  description: string;
  isProntaEntrega: boolean;
  isLancamento: boolean;
  isPromo: boolean;
  featured?: boolean;
  price?: string;
  oldPrice?: string;
}

export interface CarouselImage {
  id: string;
  url: string;
  title?: string;
  subtitle?: string;
  active: boolean;
}

export interface Logo {
  id: string;
  url: string;
  name: string;
}

export interface TeamPVItem {
  id: string;
  name: string;
  image: string;
  verified: boolean;
}

export interface AppSettings {
  promoSectionActive: boolean;
  prontaEntregaSectionActive: boolean;
  lancamentoSectionActive: boolean;
  teamPVSectionActive: boolean;
  activeLogoId: string;
}

export type AppView = 'store' | 'admin' | 'login';
