
import React, { useState, useEffect, useMemo } from 'react';
import { Product, AppView, Category, Subcategory, AppSettings } from './types';
import * as storage from './services/storage';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CategoryCarousel from './components/CategoryCarousel';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';

// Main App Component
const App: React.FC = () => {
  const [view, setView] = useState<AppView>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ prontaEntregaSectionActive: true, lancamentoSectionActive: true });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setSettings(storage.getSettings());
    
    const auth = sessionStorage.getItem('pv_admin_auth');
    if (auth === 'true') setIsAuthenticated(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || p.categoryId === activeCategory;
      const matchesSub = activeSubcategory === 'All' || p.subcategoryId === activeSubcategory;
      return matchesSearch && matchesCat && matchesSub;
    });
  }, [products, searchQuery, activeCategory, activeSubcategory]);

  const prontaEntregaProducts = useMemo(() => {
    return products.filter(p => p.isProntaEntrega);
  }, [products]);

  const lancamentoProducts = useMemo(() => {
    return products.filter(p => p.isLancamento);
  }, [products]);

  const handleAdminUpdate = () => {
    setProducts(storage.getProducts());
    setCategories(storage.getCategories());
    setSubcategories(storage.getSubcategories());
    setSettings(storage.getSettings());
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex flex-col">
      {view === 'store' && (
        <>
          <Header 
            isScrolled={isScrolled}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            subcategories={subcategories}
            activeCategory={activeCategory}
            onCategoryChange={(id) => { setActiveCategory(id); setActiveSubcategory('All'); }}
            activeSubcategory={activeSubcategory}
            onSubcategoryChange={setActiveSubcategory}
            onAdminClick={() => setView(isAuthenticated ? 'admin' : 'login')}
          />
          
          <main className="flex-grow">
            <Hero />
            
            <div className={`transition-all duration-700 container mx-auto px-4 mb-20 ${isScrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <SearchBar 
                value={searchQuery} 
                onChange={setSearchQuery} 
                neonEffect={true} 
              />
            </div>

            {/* Armadura PV Section (Principais) */}
            <section className="container mx-auto px-4 py-12">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-green-500 pl-6">
                  {activeCategory === 'All' ? 'Armadura PV' : categories.find(c => c.id === activeCategory)?.name}
                </h2>
                <div className="hidden md:block text-right">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-700 font-black">
                    {filteredProducts.length} Peças Disponíveis
                  </span>
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} onProductClick={setSelectedProduct} />
              ) : (
                <div className="py-32 text-center">
                  <p className="text-zinc-600 uppercase tracking-[0.3em] font-bold text-sm">A busca não retornou resultados.</p>
                  <button onClick={() => {setSearchQuery(''); setActiveCategory('All'); setActiveSubcategory('All');}} className="mt-4 text-green-500 text-xs font-black uppercase tracking-widest hover:underline">Limpar Filtros</button>
                </div>
              )}
            </section>

            {/* Seção Lançamento */}
            {settings.lancamentoSectionActive && lancamentoProducts.length > 0 && (
              <section className="bg-zinc-950/50 border-t border-zinc-900 py-24 mt-20">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-white text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-white/5 px-4 py-1 rounded-full border border-white/10">
                      Novidade
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
                      LANÇA<span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">MENTO</span>
                    </h2>
                    <p className="text-zinc-500 max-w-md mt-6 text-sm uppercase tracking-widest font-medium opacity-60">
                      As armaduras mais recentes da temporada chegaram.
                    </p>
                    <div className="w-24 h-1.5 bg-white mt-8 shadow-[0_0_20px_rgba(255,255,255,0.2)] rounded-full"></div>
                  </div>
                  
                  <ProductGrid products={lancamentoProducts} onProductClick={setSelectedProduct} />
                </div>
              </section>
            )}

            {/* Categorias Interactive Carousel Section */}
            <CategoryCarousel 
              categories={categories}
              subcategories={subcategories}
              activeCategory={activeCategory}
              onCategoryChange={(id) => { setActiveCategory(id); setActiveSubcategory('All'); }}
              activeSubcategory={activeSubcategory}
              onSubcategoryChange={setActiveSubcategory}
            />

            {/* Seção Pronta Entrega */}
            {settings.prontaEntregaSectionActive && prontaEntregaProducts.length > 0 && (
              <section className="bg-zinc-950 border-y border-zinc-900 py-24">
                <div className="container mx-auto px-4">
                  <div className="flex flex-col items-center mb-16 text-center">
                    <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20">
                      Envio Imediato
                    </span>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
                      PRONTA <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-300">ENTREGA</span>
                    </h2>
                    <p className="text-zinc-500 max-w-md mt-6 text-sm uppercase tracking-widest font-medium opacity-60">
                      Peças exclusivas em estoque. Receba em tempo recorde.
                    </p>
                    <div className="w-24 h-1.5 bg-green-500 mt-8 shadow-[0_0_20px_rgba(34,197,94,0.6)] rounded-full"></div>
                  </div>
                  
                  <ProductGrid products={prontaEntregaProducts} onProductClick={setSelectedProduct} />
                </div>
              </section>
            )}
          </main>

          <footer className="bg-black border-t border-zinc-900 pt-24 pb-12 text-center">
            <div className="mb-12 opacity-20 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 cursor-pointer inline-block">
               <img src="/img/IMG_3069.PNG" alt="PV Sports" className="h-20" />
            </div>
            <div className="flex justify-center gap-12 mb-16">
              {['Instagram', 'WhatsApp', 'Suporte VIP'].map(item => (
                <span key={item} className="text-[10px] uppercase tracking-[0.3em] text-zinc-600 hover:text-green-500 cursor-pointer transition-all hover:tracking-[0.4em] font-black">
                  {item}
                </span>
              ))}
            </div>
            <div className="container mx-auto px-4 border-t border-zinc-900 pt-12">
               <p className="text-zinc-800 text-[9px] uppercase tracking-[0.6em] font-medium italic">
                 PV Sports Heritage &mdash; Estilo e Performance de Elite &copy; 2024
               </p>
            </div>
          </footer>

          <div className="bg-[#0b0b0b] py-8 border-t border-zinc-900/50 text-center">
            <a 
              href="https://wa.me/5584998081630" 
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-[10px] text-zinc-600 hover:text-green-500 transition-colors uppercase font-black tracking-widest"
            >
              <span>Suporte Técnico Direto</span>
            </a>
          </div>

          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
          />
        </>
      )}

      {view === 'login' && (
        <AdminLogin 
          onSuccess={() => { setIsAuthenticated(true); setView('admin'); sessionStorage.setItem('pv_admin_auth', 'true'); }} 
          onCancel={() => setView('store')} 
        />
      )}

      {view === 'admin' && (
        <AdminDashboard 
          onLogout={() => { setIsAuthenticated(false); setView('store'); sessionStorage.removeItem('pv_admin_auth'); }} 
          onBack={() => setView('store')}
          onUpdate={handleAdminUpdate}
        />
      )}
    </div>
  );
};

export default App;
