
/** @AI_LOCKED */

import React, { useState, useEffect, useRef } from 'react';
import * as storage from '../../services/storage';
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo, TeamPVItem } from '../../types';
// Fix: Import onAuthStateChanged and auth exclusively from storage service to resolve environment-specific export issues
import { auth, onAuthStateChanged } from "../../services/storage";

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, onUpdate }) => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [tab, setTab] = useState<'products' | 'categories' | 'subcategories' | 'settings'>('products');
  // Fix: Renamed 'carrossel' to 'carousel' in the state type to match comparisons and ID usage
  const [subTab, setSubTab] = useState<'sections' | 'carousel' | 'logo' | 'teampv'>('sections');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [teamPVItems, setTeamPVItems] = useState<TeamPVItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    teamPVSectionActive: false,
    activeLogoId: 'default'
  });
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentGallery, setCurrentGallery] = useState<{url: string, cid: string}[]>([]);
  const [currentVideo, setCurrentVideo] = useState<{url: string, cid: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Protetor de Sessão (usando onAuthStateChanged exportado do storage service)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        onLogout();
        return;
      }
      
      const hasAccess = await storage.checkAdminAccess(user);
      if (!hasAccess) {
        alert("Sua permissão de administrador foi revogada.");
        onLogout();
        return;
      }
      
      setIsVerifying(false);
      loadData();
    });

    return () => unsubscribe();
  }, [onLogout]);

  const loadData = async () => {
    try {
      const [p, c, s, ci, l, sett, tpv] = await Promise.all([
        storage.getProducts(),
        storage.getCategories(),
        storage.getSubcategories(),
        storage.getCarouselImages(),
        storage.getLogos(),
        storage.getSettings(),
        storage.getTeamPVItems()
      ]);
      setProducts(p);
      setCategories(c);
      setSubcategories(s);
      setCarouselImages(ci);
      setLogos(l);
      setSettings(sett);
      setTeamPVItems(tpv);
    } catch (err) { console.error("Erro ao carregar dados ADM:", err); }
  };

/* ===== 🔒 BLOCO PROTEGIDO ===== */
/* NÃO MODIFICAR ESTE TRECHO */

  // Using DeepSeek API via internal route to generate professional product descriptions
  const handleGenerateAIDescription = async () => {
    const form = document.querySelector('form');
    if (!form) return;

    const nameInput = form.elements.namedItem('name') as HTMLInputElement;
    const name = nameInput?.value;

    if (!name || name.trim() === '') {
      alert("Digite o nome para a IA.");
      return;
    }

    setIsGeneratingDescription(true);

    try {
      const response = await fetch('/api/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: name }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor /api/deepseek');
      }

      const data = await response.json();

      if (!data || !data.text) {
        console.error("Resposta inesperada da IA:", data);
        alert("A IA não retornou texto.");
        return;
      }

      const descArea = form.elements.namedItem('description') as HTMLTextAreaElement;
      if (descArea) {
        descArea.value = data.text.trim();
      }

    } catch (err) {
      console.error("DeepSeek AI Error:", err);
      alert("Erro ao gerar descrição com IA.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

/* ===== 🔒 FIM BLOCO PROTEGIDO ===== */

  const handleToggleStatus = async (id: string, field: 'isPromo' | 'isLancamento' | 'isProntaEntrega', currentVal: boolean) => {
    try {
      await storage.updateProductStatus(id, { [field]: !currentVal });
      await loadData();
      onUpdate();
    } catch (err) {
      alert("Erro ao atualizar status: " + err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'logo' | 'banner' | 'teampv' | 'category' | 'subcategory') => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of files) {
        const data = await storage.uploadToCloudinary(file, type === 'video' ? 'video' : type as any);
        if (type === 'video') setCurrentVideo({ url: data.url, cid: data.public_id });
        else if (type === 'teampv' || type === 'logo' || type === 'banner') {
            if (type === 'logo') {
                setCurrentGallery([{url: data.url, cid: data.public_id}]);
            } else if (type === 'teampv' || type === 'banner') {
                setCurrentGallery([{url: data.url, cid: data.public_id}]);
            }
        } else {
            setCurrentGallery(prev => (tab === 'categories' || tab === 'subcategories' ? [{url: data.url, cid: data.public_id}] : [...prev, {url: data.url, cid: data.public_id}]));
        }
      }
    } catch (err) { alert("Erro upload: " + err); } finally { setIsUploading(false); if (e.target) e.target.value = ''; }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get('name') as string;
    const catId = fd.get('categoryId') as string;
    const subId = fd.get('subcategoryId') as string;
    if (!name || !catId || !subId || currentGallery.length === 0) return alert("Preencha Nome, Categoria, Subcategoria e Mídia.");
    const cat = categories.find(c => c.id === catId);
    const sub = subcategories.find(s => s.id === subId);
    setIsUploading(true);
    try {
      await storage.saveProduct({
        id: editingItem?.id,
        name,
        description: fd.get('description') as string,
        categoryId: catId,
        categoryName: cat?.nome,
        subcategoryId: subId,
        subcategoryName: sub?.nome,
        images: currentGallery.map(g => g.url),
        cloudinary_ids: currentGallery.map(g => g.cid),
        video: currentVideo?.url || null,
        video_cloudinary_id: currentVideo?.cid || null,
        price: fd.get('price') as string,
        oldPrice: fd.get('oldPrice') as string,
        isPromo: fd.get('isPromo') === 'on',
        isLancamento: fd.get('isLancamento') === 'on',
        isProntaEntrega: fd.get('isProntaEntrega') === 'on',
        ativo: fd.get('ativo') === 'on'
      });
      resetForm(); await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get('nome') as string;
    const catId = fd.get('categoriaId') as string;
    if (!name || !catId || currentGallery.length === 0) return alert("Preencha todos os campos.");
    const cat = categories.find(c => c.id === catId);
    setIsUploading(true);
    try {
      await storage.saveSubcategory({
        id: editingItem?.id,
        nome: name,
        categoriaId: catId,
        categoriaNome: cat?.nome,
        midia: currentGallery[0].url,
        cloudinary_id: currentGallery[0].cid,
        ativo: fd.get('ativo') === 'on'
      });
      resetForm(); await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const handleSaveLogo = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const nome = fd.get('logo_nome') as string;
    if (!nome || currentGallery.length === 0) return alert("Preencha o nome e envie a imagem da logo.");
    setIsUploading(true);
    try {
      await storage.saveLogo({
        id: editingItem?.id,
        nome: nome,
        midia_url: currentGallery[0].url,
        cloudinary_id: currentGallery[0].cid,
        ativo: editingItem?.ativo ?? false
      });
      resetForm(); await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const handleSaveCarousel = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const title = fd.get('bannerTitle') as string;
    const subtitle = fd.get('bannerSubtitle') as string;
    const align = fd.get('bannerAlign') as any;
    if (currentGallery.length === 0) return alert("Envie uma imagem para o banner.");
    setIsUploading(true);
    try {
      await storage.saveCarouselImage({
        id: editingItem?.id,
        url: currentGallery[0].url,
        cloudinary_id: currentGallery[0].cid,
        title: title || "",
        subtitle: subtitle || "",
        align: align || "center",
        active: editingItem?.active ?? true
      });
      resetForm(); await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const handleSaveTeamPV = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const name = fd.get('teamPvName') as string;
    if (currentGallery.length === 0) return alert("Envie uma imagem para o Team PV.");
    setIsUploading(true);
    try {
      await storage.saveTeamPVItem({
        id: editingItem?.id,
        name: name || "",
        image: currentGallery[0].url,
        cloudinary_id: currentGallery[0].cid
      });
      resetForm(); await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const handleDelete = async (id: string, type: any) => {
    if (!confirm('Deseja excluir permanentemente?')) return;
    setIsUploading(true);
    try {
      if (type === 'product') await storage.deleteProduct(id);
      else if (type === 'category') await storage.deleteCategory(id);
      else if (type === 'subcategory') await storage.deleteSubcategory(id);
      else if (type === 'logo') await storage.deleteLogo(id);
      else if (type === 'banner') await storage.deleteCarouselImage(id);
      else if (type === 'teampv') await storage.deleteTeamPVItem(id);
      await loadData(); onUpdate();
    } catch (err) { alert(err); } finally { setIsUploading(false); }
  };

  const resetForm = () => {
    setEditingItem(null); setCurrentGallery([]); setCurrentVideo(null);
    const f = document.querySelector('form'); if (f) f.reset();
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    if (tab === 'products') {
      const g = (item.images || []).map((url: string, i: number) => ({ url, cid: item.cloudinary_ids?.[i] || '' }));
      setCurrentGallery(g); setCurrentVideo(item.video ? { url: item.video, cid: item.video_cloudinary_id } : null);
    } else if (tab === 'settings' && subTab === 'logo') {
      setCurrentGallery([{url: item.midia_url, cid: item.cloudinary_id}]);
    } else if (tab === 'settings' && subTab === 'carousel') {
      setCurrentGallery([{url: item.url, cid: item.cloudinary_id}]);
    } else if (tab === 'settings' && subTab === 'teampv') {
      setCurrentGallery([{url: item.image, cid: item.cloudinary_id}]);
    } else {
      setCurrentGallery([{url: item.midia || item.url || item.image, cid: item.cloudinary_id || ''}]);
    }
  };

  const activeProducts = products.filter(p => p.ativo !== false);

  if (isVerifying) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[500]">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Autenticando Sessão...</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      {isUploading && (
        <div className="fixed inset-0 bg-black/95 z-[300] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs uppercase font-black tracking-widest animate-pulse">Sincronizando Mídia & Banco...</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">PV ADMIN <span className="text-green-500">PRO</span></h1>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={onBack} className="flex-1 md:flex-none px-6 py-3 bg-zinc-900 text-[10px] uppercase font-black rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all">Vitrine</button>
          <button onClick={onLogout} className="flex-1 md:flex-none px-6 py-3 bg-red-950/20 text-red-500 text-[10px] uppercase font-black rounded-xl border border-red-950/40 hover:bg-red-950/60 transition-all">Sair</button>
        </div>
      </div>

      <nav className="flex gap-2 mb-8 md:mb-12 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0">
        {[
          {id: 'products', label: 'Produtos'},
          {id: 'categories', label: 'Categorias'},
          {id: 'subcategories', label: 'Subcategorias'},
          {id: 'settings', label: 'Geral'}
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setTab(t.id as any); resetForm(); }}
            className={`px-5 md:px-8 py-3 md:py-4 text-[9px] md:text-[10px] uppercase font-black tracking-widest transition-all rounded-xl border whitespace-nowrap ${tab === t.id ? 'bg-zinc-900 text-green-500 border-zinc-800' : 'text-zinc-600 border-transparent hover:text-zinc-400'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {tab !== 'settings' ? (
          <>
            <div className="lg:col-span-5">
              <div className="bg-zinc-950 p-5 sm:p-8 border border-zinc-900 rounded-[24px] sm:rounded-[30px] lg:sticky lg:top-8 shadow-2xl">
                <h2 className="text-xl font-black mb-8 italic uppercase">{editingItem ? 'Editar' : 'Criar'} {tab}</h2>
                <form onSubmit={tab === 'products' ? handleSaveProduct : tab === 'subcategories' ? handleSaveSubcategory : (e: any) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  storage.saveCategory({ id: editingItem?.id, nome: fd.get('nome') as string, midia: currentGallery[0]?.url, cloudinary_id: currentGallery[0]?.cid, ativo: fd.get('ativo') === 'on' })
                    .then(() => { resetForm(); loadData(); onUpdate(); });
                }} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Nome</label>
                    <input type="text" name={tab === 'products' ? "name" : "nome"} defaultValue={editingItem?.name || editingItem?.nome} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" required />
                  </div>
                  
                  {tab === 'subcategories' && (
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Vincular Categoria</label>
                      <select name="categoriaId" defaultValue={editingItem?.categoriaId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" required>
                        <option value="">Selecione a Categoria Pai...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                  )}

                  {(tab === 'categories' || tab === 'subcategories') && (
                    <div className="flex items-center gap-2 p-4 bg-black border border-zinc-800 rounded-xl">
                      <label className="text-[9px] uppercase font-black flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          name="ativo" 
                          defaultChecked={editingItem ? (editingItem.ativo !== false) : true} 
                          className="accent-green-500" 
                        /> 
                        Status Ativo
                      </label>
                    </div>
                  )}

                  {tab === 'products' && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center px-2">
                           <label className="text-[9px] uppercase font-black text-zinc-600">Descrição</label>
                           <button 
                             type="button" 
                             onClick={handleGenerateAIDescription} 
                             disabled={isGeneratingDescription}
                             className="text-[9px] font-black text-green-500 uppercase disabled:opacity-50 transition-all hover:scale-105"
                           >
                             {isGeneratingDescription ? '✨ Gerando...' : '✨ IA'}
                           </button>
                        </div>
                        <textarea name="description" defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl h-24 focus:border-green-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <select name="categoryId" defaultValue={editingItem?.categoryId} className="bg-black border border-zinc-800 p-4 text-sm rounded-xl outline-none focus:border-green-500" required>
                          <option value="">Categoria...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        <select name="subcategoryId" defaultValue={editingItem?.subcategoryId} className="bg-black border border-zinc-800 p-4 text-sm rounded-xl outline-none focus:border-green-500" required>
                          <option value="">Subcategoria...</option>
                          {subcategories.map(s => <option key={s.id} value={s.id}>{s.nome} ({s.categoriaNome})</option>)}
                        </select>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input type="text" name="price" placeholder="Preço (R$)" defaultValue={editingItem?.price} className="bg-black border border-zinc-800 p-4 rounded-xl text-sm outline-none focus:border-green-500" />
                        <div className="flex flex-col gap-2 p-4 bg-black border border-zinc-800 rounded-xl">
                           <label className="text-[8px] uppercase font-black flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isPromo" defaultChecked={editingItem?.isPromo} className="accent-red-500" /> PROMO</label>
                           <label className="text-[8px] uppercase font-black flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isLancamento" defaultChecked={editingItem?.isLancamento} className="accent-white" /> LANÇAMENTO</label>
                           <label className="text-[8px] uppercase font-black flex items-center gap-2 cursor-pointer"><input type="checkbox" name="isProntaEntrega" defaultChecked={editingItem?.isProntaEntrega} className="accent-green-500" /> PRONTA</label>
                           <label className="text-[8px] uppercase font-black flex items-center gap-2 cursor-pointer"><input type="checkbox" name="ativo" defaultChecked={editingItem ? (editingItem.ativo !== false) : true} className="accent-green-500" /> ATIVO</label>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-4">
                    <div onClick={() => multiFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-zinc-900 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 transition-all">
                      <span className="text-[9px] uppercase font-black text-zinc-600">Mídia {tab === 'products' ? '(1 a 4)' : '(1)'}</span>
                      <input type="file" ref={multiFileInputRef} onChange={(e) => handleFileUpload(e, tab === 'products' ? 'image' : tab === 'categories' ? 'category' : 'subcategory' as any)} className="hidden" multiple={tab === 'products'} />
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {currentGallery.map((img, i) => (
                        <div key={i} className={`relative aspect-square overflow-hidden border border-zinc-800 ${tab === 'subcategories' ? 'rounded-full' : 'rounded-lg'}`}>
                           <img src={img.url} className="w-full h-full object-cover" />
                           <button 
                             type="button"
                             onClick={() => setCurrentGallery(prev => prev.filter((_, idx) => idx !== i))}
                             className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition-all z-20"
                           >
                             <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                      ))}
                      {currentVideo && tab === 'products' && (
                        <div className="relative aspect-square overflow-hidden border border-zinc-800 rounded-lg bg-zinc-900 flex items-center justify-center">
                           <svg className="w-8 h-8 text-zinc-700" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15.5l6-3.5-6-3.5v7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8-8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                           <button 
                             type="button"
                             onClick={() => setCurrentVideo(null)}
                             className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded-full p-1 transition-all z-20"
                           >
                             <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-green-500 text-black py-5 text-[10px] font-black uppercase rounded-xl hover:scale-105 active:scale-95 transition-all">Salvar {tab}</button>
                </form>
              </div>
            </div>
            
            <div className="lg:col-span-7 space-y-4">
              {(tab === 'products' ? activeProducts : tab === 'categories' ? categories : subcategories).map((item: any) => (
                <div key={item.id} className="bg-zinc-950 p-4 sm:p-6 border border-zinc-900 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-between hover:border-zinc-700 transition-all gap-4">
                  <div className="flex items-center gap-4 w-full">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 overflow-hidden border border-zinc-800 bg-black flex-shrink-0 ${tab === 'subcategories' ? 'rounded-full' : 'rounded-lg'}`}>
                       <img src={item.midia || item.images?.[0]} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-[10px] sm:text-[11px] font-black uppercase italic tracking-tighter truncate">{item.nome || item.name}</h4>
                      {item.categoriaNome && <p className="text-[8px] uppercase font-black text-zinc-600 truncate">{item.categoriaNome}</p>}
                      
                      {/* Botões de Status Rápido na Lista */}
                      {tab === 'products' && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <button 
                            onClick={() => handleToggleStatus(item.id, 'isPromo', item.isPromo)}
                            className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-tighter border transition-all ${item.isPromo ? 'bg-red-500 text-white border-red-500' : 'bg-transparent text-zinc-700 border-zinc-800 hover:border-red-500/50'}`}
                          >
                            Promo
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(item.id, 'isLancamento', item.isLancamento)}
                            className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-tighter border transition-all ${item.isLancamento ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-700 border-zinc-800 hover:border-white/50'}`}
                          >
                            Novo
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(item.id, 'isProntaEntrega', item.isProntaEntrega)}
                            className={`px-2 py-1 rounded-full text-[7px] font-black uppercase tracking-tighter border transition-all ${item.isProntaEntrega ? 'bg-green-500 text-black border-green-500' : 'bg-transparent text-zinc-700 border-zinc-800 hover:border-green-500/50'}`}
                          >
                            Pronta
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-zinc-900 sm:border-0 pt-3 sm:pt-0">
                    <button onClick={() => startEdit(item)} className="flex-1 sm:flex-none p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white flex justify-center">✏️</button>
                    <button onClick={() => handleDelete(item.id, tab.slice(0, -1) as any)} className="flex-1 sm:flex-none p-3 bg-zinc-900 rounded-xl text-zinc-400 hover:text-red-500 flex justify-center">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="lg:col-span-12 space-y-12">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                {id: 'sections', label: 'Ativação'},
                {id: 'logo', label: 'Logos'},
                {id: 'carousel', label: 'Carrossel'},
                {id: 'teampv', label: 'Team PV'}
              ].map(st => (
                <button 
                  key={st.id} 
                  onClick={() => { setSubTab(st.id as any); resetForm(); }} 
                  className={`px-6 py-3 text-[9px] uppercase font-black rounded-xl border transition-all ${subTab === st.id ? 'bg-white text-black border-white' : 'text-zinc-600 border-zinc-900'}`}
                >
                  {st.label}
                </button>
              ))}
            </div>
            
            {subTab === 'logo' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                  <div className="bg-zinc-950 p-5 sm:p-8 border border-zinc-900 rounded-[24px] sm:rounded-[30px] shadow-2xl">
                    <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter">Gestão de Logo</h3>
                    <form onSubmit={handleSaveLogo} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Nome da Logo</label>
                        <input type="text" name="logo_nome" defaultValue={editingItem?.nome} placeholder="Ex: Logo Principal" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" required />
                      </div>
                      <div className="space-y-4">
                        <div onClick={() => multiFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-zinc-900 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 transition-all">
                          <span className="text-[9px] uppercase font-black text-zinc-600">Upload Logo</span>
                          <input type="file" ref={multiFileInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
                        </div>
                        {currentGallery.length > 0 && (
                          <div className="flex justify-center">
                            <div className="relative w-32 h-32 aspect-square rounded-xl overflow-hidden border border-zinc-800 bg-black p-2">
                               <img src={currentGallery[0].url} className="w-full h-full object-contain" />
                               <button type="button" onClick={() => setCurrentGallery([])} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white">
                                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">Salvar Logo</button>
                      {editingItem && <button type="button" onClick={resetForm} className="w-full text-zinc-500 text-[8px] uppercase font-black">Cancelar Edição</button>}
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7 space-y-4">
                  {logos.map(l => (
                    <div key={l.id} className={`p-4 sm:p-6 border rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row justify-between items-center transition-all gap-4 ${l.ativo ? 'bg-zinc-900 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'}`}>
                       <div className="flex items-center gap-4 sm:gap-6 w-full">
                         <div className="h-10 w-20 sm:h-12 sm:w-24 bg-black rounded-xl p-2 flex items-center justify-center border border-zinc-800 overflow-hidden flex-shrink-0">
                           <img src={l.midia_url} className="h-full object-contain" />
                         </div>
                         <span className="text-[9px] sm:text-[10px] uppercase font-black text-zinc-500 truncate">{l.nome}</span>
                       </div>
                       <div className="flex gap-2 w-full sm:w-auto justify-end border-t border-zinc-900 sm:border-0 pt-3 sm:pt-0">
                         <button onClick={() => storage.setActiveLogo(l.id).then(loadData)} className={`flex-grow sm:flex-grow-0 px-4 py-2 rounded-xl text-[8px] uppercase font-black transition-all ${l.ativo ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:text-white'}`}>
                           {l.ativo ? 'Ativa' : 'Ativar'}
                         </button>
                         <button onClick={() => startEdit(l)} className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white">✏️</button>
                         <button onClick={() => handleDelete(l.id, 'logo')} className="p-3 bg-zinc-800 rounded-xl text-red-500/50 hover:text-red-500 transition-all">🗑️</button>
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTab === 'carousel' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                  <div className="bg-zinc-950 p-5 sm:p-8 border border-zinc-900 rounded-[24px] sm:rounded-[30px] shadow-2xl lg:sticky lg:top-8">
                    <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter">Novo Banner</h3>
                    <form onSubmit={handleSaveCarousel} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Título do Banner</label>
                        <input type="text" name="bannerTitle" defaultValue={editingItem?.title} placeholder="Ex: DROP 2025" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Subtítulo do Banner</label>
                        <input type="text" name="bannerSubtitle" defaultValue={editingItem?.subtitle} placeholder="Ex: Elite Series" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Alinhamento Texto</label>
                        <select name="bannerAlign" defaultValue={editingItem?.align || 'center'} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none">
                          <option value="left">Esquerda</option>
                          <option value="center">Centro</option>
                          <option value="right">Direita</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <div onClick={() => multiFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-zinc-900 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 transition-all">
                          <span className="text-[9px] uppercase font-black text-zinc-600">Upload Imagem</span>
                          <input type="file" ref={multiFileInputRef} onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
                        </div>
                        {currentGallery.length > 0 && (
                          <div className="flex justify-center">
                            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-zinc-800 bg-black">
                               <img src={currentGallery[0].url} className="w-full h-full object-cover" />
                               <button type="button" onClick={() => setCurrentGallery([])} className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white shadow-xl">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">Salvar Banner</button>
                      {editingItem && <button type="button" onClick={resetForm} className="w-full text-zinc-500 text-[8px] uppercase font-black">Cancelar Edição</button>}
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {carouselImages.map(img => (
                    <div key={img.id} className="bg-zinc-950 border border-zinc-900 rounded-[30px] overflow-hidden group relative aspect-video shadow-2xl">
                      <img src={img.url} className="w-full h-full object-cover transition-all group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-3 p-4">
                         <div className="text-center">
                           <p className="text-white text-[10px] font-black uppercase tracking-widest truncate max-w-full px-2">{img.title || "(Sem Título)"}</p>
                           <p className="text-zinc-500 text-[8px] uppercase font-bold truncate max-w-full px-2">{img.subtitle || "(Sem Subtítulo)"}</p>
                         </div>
                         <div className="flex gap-2">
                           <button onClick={() => startEdit(img)} className="bg-white text-black p-2.5 rounded-xl hover:bg-green-500 transition-colors">✏️</button>
                           <button onClick={() => handleDelete(img.id, 'banner')} className="bg-red-600 p-2.5 rounded-xl text-white">🗑️</button>
                         </div>
                      </div>
                      {/* Indicador de Texto */}
                      {(img.title || img.subtitle) && (
                        <div className="absolute top-4 left-4 z-20">
                           <span className="bg-green-500 text-black text-[7px] font-black px-2 py-0.5 rounded-full uppercase">Com Texto</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subTab === 'sections' && (
              <div className="bg-zinc-950 p-5 sm:p-8 border border-zinc-900 rounded-[24px] sm:rounded-[30px] max-w-md shadow-2xl mx-auto lg:mx-0">
                 <h3 className="text-xl font-black mb-6 italic uppercase tracking-tighter">Vitrine Ativa</h3>
                 <div className="space-y-4">
                    {['promoSectionActive', 'lancamentoSectionActive', 'prontaEntregaSectionActive', 'teamPVSectionActive'].map(id => (
                       <label key={id} className="flex justify-between items-center p-4 bg-black border border-zinc-900 rounded-2xl cursor-pointer hover:border-green-500 transition-all">
                          <span className="text-[10px] font-black uppercase tracking-widest">{id.replace('SectionActive', '')}</span>
                          <input type="checkbox" checked={(settings as any)[id]} onChange={(e) => storage.saveSettings({ ...settings, [id]: e.target.checked }).then(loadData)} className="w-5 h-5 accent-green-500" />
                       </label>
                    ))}
                 </div>
              </div>
            )}

            {subTab === 'teampv' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5">
                  <div className="bg-zinc-950 p-5 sm:p-8 border border-zinc-900 rounded-[24px] sm:rounded-[30px] shadow-2xl lg:sticky lg:top-8">
                    <h3 className="text-xl font-black mb-8 italic uppercase tracking-tighter">Novo Integrante Elite</h3>
                    <form onSubmit={handleSaveTeamPV} className="space-y-6">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-zinc-600 ml-2">Nome do Cliente</label>
                        <input type="text" name="teamPvName" defaultValue={editingItem?.name} placeholder="Ex: João Silva" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none" />
                      </div>
                      <div className="space-y-4">
                        <div onClick={() => multiFileInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-zinc-900 rounded-2xl flex items-center justify-center cursor-pointer hover:border-green-500 transition-all">
                          <span className="text-[9px] uppercase font-black text-zinc-600">Upload Foto Elite</span>
                          <input type="file" ref={multiFileInputRef} onChange={(e) => handleFileUpload(e, 'teampv')} className="hidden" accept="image/*" />
                        </div>
                        {currentGallery.length > 0 && (
                          <div className="flex justify-center">
                            <div className="relative w-48 aspect-[3/4] rounded-[30px] overflow-hidden border border-zinc-800 bg-black">
                               <img src={currentGallery[0].url} className="w-full h-full object-cover" />
                               <button type="button" onClick={() => setCurrentGallery([])} className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full text-white shadow-xl">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                               </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">Salvar Elite</button>
                      {editingItem && <button type="button" onClick={resetForm} className="w-full text-zinc-500 text-[8px] uppercase font-black">Cancelar Edição</button>}
                    </form>
                  </div>
                </div>
                <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {teamPVItems.map(item => (
                    <div key={item.id} className="relative aspect-[3/4] rounded-[40px] overflow-hidden border border-zinc-900 group shadow-xl bg-zinc-950">
                      <img src={item.image} className="w-full h-full object-cover transition-all group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-3 p-4 text-center">
                        <span className="text-[10px] uppercase font-black italic text-white truncate w-full">{item.name || "(Sem Nome)"}</span>
                        <div className="flex gap-2">
                           <button onClick={() => startEdit(item)} className="p-3 bg-white rounded-xl text-black hover:bg-green-500 transition-colors">✏️</button>
                           <button onClick={() => handleDelete(item.id, 'teampv')} className="p-3 bg-red-600 rounded-xl text-white">🗑️</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
