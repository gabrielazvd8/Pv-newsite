
import React, { useState, useEffect, useRef } from 'react';
import * as storage from '../../services/storage';
import { Product, Category, Subcategory, AppSettings } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, onUpdate }) => {
  const [tab, setTab] = useState<'products' | 'categories' | 'subcategories' | 'pronta-entrega' | 'lancamentos'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ prontaEntregaSectionActive: true, lancamentoSectionActive: true });
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setSettings(storage.getSettings());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WEBP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo muito grande. Máximo 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCategory = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `cat_${Math.random().toString(36).substr(2, 5)}`;
    const newCat: Category = {
      id,
      name: fd.get('name') as string,
      image: previewImage || editingItem?.image || ''
    };
    const updated = editingItem 
      ? categories.map(c => c.id === id ? newCat : c)
      : [...categories, newCat];
    
    storage.saveCategories(updated);
    setCategories(updated);
    resetForm();
    onUpdate();
  };

  const deleteCategory = (id: string) => {
    if (!confirm('Excluir categoria? Isso afetará subcategorias e produtos vinculados.')) return;
    const updated = categories.filter(c => c.id !== id);
    storage.saveCategories(updated);
    setCategories(updated);
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
      image: previewImage || editingItem?.image || ''
    };
    const updated = editingItem 
      ? subcategories.map(s => s.id === id ? newSub : s)
      : [...subcategories, newSub];
    
    storage.saveSubcategories(updated);
    setSubcategories(updated);
    resetForm();
    onUpdate();
  };

  const deleteSubcategory = (id: string) => {
    if (!confirm('Excluir subcategoria?')) return;
    const updated = subcategories.filter(s => s.id !== id);
    storage.saveSubcategories(updated);
    setSubcategories(updated);
    onUpdate();
  };

  const handleSaveProduct = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = editingItem?.id || `prod_${Math.random().toString(36).substr(2, 9)}`;
    const item: Product = {
      id,
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      subcategoryId: fd.get('subcategoryId') as string,
      image: previewImage || editingItem?.image || (fd.get('imageUrl') as string),
      description: fd.get('description') as string,
      isProntaEntrega: fd.get('isProntaEntrega') === 'on',
      isLancamento: fd.get('isLancamento') === 'on'
    };
    
    const updated = editingItem 
      ? products.map(p => p.id === id ? item : p)
      : [...products, item];
    
    storage.saveProducts(updated);
    setProducts(updated);
    resetForm();
    onUpdate();
  };

  const deleteProduct = (id: string) => {
    if (!confirm('Excluir este produto permanentemente?')) return;
    const updated = products.filter(p => p.id !== id);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  const resetForm = () => {
    setEditingItem(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleProductFlag = (id: string, flag: 'isProntaEntrega' | 'isLancamento') => {
    const updated = products.map(p => p.id === id ? { ...p, [flag]: !p[flag] } : p);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  const toggleSectionActive = (setting: keyof AppSettings) => {
    const newSettings = { ...settings, [setting]: !settings[setting] };
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    onUpdate();
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-black text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PV Admin <span className="text-green-500">PRO</span></h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] mt-2">Sistema de Gestão de Ativos</p>
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
          { id: 'pronta-entrega', label: 'Pronta Entrega' },
          { id: 'lancamentos', label: 'Lançamentos' }
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
        {['products', 'categories', 'subcategories'].includes(tab) && (
          <div className="lg:col-span-5">
            <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-[32px] sticky top-8">
              <h2 className="text-xl font-black mb-8 uppercase tracking-tighter flex items-center gap-3">
                <div className="w-2 h-8 bg-green-500 rounded-full"></div>
                {editingItem ? 'Editar Registro' : `Novo ${tab.replace('-', ' ')}`}
              </h2>
              
              <form 
                onSubmit={tab === 'products' ? handleSaveProduct : tab === 'categories' ? handleSaveCategory : handleSaveSubcategory} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Nome / Título</label>
                  <input type="text" name="name" placeholder="Ex: Real Madrid Home" defaultValue={editingItem?.name} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl focus:border-green-500 outline-none transition-all" required />
                </div>

                {tab === 'products' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Categoria</label>
                        <select name="categoryId" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
                          {categories.map(c => <option key={c.id} value={c.id} selected={editingItem?.categoryId === c.id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Subcategoria</label>
                        <select name="subcategoryId" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
                          {subcategories.map(s => <option key={s.id} value={s.id} selected={editingItem?.subcategoryId === s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 bg-black border border-zinc-800 p-4 rounded-2xl">
                        <input type="checkbox" name="isProntaEntrega" defaultChecked={editingItem?.isProntaEntrega} className="w-5 h-5 accent-green-500" />
                        <label className="text-[10px] uppercase font-black text-zinc-400">Pronta Entrega</label>
                      </div>
                      <div className="flex items-center gap-3 bg-black border border-zinc-800 p-4 rounded-2xl">
                        <input type="checkbox" name="isLancamento" defaultChecked={editingItem?.isLancamento} className="w-5 h-5 accent-zinc-100" />
                        <label className="text-[10px] uppercase font-black text-zinc-400">Lançamento</label>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Descrição</label>
                      <textarea name="description" placeholder="Detalhes técnicos..." defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl h-24 outline-none focus:border-green-500"></textarea>
                    </div>
                  </>
                )}

                {tab === 'subcategories' && (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Categoria Pai</label>
                    <select name="categoryId" className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-2xl outline-none focus:border-green-500" required>
                      {categories.map(c => <option key={c.id} value={c.id} selected={editingItem?.categoryId === c.id}>{c.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-zinc-600 ml-2 tracking-widest">Mídia do Item</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video bg-black border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-green-500/50 transition-all overflow-hidden relative group"
                  >
                    {(previewImage || editingItem?.image) ? (
                      <>
                        <img src={previewImage || editingItem?.image} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-[10px] uppercase font-black tracking-widest">Trocar Imagem</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <svg className="w-8 h-8 text-zinc-700 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Upload (JPG, PNG, WEBP)</p>
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                  </div>
                </div>

                <div className="flex gap-3">
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

        <div className={`lg:col-span-${['pronta-entrega', 'lancamentos'].includes(tab) ? '12' : '7'} space-y-4`}>
          {!['pronta-entrega', 'lancamentos'].includes(tab) && (
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs uppercase font-black text-zinc-500 tracking-[0.3em]">Registros Ativos</h3>
              <span className="text-[10px] bg-zinc-900 px-3 py-1 rounded-full text-zinc-500 border border-zinc-800">
                Total: {tab === 'products' ? products.length : tab === 'categories' ? categories.length : subcategories.length}
              </span>
            </div>
          )}

          <div className="max-h-[80vh] overflow-y-auto pr-2 space-y-4 no-scrollbar">
            {tab === 'products' && products.map(p => (
              <div key={p.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group hover:border-green-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={p.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                      {p.name}
                      {p.isProntaEntrega && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" title="Pronta Entrega"></span>}
                      {p.isLancamento && <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.5)]" title="Lançamento"></span>}
                    </h4>
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest mt-1">
                      {categories.find(c => c.id === p.categoryId)?.name} • {subcategories.find(s => s.id === p.subcategoryId)?.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingItem(p); setPreviewImage(null); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}

            {tab === 'categories' && categories.map(c => (
              <div key={c.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-800 p-1">
                    <img src={c.image} className="w-full h-full object-cover rounded-full" alt="" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest">{c.name}</h4>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingItem(c); setPreviewImage(null); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => deleteCategory(c.id)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}

            {tab === 'subcategories' && subcategories.map(s => (
              <div key={s.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-3xl flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={s.image || 'https://placehold.co/400x400/000/000'} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold uppercase">{s.name}</h4>
                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest">Pertence a: {categories.find(c => c.id === s.categoryId)?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingItem(s); setPreviewImage(null); }} className="p-3 text-zinc-500 hover:text-white bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                  <button onClick={() => deleteSubcategory(s.id)} className="p-3 text-zinc-500 hover:text-red-500 bg-zinc-900/50 rounded-xl"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}

            {(tab === 'pronta-entrega' || tab === 'lancamentos') && (
              <div className="max-w-4xl mx-auto py-10">
                <div className="bg-zinc-950 p-10 border border-zinc-900 rounded-[40px] mb-12 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Visibilidade da Seção</h2>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Ligar/Desligar {tab === 'lancamentos' ? 'Lançamentos' : 'Pronta Entrega'} na vitrine</p>
                  </div>
                  <button 
                    onClick={() => toggleSectionActive(tab === 'lancamentos' ? 'lancamentoSectionActive' : 'prontaEntregaSectionActive')}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none shadow-2xl ${settings[tab === 'lancamentos' ? 'lancamentoSectionActive' : 'prontaEntregaSectionActive'] ? 'bg-green-500' : 'bg-zinc-800'}`}
                  >
                    <span className={`inline-block h-8 w-8 transform rounded-full bg-white shadow-xl transition-transform ${settings[tab === 'lancamentos' ? 'lancamentoSectionActive' : 'prontaEntregaSectionActive'] ? 'translate-x-10' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(p => {
                    const flag = tab === 'lancamentos' ? 'isLancamento' : 'isProntaEntrega';
                    const active = p[flag];
                    return (
                      <div 
                        key={p.id} 
                        onClick={() => toggleProductFlag(p.id, flag)}
                        className={`p-6 border-2 rounded-[32px] cursor-pointer transition-all flex items-center gap-6 ${active ? (tab === 'lancamentos' ? 'bg-zinc-100/5 border-zinc-100' : 'bg-green-500/5 border-green-500') : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'}`}
                      >
                        <div className="relative">
                          <img src={p.image} className="w-16 h-16 object-cover rounded-2xl" alt="" />
                          {active && (
                            <div className={`absolute -top-3 -right-3 p-1.5 rounded-full shadow-lg ${tab === 'lancamentos' ? 'bg-white text-black' : 'bg-green-500 text-black'}`}>
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className={`text-sm font-black uppercase tracking-tight ${active ? (tab === 'lancamentos' ? 'text-white' : 'text-green-500') : 'text-zinc-400'}`}>{p.name}</h4>
                          <p className="text-[9px] uppercase font-black text-zinc-600 mt-1">{active ? 'Ativo na Seção' : 'Clique para Adicionar'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
