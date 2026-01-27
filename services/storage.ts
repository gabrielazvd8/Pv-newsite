
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo, TeamPVItem } from '../types';

// Configurações Cloudinary
const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dqvqkfkti',
  LOGOS: {
    PRESET: 'pvsports_logo',
    FOLDER: 'pvsports/logos',
    TRANSFORM: 'h_80,c_scale'
  },
  BANNERS: {
    PRESET: 'pvsports_banners',
    FOLDER: 'pvsports/banners',
    TRANSFORM: 'w_1600,h_600,c_fill,g_center'
  }
};

// Chaves para simular os arquivos JSON
const KEYS = {
  CATEGORIAS: 'pv_data_categorias',
  SUBCATEGORIAS: 'pv_data_subcategorias',
  PRODUTOS: 'pv_data_produtos',
  CARROSSEL: 'pv_data_carrossel',
  SETTINGS: 'pv_data_configuracoes',
  LOGOS: 'pv_data_logos',
  TEAMPV: 'pv_data_teampv'
};

// Funções Auxiliares de Persistência
const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- CATEGORIAS ---
export const getCategories = async (): Promise<Category[]> => {
  return getLocal<Category[]>(KEYS.CATEGORIAS, []);
};

export const saveCategories = async (data: Category[]) => {
  const current = await getCategories();
  const updated = [...current];
  data.forEach(newItem => {
    const idx = updated.findIndex(item => item.id === newItem.id);
    if (idx >= 0) updated[idx] = newItem;
    else updated.push(newItem);
  });
  setLocal(KEYS.CATEGORIAS, updated);
};

// --- SUBCATEGORIAS ---
export const getSubcategories = async (): Promise<Subcategory[]> => {
  return getLocal<Subcategory[]>(KEYS.SUBCATEGORIAS, []);
};

export const saveSubcategories = async (data: Subcategory[]) => {
  const current = await getSubcategories();
  const updated = [...current];
  data.forEach(newItem => {
    const idx = updated.findIndex(item => item.id === newItem.id);
    if (idx >= 0) updated[idx] = newItem;
    else updated.push(newItem);
  });
  setLocal(KEYS.SUBCATEGORIAS, updated);
};

// --- PRODUTOS ---
export const getProducts = async (): Promise<Product[]> => {
  return getLocal<Product[]>(KEYS.PRODUTOS, []);
};

export const saveProducts = async (data: Product[]) => {
  const current = await getProducts();
  const updated = [...current];
  data.forEach(newItem => {
    const idx = updated.findIndex(item => item.id === newItem.id);
    if (idx >= 0) updated[idx] = newItem;
    else updated.push(newItem);
  });
  setLocal(KEYS.PRODUTOS, updated);
};

export const saveProduct = async (product: Product) => {
  const products = await getProducts();
  const idx = products.findIndex(p => p.id === product.id);
  if (idx >= 0) {
    products[idx] = product;
  } else {
    products.unshift(product);
  }
  setLocal(KEYS.PRODUTOS, products);
};

export const deleteProduct = async (id: string) => {
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== id);
  setLocal(KEYS.PRODUTOS, filtered);
};

// --- CARROSSEL ---
export const getCarouselImages = async (): Promise<CarouselImage[]> => {
  return getLocal<CarouselImage[]>(KEYS.CARROSSEL, []);
};

export const saveCarouselImages = async (data: CarouselImage[]) => {
  const current = await getCarouselImages();
  const updated = [...current];
  data.forEach(newItem => {
    const idx = updated.findIndex(item => item.id === newItem.id);
    if (idx >= 0) updated[idx] = newItem;
    else updated.push(newItem);
  });
  setLocal(KEYS.CARROSSEL, updated);
};

export const deleteCarouselImage = async (id: string) => {
  const images = await getCarouselImages();
  const filtered = images.filter(img => img.id !== id);
  setLocal(KEYS.CARROSSEL, filtered);
};

// --- LOGOS ---
export const getLogos = async (): Promise<Logo[]> => {
  return getLocal<Logo[]>(KEYS.LOGOS, []);
};

export const saveLogos = async (data: Logo[]) => {
  const current = await getLogos();
  const updated = [...current];
  data.forEach(newItem => {
    const idx = updated.findIndex(item => item.id === newItem.id);
    if (idx >= 0) updated[idx] = newItem;
    else updated.push(newItem);
  });
  setLocal(KEYS.LOGOS, updated);
};

// --- TEAM PV ---
export const getTeamPVItems = async (): Promise<TeamPVItem[]> => {
  return getLocal<TeamPVItem[]>(KEYS.TEAMPV, []);
};

export const saveTeamPVItem = async (item: TeamPVItem) => {
  const items = await getTeamPVItems();
  const idx = items.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  setLocal(KEYS.TEAMPV, items);
};

export const deleteTeamPVItem = async (id: string) => {
  const items = await getTeamPVItems();
  const filtered = items.filter(i => i.id !== id);
  setLocal(KEYS.TEAMPV, filtered);
};

// --- CONFIGURAÇÕES ---
export const getSettings = async (): Promise<AppSettings> => {
  const defaultSettings: AppSettings = { 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    teamPVSectionActive: false,
    activeLogoId: 'default'
  };
  return getLocal<AppSettings>(KEYS.SETTINGS, defaultSettings);
};

export const saveSettings = async (settings: AppSettings) => {
  setLocal(KEYS.SETTINGS, settings);
};

/**
 * Upload para Cloudinary (Unsigned)
 * Suporta presets de Logo e Banners
 */
export const uploadToCloudinary = async (file: File, type: 'logo' | 'banner'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const config = type === 'logo' ? CLOUDINARY_CONFIG.LOGOS : CLOUDINARY_CONFIG.BANNERS;
  
  formData.append('upload_preset', config.PRESET);
  formData.append('folder', config.FOLDER);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Falha no upload para o Cloudinary');
    }

    const data = await response.json();
    let secureUrl = data.secure_url;
    
    // Injeta transformações na URL
    if (secureUrl.includes('/upload/')) {
      secureUrl = secureUrl.replace('/upload/', `/upload/${config.TRANSFORM}/`);
    }
    
    return secureUrl;
  } catch (error: any) {
    console.error('Cloudinary Error:', error);
    throw error;
  }
};

export const uploadLocalFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
