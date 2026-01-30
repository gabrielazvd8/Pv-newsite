
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      let type: any = 'product';
      if (tab === 'categories' || tab === 'subcategories') type = 'category';
      if (tab === 'settings') {
        if (subTab === 'logo') type = 'logo';
        if (subTab === 'carousel') type = 'banner';
        if (subTab === 'teampv') type = 'teampv';
      }

      for (const file of files) {
        const data = await storage.uploadToCloudinary(file, type);
        setCurrentGallery(prev => (tab === 'products' ? [...prev, data.url] : [data.url]));
      }
    } catch (err) {
      alert("Erro no upload: " + err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSaveProduct = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0) return alert('Selecione uma imagem.');

    const item: Product = {
      id: editingItem?.id || `prod_${Date.now()}`,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      subcategoryId: fd.get('subcategoryId') as string || 'All',
      image: currentGallery[0],
      images: currentGallery,
      description: fd.get('description') as string || '',
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

  const handleSaveCategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0 && !editingItem) return alert('Selecione uma imagem.');

    await storage.saveCategory({
      id: editingItem?.id,
      nome: fd.get('nome') as string,
      midia: currentGallery[0] || editingItem?.midia
    });

    resetForm();
    await loadData();
    onUpdate();
  };

  const handleSaveSubcategory = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (currentGallery.length === 0 && !editingItem) return alert('Selecione uma imagem.');

    await storage.saveSubcategory({
      id: editingItem?.id,
      nome: fd.get('nome') as string,
      categoriaId: fd.get('categoriaId') as string,
      midia: currentGallery[0] || editingItem?.midia
    });

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

  const startEdit = (item: any) => {
    setEditingItem(item);
    setCurrentGallery(item.images || [item.image || item.midia]);
  };

  const toggleStatus = async (type: 'cat' | 'sub', item: any) => {
    const updated = { ...item, ativo: !item.ativo };
    if (type === 'cat') await storage.saveCategory(updated);
    else await storage.saveSubcategory(updated);
    loadData();
    onUpdate();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      {isUploading && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200] flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-t-4 border-green-500 rounded-full animate-spin mb-6"></div>
          <p className="text-xs font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Cloudinary...</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <h1 className="text-4xl font-black uppercase tracking-tighter italic">PV ADMIN <span className="text-green-500">PRO</span></h1>
        <div className="flex gap-4">
          <button onClick={onBack} className="px-8 py-3 bg-zinc-900 text-[10px] uppercase font-black hover:bg-zinc-800 transition-all rounded-2xl">Vitrine</button>
          <button onClick={onLogout} className="px-8 py-3 bg-red-950/20 text-red-500 text-[10px] uppercase font-black hover:bg-red-950/40 transition-all rounded-2xl">Logout</button>
        </div>
      </div>

      <nav className="flex gap-4 mb-12 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
        {['products', 'categories', 'subcategories', 'settings'].map(t => (
          <button 
            key={t}
            onClick={() => { setTab(t as any); resetForm(); }}
            className={`px-8 py-4 text-[11px] uppercase font-black tracking-widest transition-all rounded-2xl border ${tab === t ? 'bg-zinc-900 text-green-500 border-zinc-800' : 'text-zinc-600 border-transparent hover:text-zinc-300'}`}
          >
            {t === 'products' ? 'Produtos' : t === 'categories' ? 'Categorias' : t === 'subcategories' ? 'Subcategorias' : 'Configurações'}
          </button>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {tab !== 'settings' && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-[40px] sticky top-8 shadow-2xl">
              <h2 className="text-2xl font-black mb-8 uppercase tracking-tighter italic">
                {editingItem ? 'Editar' : 'Novo'} {tab === 'products' ? 'Produto' : tab === 'categories' ? 'Categoria' : 'Subcategoria'}
              </h2>
              
              <form onSubmit={tab === 'products' ? handleSaveProduct : tab === 'categories' ? handleSaveCategory : handleSaveSubcategory} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2">Nome</label>
                  <input type="text" name={tab === 'products' ? "name" : "nome"} defaultValue={editingItem?.name || editingItem?.nome} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none" required />
                </div>

                {tab === 'products' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-600 ml-2">Preço</label>
                      <input type="text" name="price" defaultValue={editingItem?.price} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-zinc-600 ml-2">Categoria</label>
                      <select name="categoryId" defaultValue={editingItem?.categoryId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none" required>
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {tab === 'subcategories' && (
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-black text-zinc-600 ml-2">Categoria Pai</label>
                    <select name="categoriaId" defaultValue={editingItem?.categoriaId} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none" required>
                      <option value="">Vincular a...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2">Miniatura (Cloudinary)</label>
                  <div onClick={() => multiFileInputRef.current?.click()} className="w-full min-h-[160px] bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all">
                    <p className="text-[10px] uppercase font-black text-zinc-700 tracking-[0.2em]">Upload Imagem</p>
                    <input type="file" ref={multiFileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {currentGallery.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setCurrentGallery(prev => prev.filter((_, i) => i !== idx))} className="absolute inset-0 bg-red-600/60 opacity-0 hover:opacity-100 flex items-center justify-center text-white font-black uppercase text-[8px]">Excluir</button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-green-500 text-black py-5 text-[11px] font-black uppercase rounded-2xl shadow-lg active:scale-95">Salvar no Firebase</button>
                {editingItem && <button type="button" onClick={resetForm} className="w-full text-zinc-600 text-[9px] uppercase font-black">Cancelar</button>}
              </form>
            </div>
          </div>
        )}

        <div className={tab === 'settings' ? "lg:col-span-12" : "lg:col-span-7"}>
          <div className="space-y-6">
            {tab === 'categories' && categories.map(cat => (
              <div key={cat.id} className="bg-zinc-950 p-6 border border-zinc-900 rounded-[35px] flex items-center justify-between group hover:border-green-500/30 transition-all shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-zinc-800">
                    <img src={cat.midia} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight italic">{cat.nome}</h4>
                    <span className={`text-[8px] uppercase font-black px-2 py-1 rounded ${cat.ativo ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {cat.ativo ? 'Ativo' : 'Oculto'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleStatus('cat', cat)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                  <button onClick={() => startEdit(cat)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => storage.deleteCategory(cat.id).then(loadData)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}

            {tab === 'subcategories' && subcategories.map(sub => (
              <div key={sub.id} className="bg-zinc-950 p-6 border border-zinc-900 rounded-[35px] flex items-center justify-between group hover:border-green-500/30 transition-all shadow-xl">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={sub.midia} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-tight italic">{sub.nome}</h4>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase">Categoria: {categories.find(c => c.id === sub.categoriaId)?.nome || '?'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => toggleStatus('sub', sub)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                  <button onClick={() => startEdit(sub)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => storage.deleteSubcategory(sub.id).then(loadData)} className="p-4 bg-zinc-900 rounded-2xl text-zinc-500 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
