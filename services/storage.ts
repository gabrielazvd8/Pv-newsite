
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo } from '../types';

const PRODUCTS_KEY = 'pv_products_v2';
const CATEGORIES_KEY = 'pv_categories_v2';
const SUBCATEGORIES_KEY = 'pv_subcategories_v2';
const SETTINGS_KEY = 'pv_settings_v2';
const CAROUSEL_KEY = 'pv_carousel_v2';
const LOGOS_KEY = 'pv_logos_v2';

export const getCategories = (): Category[] => {
  const stored = localStorage.getItem(CATEGORIES_KEY);
  return stored ? JSON.parse(stored) : [
    { id: 'cat1', name: 'Futebol Europeu', image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=400' },
    { id: 'cat2', name: 'Brasileirão', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=400' }
  ];
};

export const saveCategories = (data: Category[]) => localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data));

export const getSubcategories = (): Subcategory[] => {
  const stored = localStorage.getItem(SUBCATEGORIES_KEY);
  return stored ? JSON.parse(stored) : [
    { id: 'sub1', name: 'Premier League', categoryId: 'cat1', image: '' },
    { id: 'sub2', name: 'Série A', categoryId: 'cat2', image: '' }
  ];
};

export const saveSubcategories = (data: Subcategory[]) => localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(data));

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  const products: any[] = stored ? JSON.parse(stored) : [];
  return products.map(p => ({
    ...p,
    isLancamento: p.isLancamento ?? false,
    isPromo: p.isPromo ?? false,
    isProntaEntrega: p.isProntaEntrega ?? false,
    images: p.images || (p.image ? [p.image] : [])
  }));
};

export const saveProducts = (data: Product[]) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));

export const getCarouselImages = (): CarouselImage[] => {
  const stored = localStorage.getItem(CAROUSEL_KEY);
  const defaultCarousel = [
    { 
      id: 'h1',
      url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200', 
      title: 'LEGADO EUROPEU',
      subtitle: 'COLEÇÃO 24/25',
      active: true
    },
    { 
      id: 'h2',
      url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200', 
      title: 'SELEÇÕES DE ELITE',
      subtitle: 'O MUNDO EM CAMPO',
      active: true
    }
  ];
  return stored ? JSON.parse(stored) : defaultCarousel;
};

export const saveCarouselImages = (data: CarouselImage[]) => localStorage.setItem(CAROUSEL_KEY, JSON.stringify(data));

export const getLogos = (): Logo[] => {
  const stored = localStorage.getItem(LOGOS_KEY);
  const defaultLogos = [
    { id: 'default', url: 'assets/img/IMG_3069.PNG', name: 'Logo Padrão' }
  ];
  return stored ? JSON.parse(stored) : defaultLogos;
};

export const saveLogos = (data: Logo[]) => localStorage.setItem(LOGOS_KEY, JSON.stringify(data));

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const defaultSettings: AppSettings = { 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    activeLogoId: 'default'
  };
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
};

export const saveSettings = (settings: AppSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
