
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

  const handleMultiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    
    for (const file of files) {
      // Aceita PNG, JPG, WEBP até 3MB
      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Formato inválido. Use JPG, PNG ou WEBP.');
        continue;
      }

      try {
        let folder = 'pvsports/general';
        let type: 'logo' | 'banner' | 'general' = 'general';

        // Mapeamento de pastas
        if (tab === 'products') folder = 'pvsports/products';
        if (tab === 'categories') folder = 'pvsports/categories';
        if (tab === 'subcategories') folder = 'pvsports/subcategories';
        
        if (tab === 'settings') {
          if (subTab === 'logo') { folder = 'pvsports/logos'; type = 'logo'; }
          if (subTab === 'carousel') { folder = 'pvsports/banners'; type = 'banner'; }
          if (subTab === 'teampv') { folder = 'pvsports/teampv'; }
        }

        const url = await storage.uploadToCloudinary(file, folder, type);
        
        if (tab === 'products') {
          setCurrentGallery(prev => [...prev, url]);
        } else {
          setCurrentGallery([url]);
        }
      } catch (err) {
        console.error("Upload Error:", err);
        alert("Erro no upload para o Cloudinary.");
      }
    }
    setIsUploading(false);
    if (e.target) e.target.value = '';
  };

  const removeImageFromGallery = (index: number) => {
    setCurrentGallery(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `prod_${Date.now()}`;
    if (currentGallery.length === 0) return alert('Selecione uma imagem.');

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
    setCurrentGallery(p.images || [p.image]);
    setTab('products');
  };

  const handleSaveCategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newCat: Category = {
      id: editingItem?.id || `cat_${Date.now()}`,
      name: fd.get('name') as string,
      image: currentGallery[0] || ''
    };
    await storage.saveCategories([newCat]);
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveSubcategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const newSub: Subcategory = {
      id: editingItem?.id || `sub_${Date.now()}`,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      image: currentGallery[0] || ''
    };
    await storage.saveSubcategories([newSub]);
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveCarousel = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) return alert('Selecione uma imagem.');
    const item: CarouselImage = {
      id: `slide_${Date.now()}`,
      url: currentGallery[0],
      title: fd.get('title') as string,
      subtitle: fd.get('subtitle') as string,
      active: true
    };
    await storage.saveCarouselImages([item]);
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveLogo = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) return alert('Selecione uma imagem.');
    const id = `logo_${Date.now()}`;
    await storage.saveLogos([{ id, url: currentGallery[0], name: fd.get('name') as string }]);
    await storage.saveSettings({ ...settings, activeLogoId: id });
    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveTeamPV = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) return alert('Selecione uma imagem.');
    await storage.saveTeamPVItem({ id: `tpv_${Date.now()}`, name: fd.get('name') as string, image: currentGallery[0], verified: true });
    resetForm();
    await loadData();
    onUpdate();
  };

  const selectActiveLogo = async (id: string) => {
    await storage.saveSettings({ ...settings, activeLogoId: id });
    await loadData();
    onUpdate();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      {isUploading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-black uppercase tracking-widest animate-pulse">Enviando Arquivos Originais...</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PV Admin <span className="text-green-500">PRO</span></h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-2">Imagens em Qualidade Máxima</p>
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
              
              <form onSubmit={tab === 'products' ? handleSaveProduct : tab === 'categories' ? handleSaveCategory : handleSaveSubcategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Nome</label>
                  <input type="text" name="name" defaultValue={editingItem?.name} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" required />
                </div>

                {tab === 'products' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" name="price" placeholder="Preço (ex: 299,90)" defaultValue={editingItem?.price} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none" />
                      <input type="text" name="oldPrice" placeholder="Antigo (ex: 349,90)" defaultValue={editingItem?.oldPrice} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <select name="categoryId" defaultValue={editingItem?.categoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none" required>
                        <option value="">Categoria...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <select name="subcategoryId" defaultValue={editingItem?.subcategoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none" required>
                        <option value="">Subcategoria...</option>
                        {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <textarea name="description" placeholder="Descrição..." defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl h-24 outline-none focus:border-green-500"></textarea>
                  </>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Upload para Cloudinary</label>
                  <div onClick={() => multiFileInputRef.current?.click()} className="w-full min-h-[140px] bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all p-6 group">
                    <svg className="w-8 h-8 text-zinc-800 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-[9px] uppercase font-black text-zinc-700 tracking-widest">Qualidade Original</p>
                    <input type="file" ref={multiFileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/*" multiple={tab === 'products'} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {currentGallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square group rounded-xl overflow-hidden border border-zinc-800">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImageFromGallery(idx)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-green-500 text-black py-5 text-[10px] font-black uppercase rounded-2xl hover:bg-green-400 transition-all shadow-xl">Salvar no Sistema</button>
              </form>
            </div>
          </div>
        )}

        <div className={`lg:col-span-${tab === 'settings' ? '12' : '7'} space-y-4`}>
          {tab === 'settings' && (
            <div className="space-y-12">
              <div className="flex gap-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
                {['sections', 'carousel', 'logo', 'teampv'].map(s => (
                  <button key={s} onClick={() => { setSubTab(s as any); resetForm(); }} className={`text-[10px] uppercase font-black tracking-[0.3em] transition-all relative pb-4 ${subTab === s ? 'text-green-500' : 'text-zinc-600'}`}>
                    {s === 'sections' ? 'Seções' : s === 'carousel' ? 'Carrossel' : s === 'logo' ? 'Logo' : 'Team PV'}
                    {subTab === s && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-full" />}
                  </button>
                ))}
              </div>

              {subTab === 'carousel' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 bg-zinc-950 p-6 border border-zinc-900 rounded-[32px]">
                     <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Novo Banner</h3>
                     <form onSubmit={handleSaveCarousel} className="space-y-4">
                        <input type="text" name="title" placeholder="Título" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                        <input type="text" name="subtitle" placeholder="Subtítulo" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                        <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative hover:border-green-500/50 transition-all">
                           {currentGallery[0] ? <img src={currentGallery[0]} className="w-full h-full object-cover" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload Banner</span>}
                           <input type="file" ref={fileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/*" />
                        </div>
                        <button type="submit" disabled={isUploading || currentGallery.length === 0} className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl transition-all shadow-lg hover:bg-green-400">Adicionar ao Carrossel</button>
                     </form>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {carouselImages.map(img => (
                      <div key={img.id} className="group bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden p-4">
                         <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative bg-black">
                            <img src={img.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                               <button onClick={() => storage.deleteCarouselImage(img.id).then(loadData)} className="p-3 bg-red-600 text-white rounded-full"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                            </div>
                         </div>
                         <h4 className="text-[11px] font-black uppercase tracking-tight px-2">{img.title || 'Sem Título'}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {subTab === 'logo' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4 bg-zinc-950 p-6 border border-zinc-900 rounded-[32px]">
                     <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Nova Logo (Original)</h3>
                     <form onSubmit={handleSaveLogo} className="space-y-4">
                        <input type="text" name="name" placeholder="Apelido da Logo" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" required />
                        <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden relative hover:border-green-500/50 transition-all">
                           {currentGallery[0] ? <img src={currentGallery[0]} className="w-full h-full object-contain p-4" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload Logo</span>}
                           <input type="file" ref={fileInputRef} onChange={handleMultiFileChange} className="hidden" accept="image/*" />
                        </div>
                        <button type="submit" disabled={isUploading || currentGallery.length === 0} className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl transition-all shadow-xl">Ativar no Site</button>
                     </form>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {logos.map(l => (
                      <div key={l.id} className={`bg-zinc-950 border-2 p-6 rounded-[32px] transition-all text-center group ${settings.activeLogoId === l.id ? 'border-green-500 shadow-lg' : 'border-zinc-900'}`}>
                        <div className="h-24 flex items-center justify-center mb-6">
                            <img src={l.url} className="max-h-full max-w-full object-contain" alt={l.name} />
                        </div>
                        <button onClick={() => selectActiveLogo(l.id)} disabled={settings.activeLogoId === l.id} className={`w-full py-3 text-[8px] font-black uppercase rounded-xl transition-all ${settings.activeLogoId === l.id ? 'bg-zinc-900 text-green-500' : 'bg-white text-black hover:bg-green-500'}`}>
                          {settings.activeLogoId === l.id ? 'Ativa' : 'Ativar'}
                        </button>
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
                    <button onClick={() => storage.deleteProduct(p.id).then(loadData)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
