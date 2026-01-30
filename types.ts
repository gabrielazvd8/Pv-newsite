
export interface Category {
  id: string;
  nome: string;
  midia: string;
  ativo: boolean;
}

export interface Subcategory {
  id: string;
  nome: string;
  categoriaId: string;
  midia: string;
  ativo: boolean;
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
  public_id?: string;
  title?: string;
  subtitle?: string;
  align: 'left' | 'center' | 'right';
  active: boolean;
}

export interface Logo {
  id: string;
  url: string;
  name: string;
  active?: boolean;
}

export interface TeamPVItem {
  id: string;
  name: string;
  image: string;
  verified: boolean;
  public_id?: string;
}

export interface AppSettings {
  promoSectionActive: boolean;
  prontaEntregaSectionActive: boolean;
  lancamentoSectionActive: boolean;
  teamPVSectionActive: boolean;
  activeLogoId: string;
}

export type AppView = 'store' | 'admin' | 'login';
