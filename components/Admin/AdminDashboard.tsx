
import React, { useState, useEffect, useRef } from 'react';
import * as storage from '../../services/storage';
import { Product, Category, Subcategory, AppSettings, CarouselImage, Logo } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, onUpdate }) => {
  const [tab, setTab] = useState<'products' | 'categories' | 'subcategories' | 'settings'>('products');
  const [subTab, setSubTab] = useState<'sections' | 'carousel' | 'logo'>('sections');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [carouselImages, setCarouselImages] = useState<CarouselImage[]>([]);
  const [logos, setLogos] = useState<Logo[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    activeLogoId: 'default'
  });
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setCarouselImages(storage.getCarouselImages());
    setLogos(storage.getLogos());
    setSettings(storage.getSettings());
  };

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert(`Formato inválido (${file.name}). Use JPG, PNG ou WEBP.`);
      return false;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert(`Arquivo muito grande (${file.name}). Máximo 2MB.`);
      return false;
    }
    return true;
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file || !validateFile(file)) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      callback(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMultiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!validateFile(file)) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `prod_${Math.random().toString(36).substr(2, 9)}`;
    
    // As imagens de preview agora compõem a galeria total
    const item: Product = {
      id,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      subcategoryId: fd.get('subcategoryId') as string,
      image: previewImages[0] || editingItem?.image || '', // A primeira é a principal
      images: previewImages.length > 0 ? previewImages : (editingItem?.images || []),
      description: fd.get('description') as string,
      isProntaEntrega: fd.get('isProntaEntrega') === 'on',
      isLancamento: fd.get('isLancamento') === 'on',
      isPromo: fd.get('isPromo') === 'on',
      price: fd.get('price') as string,
      oldPrice: fd.get('oldPrice') as string
    };

    if (!item.image) {
      alert('O produto deve ter pelo menos uma imagem principal.');
      return;
    }

    const updated = editingItem 
      ? products.map(p => p.id === id ? item : p)
      : [...products, item];
    storage.saveProducts(updated);
    setProducts(updated);
    resetForm();
    onUpdate();
  };

  const handleSaveCategory = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newCat: Category = {
      id,
      name: fd.get('name') as string,
      image: previewImages[0] || editingItem?.image || ''
    };
    const updated = editingItem 
      ? categories.map(c => c.id === id ? newCat : c)
      : [...categories, newCat];
    storage.saveCategories(updated);
    setCategories(updated);
    resetForm();
    onUpdate();
  };

  const handleSaveSubcategory = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `sub_${Math.random().toString(36).substr(2, 5)}`;
    const newSub: Subcategory = {
      id,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      image: previewImages[0] || editingItem?.image || ''
    };
    const updated = editingItem 
      ? subcategories.map(s => s.id === id ? newSub : s)
      : [...subcategories, newSub];
    storage.saveSubcategories(updated);
    setSubcategories(updated);
    resetForm();
    onUpdate();
  };

  const handleSaveCarousel = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `slide_${Math.random().toString(36).substr(2, 9)}`;
    const item: CarouselImage = {
      id,
      url: previewImages[0] || editingItem?.url || '',
      title: fd.get('title') as string,
      subtitle: fd.get('subtitle') as string,
      active: editingItem ? editingItem.active : true
    };
    if (!item.url) { alert('Selecione uma imagem.'); return; }
    const updated = editingItem 
      ? carouselImages.map(s => s.id === id ? item : s)
      : [...carouselImages, item];
    storage.saveCarouselImages(updated);
    setCarouselImages(updated);
    resetForm();
    onUpdate();
  };

  const handleSaveLogo = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (previewImages.length === 0) { alert('Selecione uma imagem.'); return; }
    const id = `logo_${Math.random().toString(36).substr(2, 9)}`;
    const item: Logo = {
      id,
      url: previewImages[0],
      name: fd.get('name') as string || 'Nova Logo'
    };
    const updated = [...logos, item];
    storage.saveLogos(updated);
    setLogos(updated);
    resetForm();
    onUpdate();
  };

  const selectActiveLogo = (id: string) => {
    const newSettings = { ...settings, activeLogoId: id };
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    onUpdate();
  };

  const resetForm = () => {
    setEditingItem(null);
    setPreviewImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (multiFileInputRef.current) multiFileInputRef.current.value = '';
  };

  const toggleProductFlag = (id: string, flag: 'isProntaEntrega' | 'isLancamento' | 'isPromo') => {
    const updated = products.map(p => p.id === id ? { ...p, [flag]: !p[flag] } : p);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  const toggleSectionActive = (setting: keyof AppSettings) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    storage.saveSettings(newSettings as AppSettings);
    setSettings(newSettings as AppSettings);
    onUpdate();
  };

  const deleteProduct = (id: string) => {
    if (!confirm('Excluir este produto permanentemente?')) return;
    const updated = products.filter(p => p.id !== id);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  const renderSectionManager = (title: string, settingKey: keyof AppSettings, flag: 'isPromo' | 'isLancamento' | 'isProntaEntrega', colorClass: string) => {
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
            className={`relative inline-flex h-10 w-20 items-center rounded-full transition-all shadow-inner ${isActive ? (colorClass === 'red' ? 'bg-red-500' : colorClass === 'green' ? 'bg-green-500' : 'bg-zinc-500') : 'bg-zinc-800'}`}
          >
            <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-xl transition-transform ${isActive ? 'translate-x-10' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[10px] uppercase font-black text-zinc-500 tracking-[0.2em]">Selecionar Camisas</h4>
            <span className="text-[9px] text-zinc-700 uppercase font-bold">{products.filter(p => p[flag]).length} selecionadas</span>
          </div>
          <div className="flex-grow max-h-[400px] overflow-y-auto pr-2 space-y-2 no-scrollbar border border-zinc-900/30 rounded-2xl p-2 bg-black/20">
            {products.map(p => (
              <div 
                key={p.id} 
                onClick={() => toggleProductFlag(p.id, flag)}
                className={`p-4 border-2 rounded-[24px] cursor-pointer transition-all flex items-center gap-4 ${p[flag] ? (colorClass === 'red' ? 'bg-red-500/10 border-red-500/40 shadow-lg' : colorClass === 'green' ? 'bg-green-500/10 border-green-500/40 shadow-lg' : 'bg-zinc-100/10 border-zinc-500 shadow-lg') : 'bg-zinc-900/40 border-transparent hover:border-zinc-800'}`}
              >
                <div className="relative">
                  <img src={p.image} className="w-12 h-12 object-cover rounded-xl border border-zinc-800" alt="" />
                  {p[flag] && (
                    <div className={`absolute -top-1 -right-1 p-0.5 rounded-full ${colorClass === 'red' ? 'bg-red-500 text-white' : colorClass === 'green' ? 'bg-green-500 text-black' : 'bg-white text-black'}`}>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                   <h4 className={`text-[11px] font-black uppercase tracking-tight ${p[flag] ? 'text-white' : 'text-zinc-600'}`}>{p.name}</h4>
                   <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest mt-0.5">
                     {categories.find(c => c.id === p.categoryId)?.name || 'Sem Categoria'}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PV Admin <span className="text-green-500">PRO</span></h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-2">Gestão Premium de Ativos</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-2 border border-zinc-800 text-[10px] uppercase font-black hover:bg-zinc-900 transition-all rounded-xl">Vitrine</button>
          <button onClick={onLogout} className="px-6 py-2 bg-red-950/20 text-red-500 border border-red-900/30 text-[10px] uppercase font-black hover:bg-red-950/40 transition-all rounded-xl">Logout</button>
        </div>
      </div>

      <nav className="flex gap-2 mb-10 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', label: 'Produtos' },
          { id: 'categories', label: 'Categorias' },
          { id: 'subcategories', label: 'Subcategorias' },
          { id: 'settings', label: 'Configurações' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setTab(t.id as any); resetForm(); }}
            className={`px-6 py-3 text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all rounded-xl ${tab === t.id ? 'bg-zinc-900 text-green-500 border border-zinc-800' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {tab !== 'settings' && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-[32px] sticky top-8 shadow-2xl">
              <h2 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                {editingItem ? 'Editar Registro' : `Novo ${tab.replace('-', ' ')}`}
              </h2>
              
              <form key={editingItem?.id || tab} onSubmit={tab === 'products' ? handleSaveProduct : tab === 'categories' ? handleSaveCategory : handleSaveSubcategory} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Nome / Título</label>
                  <input type="text" name="name" placeholder="Ex: Real Madrid Home" defaultValue={editingItem?.name} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" required />
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
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Subcategoria</label>
                        <select name="subcategoryId" defaultValue={editingItem?.subcategoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
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
                      <textarea name="description" placeholder="Detalhes técnicos..." defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl h-24 outline-none focus:border-green-500"></textarea>
                    </div>
                  </>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Galeria de Mídias (Arraste ou clique)</label>
                  <div 
                    onClick={() => multiFileInputRef.current?.click()} 
                    className="w-full min-h-[160px] bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all p-6 text-center"
                  >
                    <svg className="w-8 h-8 text-zinc-700 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <p className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Adicionar Fotos</p>
                    <input 
                      type="file" 
                      ref={multiFileInputRef} 
                      onChange={handleMultiFileChange} 
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                    />
                  </div>
                  
                  {/* Grid de Previews */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                    {(editingItem?.images || []).concat(previewImages).filter((v, i, a) => a.indexOf(v) === i).map((img, idx) => (
                      <div key={idx} className="relative aspect-square group rounded-xl overflow-hidden border border-zinc-800">
                        <img src={img} className="w-full h-full object-cover" alt="" />
                        <button 
                          type="button"
                          onClick={() => {
                            setPreviewImages(prev => prev.filter(p => p !== img));
                            if (editingItem && editingItem.images) {
                               setEditingItem({...editingItem, images: editingItem.images.filter((i: string) => i !== img)});
                            }
                          }}
                          className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                        {idx === 0 && (
                          <div className="absolute top-0 left-0 bg-green-500 text-black text-[7px] font-black px-1.5 py-0.5 uppercase">Capa</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-grow bg-green-500 text-black py-5 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-green-400 transition-all shadow-xl active:scale-95">Salvar Registro</button>
                  {editingItem && (
                    <button type="button" onClick={resetForm} className="bg-zinc-900 text-white px-6 py-5 rounded-2xl hover:bg-zinc-800 transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        <div className={`lg:col-span-${tab === 'settings' ? '12' : '7'} space-y-4`}>
          {tab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-700">
              <div className="flex gap-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                {[{ id: 'sections', label: 'Seções' }, { id: 'carousel', label: 'Carrossel' }, { id: 'logo', label: 'Logo' }].map(s => (
                  <button 
                    key={s.id} 
                    onClick={() => { setSubTab(s.id as any); resetForm(); }}
                    className={`text-[10px] uppercase font-black tracking-[0.3em] transition-all relative pb-4 ${subTab === s.id ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                  >
                    {s.label}
                    {subTab === s.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-full" />}
                  </button>
                ))}
              </div>
              {subTab === 'sections' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {renderSectionManager('Promoção', 'promoSectionActive', 'isPromo', 'red')}
                  {renderSectionManager('Lançamento', 'lancamentoSectionActive', 'isLancamento', 'zinc')}
                  {renderSectionManager('Pronta Entrega', 'prontaEntregaSectionActive', 'isProntaEntrega', 'green')}
                </div>
              )}
              {subTab === 'carousel' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-[32px] shadow-xl">
                       <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Novo Slide</h3>
                       <form onSubmit={handleSaveCarousel} className="space-y-4">
                         <input type="text" name="title" placeholder="Título" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                         <input type="text" name="subtitle" placeholder="Subtítulo" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl focus:border-green-500 outline-none" />
                         <div onClick={() => fileInputRef.current?.click()} className="aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative group">
                            {previewImages[0] ? <img src={previewImages[0]} className="w-full h-full object-cover" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload Imagem</span>}
                            <input type="file" ref={fileInputRef} onChange={(e) => handleSingleFileChange(e, (url) => setPreviewImages([url]))} className="hidden" accept="image/*" />
                         </div>
                         <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl">Adicionar</button>
                       </form>
                    </div>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {carouselImages.map(img => (
                      <div key={img.id} className={`group bg-zinc-950 border border-zinc-900 rounded-[32px] overflow-hidden p-4 transition-all ${!img.active ? 'opacity-40 grayscale' : 'hover:border-green-500/30'}`}>
                         <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                            <img src={img.url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                               <button onClick={() => {
                                 const updated = carouselImages.map(s => s.id === img.id ? { ...s, active: !s.active } : s);
                                 storage.saveCarouselImages(updated);
                                 setCarouselImages(updated);
                                 onUpdate();
                               }} className="p-2 bg-zinc-800 text-green-500 rounded-full hover:bg-green-500 hover:text-black">
                                 {img.active ? 'Ativo' : 'Inativo'}
                               </button>
                            </div>
                         </div>
                         <h4 className="text-xs font-black uppercase">{img.title}</h4>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {subTab === 'logo' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-4">
                    <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-[32px]">
                       <h3 className="text-sm font-black uppercase mb-6 tracking-tighter">Nova Logo</h3>
                       <form onSubmit={handleSaveLogo} className="space-y-4">
                         <input type="text" name="name" placeholder="Apelido" className="w-full bg-black border border-zinc-800 p-3 text-xs rounded-xl outline-none" required />
                         <div onClick={() => fileInputRef.current?.click()} className="aspect-square bg-black border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer overflow-hidden relative">
                            {previewImages[0] ? <img src={previewImages[0]} className="w-full h-full object-contain p-4" /> : <span className="text-[9px] uppercase font-black text-zinc-600">Upload</span>}
                            <input type="file" ref={fileInputRef} onChange={(e) => handleSingleFileChange(e, (url) => setPreviewImages([url]))} className="hidden" accept="image/*" />
                         </div>
                         <button type="submit" className="w-full bg-green-500 text-black py-4 text-[10px] font-black uppercase rounded-xl">Salvar</button>
                       </form>
                    </div>
                  </div>
                  <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-6">
                    {logos.map(l => (
                      <div key={l.id} className={`bg-zinc-950 border-2 p-6 rounded-[32px] transition-all relative text-center ${settings.activeLogoId === l.id ? 'border-green-500' : 'border-zinc-900'}`}>
                         <div className="h-24 flex items-center justify-center mb-6">
                            <img src={l.url} className="max-h-full max-w-full object-contain" />
                         </div>
                         <button onClick={() => selectActiveLogo(l.id)} disabled={settings.activeLogoId === l.id} className={`w-full py-2 text-[8px] font-black uppercase rounded-lg ${settings.activeLogoId === l.id ? 'bg-zinc-900 text-zinc-600' : 'bg-white text-black hover:bg-green-500'}`}>
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
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800 relative">
                      <img src={p.image} className="w-full h-full object-cover" alt="" />
                      {p.images && p.images.length > 1 && (
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[7px] text-white px-1 rounded-sm">+{p.images.length - 1}</div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                        {p.name}
                        {p.isPromo && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Promoção"></span>}
                      </h4>
                      <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">
                        {categories.find(c => c.id === p.categoryId)?.name} • {subcategories.find(s => s.id === p.subcategoryId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(p); setPreviewImages(p.images || []); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}

              {tab === 'categories' && categories.map(c => (
                <div key={c.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group shadow-md hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 p-1">
                      <img src={c.image} className="w-full h-full object-cover rounded-full" alt="" />
                    </div>
                    <h4 className="text-sm font-bold uppercase tracking-widest">{c.name}</h4>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(c); setPreviewImages([c.image]); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  </div>
                </div>
              ))}

              {tab === 'subcategories' && subcategories.map(s => (
                <div key={s.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group shadow-md hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800">
                      <img src={s.image || 'https://placehold.co/400x400/18181b/fafafa?text=PV'} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase">{s.name}</h4>
                      <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Pertence a: {categories.find(c => c.id === s.categoryId)?.name}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingItem(s); setPreviewImages([s.image]); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
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
