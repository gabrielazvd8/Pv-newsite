
import React, { useState, useEffect, useRef } from 'react';
import * as storage from '../../services/storage';
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo, TeamPVItem } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, onUpdate }) => {
  const [tab, setTab] = useState<'products' | 'categories' | 'subcategories' | 'settings'>('products');
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
  const [currentGallery, setCurrentGallery] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
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
  };

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`Formato inválido (${file.name}). Use JPG, PNG ou WEBP.`);
      return false;
    }
    const maxSize = (tab === 'settings' && subTab === 'carousel') ? 3 : 2;
    if (file.size > maxSize * 1024 * 1024) {
      alert(`Arquivo muito grande (${file.name}). Máximo ${maxSize}MB.`);
      return false;
    }
    return true;
  };

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    
    for (const file of files) {
      if (validateFile(file)) {
        try {
          let url;
          if (tab === 'settings' && subTab === 'logo') {
             url = await storage.uploadToCloudinary(file, 'logo');
          } else if (tab === 'settings' && subTab === 'carousel') {
             url = await storage.uploadToCloudinary(file, 'banner');
          } else {
             url = await storage.uploadLocalFile(file);
          }
          
          if (tab === 'products') {
            setCurrentGallery(prev => [...prev, url]);
          } else {
            setCurrentGallery([url]);
          }
        } catch (err) {
          console.error("Erro no processamento da imagem:", err);
          alert("Erro ao enviar imagem para o Cloudinary.");
        }
      }
    }
    setIsUploading(false);
    if (e.target) e.target.value = '';
  };

  const removeImageFromGallery = (index: number) => {
    setCurrentGallery(prev => prev.filter((_, i) => i !== index));
  };

  const setAsMainImage = (index: number) => {
    setCurrentGallery(prev => {
      const newGallery = [...prev];
      const [selected] = newGallery.splice(index, 1);
      return [selected, ...newGallery];
    });
  };

  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `prod_${Date.now()}`;
    
    if (currentGallery.length === 0) {
      alert('O produto deve ter pelo menos uma imagem principal.');
      return;
    }

    const item: Product = {
      id,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      subcategoryId: fd.get('subcategoryId') as string,
      image: currentGallery[0],
      images: currentGallery,
      description: fd.get('description') as string,
      isProntaEntrega: fd.get('isProntaEntrega') === 'on',
      isLancamento: fd.get('isLancamento') === 'on',
      isPromo: fd.get('isPromo') === 'on',
      price: fd.get('price') as string,
      oldPrice: fd.get('oldPrice') as string
    };

    await storage.saveProduct(item);
    resetForm();
    await loadData();
    onUpdate();
  };

  const resetForm = () => {
    setEditingItem(null);
    setCurrentGallery([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  };

  const startEditingProduct = (p: Product) => {
    setEditingItem(p);
    setCurrentGallery(p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []));
    setTab('products');
  };

  const handleSaveCategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `cat_${Date.now()}`;
    const newCat: Category = {
      id,
      name: fd.get('name') as string,
      image: currentGallery[0] || editingItem?.image || ''
    };
    await storage.saveCategories([newCat]);
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveSubcategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `sub_${Date.now()}`;
    const newSub: Subcategory = {
      id,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      image: currentGallery[0] || editingItem?.image || ''
    };
    await storage.saveSubcategories([newSub]);
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveCarousel = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) { alert('Selecione uma imagem para o banner.'); return; }
    
    const id = editingItem?.id || `slide_${Date.now()}`;
    const item: CarouselImage = {
      id,
      url: currentGallery[0],
      title: fd.get('title') as string,
      subtitle: fd.get('subtitle') as string,
      active: true
    };
    
    await storage.saveCarouselImages([item]);
    resetForm();
    await loadData();
    onUpdate();
    alert('Banner adicionado com sucesso via Cloudinary!');
  };

  const deleteCarouselImage = async (id: string) => {
    if (!confirm('Excluir este banner do carrossel?')) return;
    await storage.deleteCarouselImage(id);
    await loadData();
    onUpdate();
  };

  const handleSaveLogo = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) { alert('Selecione uma imagem.'); return; }
    const id = `logo_${Date.now()}`;
    const item: Logo = {
      id,
      url: currentGallery[0],
      name: fd.get('name') as string || 'Nova Logo'
    };
    await storage.saveLogos([item]);
    
    const newSettings = { ...settings, activeLogoId: id };
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
    
    resetForm();
    await loadData();
    onUpdate();
    alert("Logo atualizada com sucesso via Cloudinary!");
  };

  const handleSaveTeamPV = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) { alert('Selecione uma imagem.'); return; }
    const id = editingItem?.id || `tpv_${Date.now()}`;
    const item: TeamPVItem = {
      id,
      name: fd.get('name') as string,
      image: currentGallery[0],
      verified: true
    };
    await storage.saveTeamPVItem(item);
    resetForm();
    await loadData();
    onUpdate();
  };

  const selectActiveLogo = async (id: string) => {
    const newSettings = { ...settings, activeLogoId: id };
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
    onUpdate();
  };

  const toggleSectionActive = async (setting: keyof AppSettings) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    await storage.saveSettings(newSettings as AppSettings);
    setSettings(newSettings as AppSettings);
    onUpdate();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Excluir este produto permanentemente?')) return;
    await storage.deleteProduct(id);
    await loadData();
    onUpdate();
  };

  const deleteTeamPVItem = async (id: string) => {
    if (!confirm('Remover este item do Team PV?')) return;
    await storage.deleteTeamPVItem(id);
    await loadData();
    onUpdate();
  };

  const renderSectionManager = (title: string, settingKey: keyof AppSettings, flag?: string, colorClass: string = 'zinc') => {
    const isActive = settings[settingKey];
    return (
      <div className={`bg-zinc-950 p-8 border-2 rounded-[40px] transition-all flex flex-col h-full ${isActive ? `border-${colorClass}-500/30 shadow-2xl` : 'border-zinc-900'}`}>
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-900/50">
          <div>
            <h3 className={`text-2xl font-black uppercase tracking-tighter transition-colors ${isActive ? (colorClass === 'red' ? 'text-red-500' : colorClass === 'green' ? 'text-green-500' : 'text-zinc-100') : 'text-zinc-500'}`}>{title}</h3>
            <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold mt-1">Status: {isActive ? 'Ativo na Vitrine' : 'Desativado'}</p>
          </div>
          <button 
            onClick={() => toggleSectionActive(settingKey)} 
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all shadow-inner ${isActive ? (colorClass === 'red' ? 'bg-red-500' : colorClass === 'green' ? 'bg-green-500' : 'bg-zinc-800') : 'bg-zinc-800'}`}
          >
            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-xl transition-transform ${isActive ? 'translate-x-10' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black uppercase tracking-widest animate-pulse">
            Enviando para o Cloudinary...<br/>
            <span className="text-[10px] text-zinc-500 mt-2 font-medium">Otimizando imagem para PV Sports</span>
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PV Admin <span className="text-green-500">CLOUD</span></h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-2">Gestão de Banners e Imagens via Cloudinary</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-2 border border-zinc-800 text-[10px] uppercase font-black hover:bg-zinc-900 transition-all rounded-xl">Vitrine</button>
          <button onClick={onLogout} className="px-6 py-2 bg-red-950/20 text-red-500 border border-red-900/30 text-[10px] uppercase font-black hover:bg-red-950/40 transition-all rounded-xl">Logout</button>
        </div>
      </div>

      <nav className="flex gap-2 mb-10 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
        {['products', 'categories', 'subcategories', 'settings'].map(t => (
          <button 
            key={t}
            onClick={() => { setTab(t as any); resetForm(); }}
            className={`px-6 py-3 text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all rounded-xl ${tab === t ? 'bg-zinc-900 text-green-500 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t === 'products' ? 'Produtos' : t === 'categories' ? 'Categorias' : t === 'subcategories' ? 'Subcategorias' : 'Configurações'}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {tab !== 'settings' && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-[32px] sticky top-8 shadow-2xl">
              <h2 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                {editingItem ? 'Editar Registro' : `Novo ${tab}`}
              </h2>
              
              <form key={editingItem?.id || tab} onSubmit={tab === 'products' ? handleSaveProduct : tab === 'categories' ? handleSaveCategory : handleSaveSubcategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Nome do Item</label>
                  <input type="text" name="name" placeholder="Ex: Brasil Home 2024" defaultValue={editingItem?.name} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" required />
                </div>

                {tab === 'products' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Preço Atual (R$)</label>
                        <input type="text" name="price" placeholder="Ex: 299,90" defaultValue={editingItem?.price} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Preço Antigo (R$)</label>
                        <input type="text" name="oldPrice" placeholder="Ex: 349,90" defaultValue={editingItem?.oldPrice} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Categoria</label>
                        <select name="categoryId" defaultValue={editingItem?.categoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
                          <option value="">Selecione...</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Subcategoria</label>
                        <select name="subcategoryId" defaultValue={editingItem?.subcategoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
                          <option value="">Selecione...</option>
                          {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col items-center gap-2 bg-black border border-zinc-800 p-3 rounded-2xl">
                        <input type="checkbox" name="isProntaEntrega" defaultChecked={editingItem?.isProntaEntrega} className="w-5 h-5 accent-green-500" />
                        <label className="text-[8px] uppercase font-black text-zinc-500">Pronta</label>
                      </div>
                      <div className="flex flex-col items-center gap-2 bg-black border border-zinc-800 p-3 rounded-2xl">
                        <input type="checkbox" name="isLancamento" defaultChecked={editingItem?.isLancamento} className="w-5 h-5 accent-zinc-100" />
                        <label className="text-[8px] uppercase font-black text-zinc-500">Novo</label>
                      </div>
                      <div className="flex flex-col items-center gap-2 bg-black border border-zinc-800 p-3 rounded-2xl">
                        <input type="checkbox" name="isPromo" defaultChecked={editingItem?.isPromo} className="w-5 h-5 accent-red-500" />
                        <label className="text-[8px] uppercase font-black text-zinc-500">Promo</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Descrição</label>
                      <textarea name="description" placeholder="Detalhes da peça..." defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl h-24 outline-none focus:border-green-500"></textarea>
                    </div>
                  </>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-2">
                    <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Fotos</label>
                  </div>
                  <div onClick={() => multiFileInputRef.current?.click()} className="w-full min-h-[140px] bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all p-6 group">
                    <svg className="w-8 h-8 text-zinc-800 group-hover:text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[9px] uppercase font-black text-zinc-700 tracking-widest">Clique para selecionar</p>
                    <input type="file" ref={multiFileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" multiple={tab === 'products'} />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {currentGallery.map((img, idx) => (
                      <div key={idx} className={`relative aspect-square group rounded-xl overflow-hidden border-2 transition-all ${idx === 0 ? 'border-green-500 shadow-lg' : 'border-zinc-800'}`}>
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button type="button" onClick={() => removeImageFromGallery(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                           <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button type="submit" className="flex-grow bg-green-500 text-black py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-400 transition-all shadow-xl active:scale-95">Salvar Registro</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`lg:col-span-${tab === 'settings' ? '12' : '7'} space-y-4`}>
          {tab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="flex gap-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                {['sections', 'carousel', 'logo', 'teampv'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => { setSubTab(s as any); resetForm(); }}
                    className={`text-[10px] uppercase font-black tracking-[0.3em] transition-all relative pb-4 ${subTab === s ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {s === 'sections' ? 'Seções' : s === 'carousel' ? 'Carrossel' : s === 'logo' ? 'Logo' : 'Team PV'}
                    {subTab === s && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-full" />}
                  </button>
                ))}
              </div>

              {subTab === 'sections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {renderSectionManager('Promoção', 'promoSectionActive', 'isPromo', 'red')}
                  {renderSectionManager('Lançamento', 'lancamentoSectionActive', 'isLancamento', 'zinc')}
                  {renderSectionManager('Pronta Entrega', 'prontaEntregaSectionActive', 'isProntaEntrega', 'green')}
                  {renderSectionManager('Team PV', 'teamPVSectionActive', undefined, 'green')}
                </div>
              )}

              {subTab === 'carousel' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-[32px] shadow-xl">
                       <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Novo Banner (Cloudinary)</h3>
                       <form onSubmit={handleSaveCarousel} className="space-y-4">
                         <div className="space-y-1">
                           <label className="text-[9px] uppercase font-black text-zinc-600 ml-1">Título do Slide</label>
                           <input type="text" name="title" placeholder="Ex: NOVA COLEÇÃO" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                         </div>
                         <div className="space-y-1">
                           <label className="text-[9px] uppercase font-black text-zinc-600 ml-1">Subtítulo</label>
                           <input type="text" name="subtitle" placeholder="Ex: ESTILO DE ELITE" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                         </div>
                         
                         <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group hover:border-green-500/50 transition-all">
                            {currentGallery[0] ? (
                              <img src={currentGallery[0]} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-center">
                                <svg className="w-8 h-8 text-zinc-800 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                <span className="text-[9px] uppercase font-black text-zinc-600">Upload Banner</span>
                              </div>
                            )}
                            <input type="file" ref={fileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" />
                         </div>
                         <button type="submit" disabled={isUploading || currentGallery.length === 0} className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all shadow-lg hover:bg-green-400 disabled:bg-zinc-800 disabled:text-zinc-600">
                           {isUploading ? 'Processando...' : 'Adicionar ao Carrossel'}
                         </button>
                         <p className="text-[8px] text-zinc-600 text-center uppercase tracking-widest font-bold">1600x600px Recomendado</p>
                       </form>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <h3 className="text-[10px] uppercase font-black text-zinc-500 mb-6 tracking-[0.3em]">Banners Ativos</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {carouselImages.map(img => (
                        <div key={img.id} className="group bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden p-4 hover:border-zinc-700 transition-all">
                           <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative bg-black shadow-inner">
                              <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                                 <button onClick={() => deleteCarouselImage(img.id)} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform shadow-2xl">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                 </button>
                              </div>
                           </div>
                           <div className="px-2">
                             <h4 className="text-[11px] font-black uppercase tracking-tight truncate">{img.title || 'Sem Título'}</h4>
                             <p className="text-[9px] text-zinc-600 uppercase font-bold tracking-widest mt-1">{img.subtitle || 'Sem Subtítulo'}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {subTab === 'logo' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-[32px] shadow-2xl border-green-500/20">
                       <h3 className="text-sm font-black uppercase mb-6 tracking-tighter flex items-center gap-2">
                         <div className="w-2 h-4 bg-green-500"></div>
                         Gerenciar Logo (Cloudinary)
                       </h3>
                       <form onSubmit={handleSaveLogo} className="space-y-4">
                         <input type="text" name="name" placeholder="Apelido da Logo (ex: Natal 2024)" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl outline-none focus:border-green-500 transition-all" required />
                         <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-green-500/50 transition-all">
                            {currentGallery[0] ? <img src={currentGallery[0]} className="w-full h-full object-contain p-6" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload Logo</span>}
                            <input type="file" ref={fileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/png,image/jpeg,image/webp" />
                         </div>
                         <button type="submit" disabled={isUploading || currentGallery.length === 0} className="w-full py-5 text-[10px] font-black uppercase rounded-2xl transition-all shadow-xl active:scale-95 bg-green-500 text-black hover:bg-green-400 disabled:bg-zinc-800">
                           {isUploading ? 'Enviando...' : 'Atualizar Logo Site'}
                         </button>
                       </form>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <h3 className="text-[10px] uppercase font-black text-zinc-500 mb-6 tracking-[0.3em]">Logos Disponíveis</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {logos.map(l => (
                        <div key={l.id} className={`bg-zinc-950 border-2 p-6 rounded-[32px] transition-all relative text-center group ${settings.activeLogoId === l.id ? 'border-green-500 shadow-lg' : 'border-zinc-900 hover:border-zinc-800'}`}>
                          <div className="h-24 flex items-center justify-center mb-6">
                              <img src={l.url} className="max-h-full max-w-full object-contain drop-shadow-lg" alt={l.name} />
                          </div>
                          <button onClick={() => selectActiveLogo(l.id)} disabled={settings.activeLogoId === l.id} className={`w-full py-3 text-[8px] font-black uppercase rounded-xl transition-all ${settings.activeLogoId === l.id ? 'bg-zinc-900 text-green-500 cursor-default border border-green-500/20' : 'bg-white text-black hover:bg-green-500'}`}>
                            {settings.activeLogoId === l.id ? 'Ativo' : 'Ativar'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {subTab === 'teampv' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-[32px] shadow-xl">
                       <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Novo Team PV</h3>
                       <form onSubmit={handleSaveTeamPV} className="space-y-4">
                         <input type="text" name="name" placeholder="Nome do Cliente" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" required />
                         <div onClick={() => fileInputRef.current?.click()} className="aspect-[9/16] bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                            {currentGallery[0] ? <img src={currentGallery[0]} className="w-full h-full object-cover" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload Print</span>}
                            <input type="file" ref={fileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/*" />
                         </div>
                         <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl active:scale-95 transition-all">Salvar Cliente</button>
                       </form>
                    </div>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {teamPVItems.map(item => (
                      <div key={item.id} className="group bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden p-4 relative">
                         <div className="aspect-[9/16] rounded-2xl overflow-hidden mb-4 relative bg-black">
                            <img src={item.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                               <button onClick={() => deleteTeamPVItem(item.id)} className="p-3 bg-red-600 text-white rounded-full hover:scale-110 transition-transform">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                               </button>
                            </div>
                         </div>
                         <h4 className="text-xs font-black uppercase text-center">{item.name}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab !== 'settings' && (
            <div className="max-h-[80vh] overflow-y-auto pr-2 space-y-4 no-scrollbar">
              {tab === 'products' && products.map(p => (
                <div key={p.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group hover:border-green-500/30 transition-all shadow-md">
                  <div className="flex items-center gap-5">
                    <img src={p.image} className="w-16 h-16 rounded-2xl object-cover border border-zinc-800" alt="" />
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-tight">{p.name}</h4>
                      <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">R$ {p.price}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEditingProduct(p)} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
