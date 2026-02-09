import { initializeApp } from "firebase/app";
import { 
  getFirestore, doc, setDoc, getDoc, getDocs, 
  collection, addDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, 
  writeBatch 
} from "firebase/firestore";
// Fix: Separated auth value imports and type-only imports to resolve issues with exported member recognition.
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut
} from "firebase/auth";
import type { User } from "firebase/auth";
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
const auth = getAuth(app);

// Exporting modular members from services/storage to prevent cross-file import issues in some environments
export { auth, onAuthStateChanged };
export type { User };

/**
 * VALIDAÇÃO DE ACESSO ADMIN
 */
export const checkAdminAccess = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  try {
    const adminRef = doc(db, "site_admin", user.uid);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists() && adminSnap.data().active === true) {
      return true;
    }
    
    // Se não for admin ativo, desloga
    await signOut(auth);
    return false;
  } catch (error) {
    console.error("Erro ao validar acesso admin:", error);
    await signOut(auth);
    return false;
  }
};

export const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const isAdmin = await checkAdminAccess(userCredential.user);
    if (!isAdmin) {
      throw new Error("Acesso não autorizado");
    }
    return true;
  } catch (error: any) {
    console.error("Login Error:", error.message);
    throw error;
  }
};

export const logoutAdmin = async () => {
  await signOut(auth);
};

/**
 * CONFIGURAÇÃO CLOUDINARY
 */
const CLOUDINARY_CONFIG = {
  CLOUD_NAME: 'dqvqkfkti',
  API_ENDPOINT: 'https://api.cloudinary.com/v1_1/dqvqkfkti/image/upload',
  API_KEY: '394625577664157',
  PRESETS: {
    LOGOS: 'pvsports_logos',
    BANNERS: 'pvsports_banners',
    TEAMPV: 'pvsports_teampv',
    MINIATURAS: 'pvsports_miniaturas',
    PRODUTOS: 'pvsports_miniaturas'
  },
  FOLDERS: {
    LOGOS: 'pvsports/Logos',
    BANNERS: 'pvsports/banners',
    TEAMPV: 'pvsports/Team_pv',
    MINIATURAS: 'pvsports/Miniaturas',
    PRODUTOS: 'pvsports/Produtos'
  }
};

const KEYS = {
  SITE_CONFIG: 'pv_site_config'
};

const getLocal = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try { return JSON.parse(data); } catch { return defaultValue; }
};

const setLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data));

export const deleteFromCloudinary = async (public_id: string, resourceType: 'image' | 'video' = 'image'): Promise<boolean> => {
  if (!public_id) return true;
  try {
    const destroyUrl = CLOUDINARY_CONFIG.API_ENDPOINT
      .replace('/image/', `/${resourceType}/`)
      .replace('/upload', '/destroy');
    const formData = new FormData();
    formData.append('public_id', public_id);
    formData.append('api_key', CLOUDINARY_CONFIG.API_KEY);
    await fetch(destroyUrl, { method: 'POST', body: formData });
    return true; 
  } catch (err) {
    console.warn("Cloudinary Destroy failed:", err);
    return true;
  }
};

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
  try {
    const docRef = doc(db, "site_config", "general_settings");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { ...defaultConfig, settings: docSnap.data() as AppSettings };
    }
  } catch (err) { console.warn("Erro ao carregar configurações do Firebase:", err); }
  return getLocal<any>(KEYS.SITE_CONFIG, defaultConfig);
};

export const uploadToCloudinary = async (file: File, type: 'logo' | 'banner' | 'teampv' | 'product' | 'category' | 'subcategory' | 'video'): Promise<{url: string, public_id: string}> => {
  const formData = new FormData();
  formData.append('file', file);
  
  let preset = CLOUDINARY_CONFIG.PRESETS.BANNERS;
  let folder = CLOUDINARY_CONFIG.FOLDERS.BANNERS;

  if (type === 'logo') { preset = CLOUDINARY_CONFIG.PRESETS.LOGOS; folder = CLOUDINARY_CONFIG.FOLDERS.LOGOS; }
  else if (type === 'teampv') { preset = CLOUDINARY_CONFIG.PRESETS.TEAMPV; folder = CLOUDINARY_CONFIG.FOLDERS.TEAMPV; }
  else if (type === 'category' || type === 'subcategory') { preset = CLOUDINARY_CONFIG.PRESETS.MINIATURAS; folder = CLOUDINARY_CONFIG.FOLDERS.MINIATURAS; }
  else if (type === 'product' || type === 'video') { preset = CLOUDINARY_CONFIG.PRESETS.PRODUTOS; folder = CLOUDINARY_CONFIG.FOLDERS.PRODUTOS; }
  
  formData.append('upload_preset', preset);
  formData.append('folder', folder);
  formData.append('resource_type', type === 'video' ? 'video' : 'image');

  const response = await fetch(CLOUDINARY_CONFIG.API_ENDPOINT, { method: 'POST', body: formData });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Cloudinary Error');
  return { url: data.secure_url, public_id: data.public_id };
};

// --- CATEGORIAS ---
export const getCategories = async (onlyActive = false): Promise<Category[]> => {
  try {
    const q = query(collection(db, "site_categorias"), orderBy("criadoEm", "desc"));
    const snap = await getDocs(q);
    const allCategories = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    return onlyActive ? allCategories.filter(cat => cat.ativo === true) : allCategories;
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    return [];
  }
};

export const saveCategory = async (cat: Partial<Category>) => {
  if (!cat.nome || !cat.midia) throw new Error("Campos obrigatórios ausentes");
  const data = { nome: cat.nome, midia: cat.midia, cloudinary_id: cat.cloudinary_id || null, ativo: cat.ativo ?? true, atualizadoEm: serverTimestamp() };
  if (cat.id) await updateDoc(doc(db, "site_categorias", cat.id), data);
  else await addDoc(collection(db, "site_categorias"), { ...data, criadoEm: serverTimestamp() });
};

export const deleteCategory = async (id: string) => {
  const docRef = doc(db, "site_categorias", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as Category;
    if (data.cloudinary_id) await deleteFromCloudinary(data.cloudinary_id);
  }
  await deleteDoc(docRef);
};

// --- SUBCATEGORIAS ---
export const getSubcategories = async (onlyActive = false): Promise<Subcategory[]> => {
  try {
    const q = query(collection(db, "site_subcategorias"), orderBy("nome", "asc"));
    const snap = await getDocs(q);
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Subcategory));
    return onlyActive ? all.filter(s => s.ativo) : all;
  } catch (err) {
    console.error("Erro ao buscar subcategorias:", err);
    return [];
  }
};

export const saveSubcategory = async (sub: Partial<Subcategory>) => {
  if (!sub.nome || !sub.categoriaId || !sub.midia) throw new Error("Preencha Nome, Categoria e Mídia");
  const data = { 
    nome: sub.nome, 
    categoriaId: sub.categoriaId, 
    categoriaNome: sub.categoriaNome || '',
    midia: sub.midia, 
    cloudinary_id: sub.cloudinary_id || null,
    ativo: sub.ativo ?? true,
    ordem: sub.ordem || 0,
    atualizadoEm: serverTimestamp()
  };
  if (sub.id) await updateDoc(doc(db, "site_subcategorias", sub.id), data);
  else await addDoc(collection(db, "site_subcategorias"), { ...data, criadoEm: serverTimestamp() });
};

export const deleteSubcategory = async (id: string) => {
  const docRef = doc(db, "site_subcategorias", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as Subcategory;
    if (data.cloudinary_id) await deleteFromCloudinary(data.cloudinary_id);
  }
  await deleteDoc(docRef);
};

// --- PRODUTOS ---
export const getProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, "site_produtos"), orderBy("criadoEm", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    return [];
  }
};

export const saveProduct = async (p: Partial<Product>) => {
  if (!p.categoryId || !p.subcategoryId) throw new Error("Categoria e Subcategoria são obrigatórias");
  const data = {
    name: p.name,
    description: p.description,
    categoryId: p.categoryId,
    categoryName: p.categoryName || '',
    subcategoryId: p.subcategoryId,
    subcategoryName: p.subcategoryName || '',
    image: p.images?.[0] || '',
    images: p.images || [],
    cloudinary_ids: p.cloudinary_ids || [],
    video: p.video || null,
    video_cloudinary_id: p.video_cloudinary_id || null,
    isProntaEntrega: p.isProntaEntrega ?? false,
    isLancamento: p.isLancamento ?? false,
    isPromo: p.isPromo ?? false,
    price: p.price || '',
    oldPrice: p.oldPrice || '',
    ativo: p.ativo ?? true,
    atualizadoEm: serverTimestamp()
  };
  if (p.id) await updateDoc(doc(db, "site_produtos", p.id), data);
  else await addDoc(collection(db, "site_produtos"), { ...data, criadoEm: serverTimestamp() });
};

export const updateProductStatus = async (id: string, updates: Partial<Product>) => {
  await updateDoc(doc(db, "site_produtos", id), {
    ...updates,
    atualizadoEm: serverTimestamp()
  });
};

export const deleteProduct = async (id: string) => {
  const docRef = doc(db, "site_produtos", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data() as Product;
    if (data.cloudinary_ids) {
      for (const cid of data.cloudinary_ids) await deleteFromCloudinary(cid, 'image');
    }
    if (data.video_cloudinary_id) await deleteFromCloudinary(data.video_cloudinary_id, 'video');
  }
  await deleteDoc(docRef);
};

// --- BANNERS, LOGOS, TEAM PV ---
export const getCarouselImages = async (): Promise<CarouselImage[]> => {
  try {
    const q = query(collection(db, "site_banners"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        url: data.image, 
        cloudinary_id: data.cloudinary_id, 
        title: data.title || '',
        subtitle: data.subtitle || '',
        align: data.align || 'center',
        active: data.active ?? true 
      } as CarouselImage;
    });
  } catch (err) { 
    console.error("Erro ao buscar banners:", err);
    return []; 
  }
};

export const saveCarouselImage = async (item: Partial<CarouselImage>) => {
  const data = { 
    image: item.url, 
    cloudinary_id: item.cloudinary_id, 
    title: item.title || '', 
    subtitle: item.subtitle || '', 
    align: item.align || 'center', 
    active: item.active ?? true, 
    updatedAt: serverTimestamp() 
  };
  if (item.id) await updateDoc(doc(db, "site_banners", item.id), data);
  else await addDoc(collection(db, "site_banners"), { ...data, createdAt: serverTimestamp() });
};

export const deleteCarouselImage = async (id: string) => {
  const docRef = doc(db, "site_banners", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.cloudinary_id) await deleteFromCloudinary(data.cloudinary_id);
  }
  await deleteDoc(docRef);
};

export const getLogos = async (): Promise<Logo[]> => {
  try {
    const q = query(collection(db, "site_logos"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        nome: data.nome || data.name || '',
        midia_url: data.midia_url || data.url || '',
        ativo: data.ativo ?? data.active ?? false,
        cloudinary_id: data.cloudinary_id || ''
      } as Logo;
    });
  } catch (err) { return []; }
};

export const saveLogo = async (logo: Partial<Logo>) => {
  if (!logo.nome || !logo.midia_url) throw new Error("Preencha Nome e Mídia da Logo");
  const data = { 
    nome: logo.nome, 
    midia_url: logo.midia_url, 
    cloudinary_id: logo.cloudinary_id || '', 
    ativo: logo.ativo ?? false, 
    updatedAt: serverTimestamp() 
  };
  if (logo.id) {
    await updateDoc(doc(db, "site_logos", logo.id), data);
  } else {
    await addDoc(collection(db, "site_logos"), { 
      ...data, 
      createdAt: serverTimestamp() 
    });
  }
};

export const setActiveLogo = async (id: string) => {
  const logos = await getLogos();
  const batch = writeBatch(db);
  logos.forEach(l => { 
    batch.update(doc(db, "site_logos", l.id), { ativo: l.id === id }); 
  });
  await batch.commit();
};

export const deleteLogo = async (id: string) => {
  const docRef = doc(db, "site_logos", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    const cid = data.cloudinary_id || data.public_id;
    if (cid) await deleteFromCloudinary(cid);
  }
  await deleteDoc(docRef);
};

export const getTeamPVItems = async (): Promise<TeamPVItem[]> => {
  try {
    const q = query(collection(db, "site_teampv"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, name: d.data().name, image: d.data().url, cloudinary_id: d.data().cloudinary_id, verified: true }));
  } catch (err) { return []; }
};

export const saveTeamPVItem = async (item: Partial<TeamPVItem>) => {
  const data = { name: item.name, url: item.image, cloudinary_id: item.cloudinary_id, verified: true, updatedAt: serverTimestamp() };
  if (item.id) await updateDoc(doc(db, "site_teampv", item.id), data);
  else await addDoc(collection(db, "site_teampv"), { ...data, createdAt: serverTimestamp() });
};

export const deleteTeamPVItem = async (id: string) => {
  const docRef = doc(db, "site_teampv", id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.cloudinary_id) await deleteFromCloudinary(data.cloudinary_id);
  }
  await deleteDoc(docRef);
};

export const saveSettings = async (s: AppSettings) => {
  try {
    await setDoc(doc(db, "site_config", "general_settings"), s);
    setLocal(KEYS.SITE_CONFIG, { ...(await getSiteConfig()), settings: s });
  } catch (err) { console.error("Erro ao salvar settings:", err); }
};

export const getSettings = async (): Promise<AppSettings> => {
  const config = await getSiteConfig();
  return config.settings;
};