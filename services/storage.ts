
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo } from '../types';
import { supabase } from './supabase';

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) return [];
  return data as Category[];
};

export const saveCategories = async (data: Category[]) => {
  await supabase.from('categories').upsert(data);
};

export const getSubcategories = async (): Promise<Subcategory[]> => {
  const { data, error } = await supabase.from('subcategories').select('*').order('name');
  if (error) return [];
  return data as Subcategory[];
};

export const saveSubcategories = async (data: Subcategory[]) => {
  await supabase.from('subcategories').upsert(data);
};

export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data as any[]).map(p => ({
    ...p,
    isLancamento: p.isLancamento ?? false,
    isPromo: p.isPromo ?? false,
    isProntaEntrega: p.isProntaEntrega ?? false,
    images: Array.isArray(p.images) ? p.images : (p.image ? [p.image] : [])
  })) as Product[];
};

export const saveProducts = async (data: Product[]) => {
  // Upsert sincroniza o estado local com o remoto
  await supabase.from('products').upsert(data);
};

export const saveProduct = async (product: Product) => {
  const { error } = await supabase.from('products').upsert(product);
  if (error) throw error;
};

export const deleteProduct = async (id: string) => {
  await supabase.from('products').delete().eq('id', id);
};

export const getCarouselImages = async (): Promise<CarouselImage[]> => {
  const { data, error } = await supabase.from('carousel').select('*');
  if (error) return [];
  return data as CarouselImage[];
};

export const saveCarouselImages = async (data: CarouselImage[]) => {
  await supabase.from('carousel').upsert(data);
};

export const getLogos = async (): Promise<Logo[]> => {
  const { data, error } = await supabase.from('logos').select('*');
  if (error) return [];
  return data as Logo[];
};

export const saveLogos = async (data: Logo[]) => {
  await supabase.from('logos').upsert(data);
};

export const getSettings = async (): Promise<AppSettings> => {
  const { data, error } = await supabase.from('settings').select('*').single();
  const defaultSettings: AppSettings = { 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    activeLogoId: 'default'
  };
  if (error || !data) return defaultSettings;
  return { ...defaultSettings, ...data } as AppSettings;
};

export const saveSettings = async (settings: AppSettings) => {
  await supabase.from('settings').upsert({ id: 1, ...settings });
};
