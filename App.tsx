/** @AI_LOCKED */

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
import { auth, onAuthStateChanged } from "./services/storage";

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
    loadAppData();
    
    // Escutador de Sessão Firebase (usando onAuthStateChanged exportado do storage service)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const hasAccess = await storage.checkAdminAccess(user);
        setIsAuthenticated(hasAccess);
      } else {
        setIsAuthenticated(false);
      }
    });

    const handleScroll = () => setIsScrolled(window.scrollY > 150);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
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

  const handleLogout = async () => {
    await storage.logoutAdmin();
    setIsAuthenticated(false);
    setView('store');
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
              <a 
                href="https://www.instagram.com/pvsports16/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] uppercase tracking-[0.5em] text-zinc-700 hover:text-green-500 cursor-pointer font-black italic transition-colors"
              >
                Instagram
              </a>
              <a 
                href="https://wa.me/5584998538567" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[10px] uppercase tracking-[0.5em] text-zinc-700 hover:text-green-500 cursor-pointer font-black italic transition-colors"
              >
                WhatsApp
              </a>
            </div>

            <div className="container mx-auto px-4 border-t border-zinc-900 pt-16">
               <p className="text-zinc-800 text-[9px] uppercase tracking-[0.8em] font-black italic">PV Sports (since 2021) &mdash; Estilo de Elite &copy; {currentYear}</p>
               <a 
                 href="https://www.instagram.com/azvd.ai/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="mt-6 block text-zinc-900 text-[10px] uppercase tracking-[0.4em] font-black hover:text-green-500 transition-colors"
               >
                 Feito por: AZVD.ai - Desenvolvedor: Gabriel Azevedo
               </a>
            </div>

          </footer>

          {/* Botão Flutuante do WhatsApp */}
          <a 
            href="https://wa.me/5584998538567?text=Olá%20PV,%20gostaria%20de%20tirar%20uma%20dúvida!"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-8 right-8 z-[100] bg-[#25D366] p-4 rounded-full shadow-[0_10px_40px_rgba(37,211,102,0.4)] hover:scale-110 transition-all active:scale-95 group"
            aria-label="Atendimento WhatsApp"
          >
            <svg 
              className="w-8 h-8 text-white animate-[pulse_3s_infinite]" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.107l-.694 2.537 2.59-.68c.767.415 1.748.796 2.847.796 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.76-5.768-5.76zm3.377 8.272c-.14.393-.7.712-1.147.76-.32.033-.733.053-1.18-.093-.277-.093-.637-.215-1.077-.41-1.85-.807-3.047-2.7-3.14-2.827-.093-.126-.76-.993-.76-1.893 0-.9.467-1.34.633-1.527.167-.187.367-.233.49-.233h.353c.113 0 .26.013.407.34.167.387.573 1.4.627 1.507.053.113.087.24.013.387-.073.14-.113.22-.227.353-.113.133-.24.3-.34.407-.113.12-.233.253-.1.48.133.227.593.973 1.273 1.58.873.78 1.607 1.02 1.833 1.133.227.113.36.093.493-.06.133-.153.573-.667.727-.893.153-.227.307-.187.52-.107.213.08 1.353.64 1.587.753.233.113.387.167.447.267.06.1.06.58-.14.973z"/>
            </svg>
          </a>

          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
      )}

      {view === 'login' && <AdminLogin onSuccess={() => { setIsAuthenticated(true); setView('admin'); }} onCancel={() => setView('store')} />}
      {view === 'admin' && <AdminDashboard onLogout={handleLogout} onBack={() => setView('store')} onUpdate={loadAppData} />}
    </div>
  );
};

export default App;