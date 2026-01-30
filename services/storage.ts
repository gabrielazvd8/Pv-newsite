
import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, 
  collection, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, 
  writeBatch 
} from "firebase/firestore";
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo, TeamPVItem } from '../types';

/**
 * CONFIGURAÇÃO FIREBASE
 */
const firebaseConfig = {
  apiKey: "AIzaSyCNDm1UZofjnOVJ3zeulHPBp-gksETDAGk",
  authDomain: "pv-sports-726c0.firebaseapp.com",
  projectId: "pv-sports-726c0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * CONFIGURAÇÃO CLOUDINARY
 */
const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dqvqkfkti',
  API_ENDPOINT: 'https://api.cloudinary.com/v1_1/dqvqkfkti/image/upload',
  PRESETS: {
    LOGOS: 'pvsports_logo',
    BANNERS: 'pvsports_banners',
    TEAMPV: 'pvsports_teampv',
    MINIATURAS: 'pvsports_miniaturas'
  },
  FOLDERS: {
    LOGOS: 'pvsports/logos',
    BANNERS: 'pvsports/banners',
    TEAMPV: 'pvsports/Team_pv',
    MINIATURAS: 'pvsports/Miniaturas'
  }
};

const KEYS = {
  SITE_CONFIG: 'pv_site_config',
  PRODUTOS: 'pv_data_produtos'
};

const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try { return JSON.parse(data); } catch { return defaultValue; }
};

const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const getSiteConfig = async (): Promise<any> => {
  const defaultConfig = {
    logo: null,
    settings: {
      promoSectionActive: false,
      prontaEntregaSectionActive: true,
      lancamentoSectionActive: true,
      teamPVSectionActive: false,
      activeLogoId: 'default'
    }
  };
  let config = getLocal<any>(KEYS.SITE_CONFIG, defaultConfig);
  try {
    const q = query(collection(db, "site_logos"), where("active", "==", true));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const fbData = snap.docs[0].data();
      config.logo = { id: snap.docs[0].id, url: fbData.url, name: fbData.name, active: true };
    }
  } catch (err) { console.warn(err); }
  return config;
};

export const uploadToCloudinary = async (file: File, type: 'logo' | 'banner' | 'teampv' | 'product' | 'category'): Promise<{url: string, public_id: string}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  let preset = CLOUDINARY_CONFIG.PRESETS.BANNERS;
  let folder = CLOUDINARY_CONFIG.FOLDERS.BANNERS;

  if (type === 'logo') { preset = CLOUDINARY_CONFIG.PRESETS.LOGOS; folder = CLOUDINARY_CONFIG.FOLDERS.LOGOS; }
  else if (type === 'teampv') { preset = CLOUDINARY_CONFIG.PRESETS.TEAMPV; folder = CLOUDINARY_CONFIG.FOLDERS.TEAMPV; }
  else if (type === 'category') { preset = CLOUDINARY_CONFIG.PRESETS.MINIATURAS; folder = CLOUDINARY_CONFIG.FOLDERS.MINIATURAS; }
  
  formData.append('upload_preset', preset);
  formData.append('folder', folder);

  const response = await fetch(CLOUDINARY_CONFIG.API_ENDPOINT, { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Cloudinary Error');
  return { url: data.secure_url, public_id: data.public_id };
};

// --- CATEGORIAS (FIREBASE 'categorias') ---
export const getCategories = async (onlyActive = false): Promise<Category[]> => {
  try {
    let q = query(collection(db, "categorias"), orderBy("nome", "asc"));
    if (onlyActive) q = query(collection(db, "categorias"), where("ativo", "==", true), orderBy("nome", "asc"));
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const saveCategory = async (cat: Partial<Category>) => {
  if (cat.id) {
    await updateDoc(doc(db, "categorias", cat.id), { ...cat, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, "categorias"), { ...cat, ativo: true, createdAt: serverTimestamp() });
  }
};

export const deleteCategory = async (id: string) => await deleteDoc(doc(db, "categorias", id));

// --- SUBCATEGORIAS (FIREBASE 'subcategorias') ---
export const getSubcategories = async (onlyActive = false): Promise<Subcategory[]> => {
  try {
    let q = query(collection(db, "subcategorias"), orderBy("nome", "asc"));
    if (onlyActive) q = query(collection(db, "subcategorias"), where("ativo", "==", true), orderBy("nome", "asc"));
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subcategory));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const saveSubcategory = async (sub: Partial<Subcategory>) => {
  if (sub.id) {
    await updateDoc(doc(db, "subcategorias", sub.id), { ...sub, updatedAt: serverTimestamp() });
  } else {
    await addDoc(collection(db, "subcategorias"), { ...sub, ativo: true, createdAt: serverTimestamp() });
  }
};

export const deleteSubcategory = async (id: string) => await deleteDoc(doc(db, "subcategorias", id));

// --- OUTROS ---
export const getProducts = async (): Promise<Product[]> => getLocal<Product[]>(KEYS.PRODUTOS, []);
export const saveProduct = async (p: Product) => {
  const prods = await getProducts();
  const i = prods.findIndex(x => x.id === p.id);
  if (i >= 0) prods[i] = p; else prods.unshift(p);
  setLocal(KEYS.PRODUTOS, prods);
};
export const deleteProduct = async (id: string) => setLocal(KEYS.PRODUTOS, (await getProducts()).filter(x => x.id !== id));

export const getCarouselImages = async (): Promise<CarouselImage[]> => {
  const q = query(collection(db, "site_banners"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, url: d.data().image, ...d.data(), active: true } as any));
};

export const saveCarouselImage = async (item: any) => {
  if (item.id && !item.id.startsWith('slide_')) await updateDoc(doc(db, "site_banners", item.id), { ...item, updatedAt: serverTimestamp() });
  else await addDoc(collection(db, "site_banners"), { ...item, image: item.url, createdAt: serverTimestamp() });
};

export const deleteCarouselImage = async (id: string) => await deleteDoc(doc(db, "site_banners", id));

export const getLogos = async (): Promise<Logo[]> => {
  const q = query(collection(db, "site_logos"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as any));
};

export const saveLogos = async (data: Logo[]) => await addDoc(collection(db, "site_logos"), { ...data[0], active: false, createdAt: serverTimestamp() });

export const setActiveLogo = async (id: string) => {
  const logos = await getLogos();
  const batch = writeBatch(db);
  logos.forEach(l => batch.update(doc(db, "site_logos", l.id), { active: l.id === id }));
  await batch.commit();
};

export const deleteLogo = async (id: string) => await deleteDoc(doc(db, "site_logos", id));

export const getTeamPVItems = async (): Promise<TeamPVItem[]> => {
  const q = query(collection(db, "site_teampv"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, name: d.data().name, image: d.data().url, verified: true }));
};

export const saveTeamPVItem = async (item: any) => await addDoc(collection(db, "site_teampv"), { name: item.name, url: item.url, verified: true, createdAt: serverTimestamp() });
export const deleteTeamPVItem = async (id: string) => await deleteDoc(doc(db, "site_teampv", id));

export const getSettings = async (): Promise<AppSettings> => (await getSiteConfig()).settings;
export const saveSettings = async (s: AppSettings) => setLocal(KEYS.SITE_CONFIG, { ...(await getSiteConfig()), settings: s });
