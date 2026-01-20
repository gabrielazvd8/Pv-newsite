
import React, { useState, useEffect } from 'react';
import * as storage from '../../services/storage';
import { Product, Category, Subcategory, AppSettings } from '../../types';

interface AdminDashboardProps {
  onLogout: () => void;
  onBack: () => void;
  onUpdate: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onBack, onUpdate }) => {
  const [tab, setTab] = useState<'products' | 'categories' | 'subcategories' | 'pronta-entrega'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ prontaEntregaSectionActive: true });
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setSettings(storage.getSettings());
  }, []);

  const handleSaveProduct = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const item: Product = {
      id: editingItem?.id || Math.random().toString(36).substr(2, 9),
      name: fd.get('name') as string,
      categoryId: fd.get('categoryId') as string,
      subcategoryId: fd.get('subcategoryId') as string,
      image: fd.get('image') as string,
      description: fd.get('description') as string,
      isProntaEntrega: fd.get('isProntaEntrega') === 'on'
    };
    
    const newProducts = editingItem 
      ? products.map(p => p.id === item.id ? item : p)
      : [...products, item];
    
    storage.saveProducts(newProducts);
    setProducts(newProducts);
    setEditingItem(null);
    onUpdate();
  };

  const toggleProntaEntregaStatus = (id: string) => {
    const updated = products.map(p => p.id === id ? { ...p, isProntaEntrega: !p.isProntaEntrega } : p);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  const toggleSectionActive = () => {
    const newSettings = { ...settings, prontaEntregaSectionActive: !settings.prontaEntregaSectionActive };
    storage.saveSettings(newSettings);
    setSettings(newSettings);
    onUpdate();
  };

  const deleteProduct = (id: string) => {
    if (!confirm('Excluir este produto permanentemente?')) return;
    const updated = products.filter(p => p.id !== id);
    storage.saveProducts(updated);
    setProducts(updated);
    onUpdate();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-black">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">PV Admin Dashboard</h1>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mt-2">Gestão de Inventário e Vitrine</p>
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="px-6 py-2 border border-zinc-800 text-xs uppercase font-bold hover:bg-zinc-900 transition-colors">Voltar Vitrine</button>
          <button onClick={onLogout} className="px-6 py-2 bg-red-900/20 text-red-500 text-xs uppercase font-bold hover:bg-red-900/40 transition-colors">Sair</button>
        </div>
      </div>

      <nav className="flex gap-4 mb-8 border-b border-zinc-900 pb-4 overflow-x-auto no-scrollbar">
        {[
          { id: 'products', label: 'Produtos' },
          { id: 'categories', label: 'Categorias' },
          { id: 'subcategories', label: 'Subcategorias' },
          { id: 'pronta-entrega', label: 'Pronta Entrega' }
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => { setTab(t.id as any); setEditingItem(null); }}
            className={`px-4 py-2 text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all ${tab === t.id ? 'text-green-500' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab: Products */}
      {tab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-zinc-950 p-8 border border-zinc-900 rounded-3xl sticky top-8 h-fit">
            <h2 className="text-xl font-bold mb-8 uppercase tracking-tighter">
              {editingItem ? 'Editar Produto' : 'Novo Produto'}
            </h2>
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <input type="text" name="name" placeholder="Nome do Produto" defaultValue={editingItem?.name} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none transition-all" required />
              <div className="grid grid-cols-2 gap-4">
                <select name="categoryId" className="bg-black border border-zinc-800 p-4 text-sm rounded-xl outline-none focus:border-green-500" required>
                  {categories.map(c => <option key={c.id} value={c.id} selected={editingItem?.categoryId === c.id}>{c.name}</option>)}
                </select>
                <select name="subcategoryId" className="bg-black border border-zinc-800 p-4 text-sm rounded-xl outline-none focus:border-green-500" required>
                  {subcategories.map(s => <option key={s.id} value={s.id} selected={editingItem?.subcategoryId === s.id}>{s.name}</option>)}
                </select>
              </div>
              <input type="url" name="image" placeholder="URL da Imagem" defaultValue={editingItem?.image} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl focus:border-green-500 outline-none transition-all" required />
              <textarea name="description" placeholder="Descrição" defaultValue={editingItem?.description} className="w-full bg-black border border-zinc-800 p-4 text-sm rounded-xl h-32 outline-none focus:border-green-500 transition-all"></textarea>
              <div className="flex items-center gap-3 p-2 bg-black/50 rounded-lg">
                <input type="checkbox" name="isProntaEntrega" defaultChecked={editingItem?.isProntaEntrega} id="pe" className="accent-green-500 w-4 h-4" />
                <label htmlFor="pe" className="text-[10px] text-zinc-400 uppercase font-black tracking-widest cursor-pointer">Marcar como Pronta Entrega</label>
              </div>
              <button type="submit" className="w-full bg-green-500 text-black p-4 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-400 transition-all shadow-lg hover:shadow-green-500/20 active:scale-95">Salvar Produto</button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs uppercase font-bold text-zinc-600 tracking-widest mb-4">Itens Cadastrados ({products.length})</h3>
            <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-4 custom-scrollbar">
              {products.map(p => (
                <div key={p.id} className="bg-zinc-950 p-4 border border-zinc-900 rounded-2xl flex items-center justify-between group hover:border-zinc-700 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-12 h-12 object-cover rounded-lg" alt="" />
                    <div>
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        {p.name}
                        {p.isProntaEntrega && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                      </h4>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">
                        {categories.find(c => c.id === p.categoryId)?.name} • {subcategories.find(s => s.id === p.subcategoryId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditingItem(p)} className="p-2 text-zinc-500 hover:text-white"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={() => deleteProduct(p.id)} className="p-2 text-zinc-500 hover:text-red-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pronta Entrega Management */}
      {tab === 'pronta-entrega' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-zinc-950 p-10 border border-zinc-900 rounded-[40px] mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Visibilidade da Seção</h2>
              <p className="text-zinc-500 text-xs uppercase tracking-widest">Ative ou desative a exibição da Pronta Entrega na Vitrine</p>
            </div>
            <button 
              onClick={toggleSectionActive}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${settings.prontaEntregaSectionActive ? 'bg-green-500' : 'bg-zinc-800'}`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${settings.prontaEntregaSectionActive ? 'translate-x-9' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Gerenciar Produtos em Pronta Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => toggleProntaEntregaStatus(p.id)}
                  className={`p-6 border rounded-3xl cursor-pointer transition-all flex items-center gap-6 ${p.isProntaEntrega ? 'bg-green-500/10 border-green-500' : 'bg-zinc-950 border-zinc-900 hover:border-zinc-700'}`}
                >
                  <div className="relative">
                    <img src={p.image} className="w-16 h-16 object-cover rounded-xl" alt="" />
                    {p.isProntaEntrega && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-black p-1 rounded-full shadow-lg">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className={`text-sm font-bold uppercase ${p.isProntaEntrega ? 'text-green-500' : 'text-zinc-300'}`}>{p.name}</h4>
                    <p className="text-[10px] text-zinc-600 uppercase font-black">{p.isProntaEntrega ? 'No Estoque' : 'Sob Encomenda'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {(tab === 'categories' || tab === 'subcategories') && (
        <div className="py-40 text-center text-zinc-800 uppercase tracking-[0.4em] text-xs">
          Gestão de {tab === 'categories' ? 'Categorias' : 'Subcategorias'} em desenvolvimento.
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
