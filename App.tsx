
import React, { useState, useEffect, useMemo } from 'react';
import { Product, AppView, Category, Subcategory, AppSettings, Logo, TeamPVItem } from './types';
import * as storage from './services/storage';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CategoryCarousel from './components/CategoryCarousel';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminLogin from './components/Admin/AdminLogin';
import TeamPVSection from './components/TeamPVSection';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('store');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ 
    promoSectionActive: false,
    prontaEntregaSectionActive: true, 
    lancamentoSectionActive: true,
    teamPVSectionActive: false,
    activeLogoId: 'default'
  });
  const [logos, setLogos] = useState<Logo[]>([]);
  const [teamPVItems, setTeamPVItems] = useState<TeamPVItem[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeSubcategory, setActiveSubcategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const initApp = async () => {
      await loadAppData();
      const auth = sessionStorage.getItem('pv_admin_auth');
      if (auth === 'true') setIsAuthenticated(true);
      const handleScroll = () => setIsScrolled(window.scrollY > 150);
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    };
    initApp();
  }, []);

  const loadAppData = async () => {
    try {
      const siteConfig = await storage.getSiteConfig();
      const [p, c, s, allLogos, tpv] = await Promise.all([
        storage.getProducts(),
        storage.getCategories(true),
        storage.getSubcategories(true),
        storage.getLogos(),
        storage.getTeamPVItems()
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setSubcategories(s || []);
      setSettings(siteConfig.settings);
      setLogos(allLogos || []);
      setTeamPVItems(tpv || []);
    } catch (err) { console.error("Falha ao carregar dados vitrine:", err); }
  };

  const activeLogo = useMemo(() => logos.find(l => l.ativo) || logos[0], [logos]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'All' || p.categoryId === activeCategory;
      const matchesSub = activeSubcategory === 'All' || p.subcategoryId === activeSubcategory;
      return matchesSearch && matchesCat && matchesSub;
    });
  }, [products, searchQuery, activeCategory, activeSubcategory]);

  const promoProducts = useMemo(() => products.filter(p => p.isPromo), [products]);
  const prontaEntregaProducts = useMemo(() => products.filter(p => p.isProntaEntrega), [products]);
  const lancamentoProducts = useMemo(() => products.filter(p => p.isLancamento), [products]);

  const isBrowsing = activeCategory !== 'All' || activeSubcategory !== 'All' || searchQuery !== '';

  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setActiveSubcategory('All');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 flex flex-col overflow-x-hidden">
      {view === 'store' && (
        <>
          <Header isScrolled={isScrolled} searchQuery={searchQuery} onSearchChange={setSearchQuery} onAdminClick={() => setView(isAuthenticated ? 'admin' : 'login')} activeLogo={activeLogo} onResetFilter={handleResetFilters} />
          
          <main className="flex-grow">
            <Hero />
            
            <div className={`transition-all duration-700 container mx-auto px-4 mb-20 ${isScrolled ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
              <SearchBar value={searchQuery} onChange={setSearchQuery} neonEffect={true} />
            </div>

            {!isBrowsing && (
              <div className="space-y-0">
                {settings.promoSectionActive && promoProducts.length > 0 && (
                  <section className="bg-red-600/5 border-y border-red-500/20 py-24 text-center">
                    <div className="container mx-auto px-4">
                      <span className="text-red-500 text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-red-500/10 px-4 py-1 rounded-full border border-red-500/20 inline-block">Sale Elite</span>
                      <h2 className="text-5xl md:text-7xl font-black italic uppercase italic tracking-tighter text-white mb-12">PROMO<span className="text-red-500">ÇÃO</span></h2>
                      <ProductGrid products={promoProducts} onProductClick={setSelectedProduct} />
                    </div>
                  </section>
                )}
                {settings.lancamentoSectionActive && lancamentoProducts.length > 0 && (
                  <section className="bg-zinc-950/50 border-b border-zinc-900 py-24 text-center">
                    <div className="container mx-auto px-4">
                      <span className="text-white text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-white/5 px-4 py-1 rounded-full border border-white/10 inline-block">Drop {currentYear}</span>
                      <h2 className="text-5xl md:text-7xl font-black italic uppercase italic tracking-tighter text-white mb-12">LANÇA<span className="text-zinc-500">MENTO</span></h2>
                      <ProductGrid products={lancamentoProducts} onProductClick={setSelectedProduct} />
                    </div>
                  </section>
                )}
                {settings.prontaEntregaSectionActive && prontaEntregaProducts.length > 0 && (
                  <section className="bg-zinc-950 border-b border-zinc-900 py-24 text-center">
                    <div className="container mx-auto px-4">
                      <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20 inline-block">Pronta Entrega</span>
                      <h2 className="text-5xl md:text-7xl font-black italic uppercase italic tracking-tighter text-white mb-12">FAST <span className="text-green-500">STOCK</span></h2>
                      <ProductGrid products={prontaEntregaProducts} onProductClick={setSelectedProduct} />
                    </div>
                  </section>
                )}
              </div>
            )}

            <section className="container mx-auto px-4 py-24">
              <div className="flex items-center justify-between mb-12 border-l-[12px] border-green-500 pl-8">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">
                  {activeSubcategory !== 'All' 
                    ? subcategories.find(s => s.id === activeSubcategory)?.nome 
                    : activeCategory !== 'All' 
                      ? categories.find(c => c.id === activeCategory)?.nome 
                      : 'Vitrine Global'
                  }
                </h2>
                <span className="hidden md:block text-[10px] uppercase tracking-widest text-zinc-700 font-black">{filteredProducts.length} Itens</span>
              </div>
              {filteredProducts.length > 0 ? (
                <ProductGrid products={filteredProducts} onProductClick={setSelectedProduct} />
              ) : (
                <div className="py-32 text-center bg-zinc-950 rounded-[40px] border border-zinc-900">
                  <p className="text-zinc-600 uppercase tracking-[0.3em] font-black text-xs italic mb-4">Nenhum resultado nesta hierarquia.</p>
                  <button onClick={handleResetFilters} className="text-green-500 text-[10px] font-black uppercase tracking-widest">Resetar Filtros</button>
                </div>
              )}
            </section>

            <CategoryCarousel 
              categories={categories} subcategories={subcategories} activeCategory={activeCategory} 
              onCategoryChange={(id) => { setActiveCategory(id); setActiveSubcategory('All'); }} 
              activeSubcategory={activeSubcategory} onSubcategoryChange={setActiveSubcategory} 
            />

            {settings.teamPVSectionActive && teamPVItems.length > 0 && <TeamPVSection items={teamPVItems} />}
          </main>

          <footer className="bg-black border-t border-zinc-900 pt-32 pb-16 text-center">
            <div className="mb-16 opacity-30 hover:opacity-100 transition-all duration-700 inline-block">
               <img src={activeLogo?.midia_url || "assets/img/IMG_3069.PNG"} alt="PV Sports" className="h-24 md:h-32 object-contain" />
            </div>
            <div className="flex justify-center gap-16 mb-24">
              {['Instagram', 'WhatsApp'].map(item => (
                <span key={item} className="text-[10px] uppercase tracking-[0.5em] text-zinc-700 hover:text-green-500 cursor-pointer font-black italic">{item}</span>
              ))}
            </div>
            <div className="container mx-auto px-4 border-t border-zinc-900 pt-16">
               <p className="text-zinc-800 text-[9px] uppercase tracking-[0.8em] font-black italic">PV Sports Heritage &mdash; Estilo de Elite &copy; {currentYear}</p>
            </div>
          </footer>
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
      )}
      {view === 'login' && <AdminLogin onSuccess={() => { setIsAuthenticated(true); setView('admin'); sessionStorage.setItem('pv_admin_auth', 'true'); }} onCancel={() => setView('store')} />}
      {view === 'admin' && <AdminDashboard onLogout={() => { setIsAuthenticated(false); setView('store'); sessionStorage.removeItem('pv_admin_auth'); }} onBack={() => setView('store')} onUpdate={loadAppData} />}
    </div>
  );
};

export default App;
