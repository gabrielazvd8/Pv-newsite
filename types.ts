
export interface Category {
  id: string;
  nome: string;
  midia: string;
  cloudinary_id?: string;
  ativo: boolean;
  criadoEm?: any;
}

export interface Subcategory {
  id: string;
  nome: string;
  categoriaId: string;
  categoriaNome?: string;
  midia: string;
  cloudinary_id?: string;
  ativo: boolean;
  ordem?: number;
  criadoEm?: any;
}

export interface Product {
  id: string;
  name: string; // nome
  description: string; // descricao
  categoryId: string; // categoriaId
  categoryName?: string; // categoriaNome
  subcategoryId: string; // subcategoriaId (obrigatório agora)
  subcategoryName?: string; // subcategoriaNome
  image: string; // Mantido para compatibilidade (primeira imagem)
  images: string[]; // midias.imagens (1 a 4)
  cloudinary_ids: string[]; // IDs das imagens para deleção
  video?: string | null; // midias.video
  video_cloudinary_id?: string | null;
  isProntaEntrega: boolean;
  isLancamento: boolean;
  isPromo: boolean;
  price?: string;
  oldPrice?: string;
  ativo: boolean;
  criadoEm?: any;
}

export interface CarouselImage {
  id: string;
  url: string;
  cloudinary_id: string;
  title?: string;
  subtitle?: string;
  align: 'left' | 'center' | 'right';
  active: boolean;
}

export interface Logo {
  id: string;
  midia_url: string; // alterado de url para midia_url
  nome: string; // alterado de name para nome
  ativo: boolean; // alterado de active para ativo
  cloudinary_id: string;
}

export interface TeamPVItem {
  id: string;
  name: string;
  image: string;
  verified: boolean;
  cloudinary_id: string;
}

export interface AppSettings {
  promoSectionActive: boolean;
  prontaEntregaSectionActive: boolean;
  lancamentoSectionActive: boolean;
  teamPVSectionActive: boolean;
  activeLogoId: string;
  announcementBarActive: boolean;
}

export interface Announcement {
  id: string;
  nome: string;
  icone?: string;
  ativo: boolean;
  createdAt: any;
}

export type AppView = 'store' | 'admin' | 'login';
