
/** @AI_LOCKED */

import React, { useState, useEffect, useMemo } from 'react';
import { Instagram, MessageCircle } from 'lucide-react';
import { Product, AppView, Category, Subcategory, AppSettings, Logo, TeamPVItem, Announcement } from './types';
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
import AnnouncementBar from './components/AnnouncementBar';
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
    activeLogoId: 'default',
    announcementBarActive: false
  });
  const [logos, setLogos] = useState<Logo[]>([]);
  const [teamPVItems, setTeamPVItems] = useState<TeamPVItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  
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
      // Carregar configurações de forma independente para garantir que a UI tenha as flags de seção
      const siteConfig = await storage.getSiteConfig();
      if (siteConfig && siteConfig.settings) {
        setSettings(siteConfig.settings);
      }

      // Carregamento paralelo com tratamento individual de erro para garantir que a vitrine popule os estados
      // mesmo que uma coleção secundária falhe ou esteja vazia.
      const [p, c, s, allLogos, tpv, ann] = await Promise.all([
        storage.getProducts().catch(() => []),
        storage.getCategories(true).catch(() => []),
        storage.getSubcategories(true).catch(() => []),
        storage.getLogos().catch(() => []),
        storage.getTeamPVItems().catch(() => []),
        storage.getAnnouncements(true).catch(() => [])
      ]);

      setProducts(p || []);
      setCategories(c || []);
      setSubcategories(s || []);
      setLogos(allLogos || []);
      setTeamPVItems(tpv || []);
      setAnnouncements(ann || []);

    } catch (err) { 
      console.error("Falha crítica ao carregar dados vitrine:", err); 
    }
  };

  const activeLogo = useMemo(() => logos.find(l => l.ativo) || logos[0], [logos]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const name = p.name || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
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
          {settings.announcementBarActive && announcements.length > 0 && (
            <AnnouncementBar announcements={announcements} />
          )}
          <Header isScrolled={isScrolled} searchQuery={searchQuery} onSearchChange={setSearchQuery} activeLogo={activeLogo} onResetFilter={handleResetFilters} />
          
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

            {/* Fix: Added missing CategoryCarousel properties to resolve TypeScript error */}
            <CategoryCarousel 
              categories={categories} 
              subcategories={subcategories} 
              activeCategory={activeCategory} 
              onCategoryChange={(id) => { 
                setActiveCategory(id);
                setActiveSubcategory('All');
              }}
              activeSubcategory={activeSubcategory}
              onSubcategoryChange={setActiveSubcategory}
            />

            {settings.teamPVSectionActive && teamPVItems.length > 0 && (
              <TeamPVSection items={teamPVItems} />
            )}
          </main>
      
          <footer className="bg-zinc-900 pt-20 pb-10 border-t border-zinc-800">
             <div className="container mx-auto px-4 text-center">
                {/* 1. Logo */}
                <div className="flex justify-center mb-8 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={handleResetFilters}>
                  {activeLogo?.midia_url ? (
                    <img src={activeLogo.midia_url} alt="PV Sports" className="h-20 object-contain" />
                  ) : (
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">PV<span className="text-green-500">SPORTS</span></h1>
                  )}
                </div>

                {/* 2. Social Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                  <a 
                    href="https://instagram.com/pvsports16" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  >
                    <Instagram className="w-4 h-4 text-pink-500" />
                    Instagram
                  </a>
                  <a 
                    href="https://wa.me/+55998538567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:scale-105 transition-all duration-300"
                  >
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    WhatsApp
                  </a>
                </div>

                {/* 3. Copyright */}
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-8">
                  &copy; 2021 PV Sports. Todos os direitos reservados.
                </p>

                {/* 4. Divider */}
                <div className="w-full h-[1px] bg-white/[0.08] mb-8"></div>

                {/* 5. Credits */}
                <div className="space-y-2 relative">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">
                    Site feito por <a href="https://instagram.com/azvd.ai" target="_blank" rel="noopener noreferrer" className="underline text-zinc-400 hover:text-white transition-colors">AZVD.AI</a>
                  </p>
                  <p className="text-[9px] text-zinc-700 uppercase tracking-widest font-bold">
                    Desenvolvedor: <span className="underline">Gabriel Azevedo</span>
                  </p>

                  {/* Admin Access - Discrete */}
                  <div className="pt-12">
                    <button 
                      onClick={() => setView(isAuthenticated ? 'admin' : 'login')}
                      className="text-[7px] text-zinc-700 uppercase tracking-[0.4em] hover:text-zinc-400 transition-colors"
                    >
                      Acesso Restrito
                    </button>
                  </div>
                </div>
             </div>
          </footer>

          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        </>
      )}

      {view === 'admin' && (
        <AdminDashboard 
          onLogout={handleLogout} 
          onBack={() => setView('store')} 
          onUpdate={loadAppData}
        />
      )}

      {view === 'login' && (
        <AdminLogin 
          onSuccess={() => setView('admin')} 
          onCancel={() => setView('store')} 
        />
      )}

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/+5584998538567?text=ol%C3%A1%20PV%2C%20gostaria%20de%20tirar%20uma%20dúvida!"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[100] flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-[0_10px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_15px_30px_rgba(37,211,102,0.4)] transition-all animate-whatsapp-pulse"
        aria-label="Chat on WhatsApp"
      >
        <svg
          className="w-8 h-8 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>

      <style>{`
        @keyframes whatsapp-pulse {
          0% { transform: scale(1); box-shadow: 0 10px 20px rgba(37,211,102,0.3); }
          50% { transform: scale(1.08); box-shadow: 0 15px 30px rgba(37,211,102,0.5); }
          100% { transform: scale(1); box-shadow: 0 10px 20px rgba(37,211,102,0.3); }
        }
        .animate-whatsapp-pulse {
          animation: whatsapp-pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default App;
