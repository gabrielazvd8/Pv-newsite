
import { Product, Category, Subcategory, AppSettings } from '../types';

const PRODUCTS_KEY = 'pv_products_v2';
const CATEGORIES_KEY = 'pv_categories_v2';
const SUBCATEGORIES_KEY = 'pv_subcategories_v2';
const SETTINGS_KEY = 'pv_settings_v2';

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
  const products: Product[] = stored ? JSON.parse(stored) : [
    {
      id: 'p1',
      name: "Manchester City Home 24/25",
      categoryId: 'cat1',
      subcategoryId: 'sub1',
      image: "https://images.unsplash.com/photo-1622146924843-09405625c15e?auto=format&fit=crop&q=80&w=800",
      description: "Edição especial com detalhes em relevo.",
      isProntaEntrega: true,
      isLancamento: true
    }
  ];
  // Ensure backward compatibility for the new flag
  return products.map(p => ({
    ...p,
    isLancamento: p.isLancamento ?? false
  }));
};

export const saveProducts = (data: Product[]) => localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data));

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  const defaultSettings = { prontaEntregaSectionActive: true, lancamentoSectionActive: true };
  return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
};

export const saveSettings = (settings: AppSettings) => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
