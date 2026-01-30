
import React from 'react';
import { Category, Subcategory, Logo } from '../types';
import SearchBar from './SearchBar';

interface HeaderProps {
  isScrolled: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: Category[];
  subcategories: Subcategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  activeSubcategory: string;
  onSubcategoryChange: (id: string) => void;
  onAdminClick: () => void;
  activeLogo?: Logo;
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, searchQuery, onSearchChange, categories, subcategories, 
  activeCategory, onCategoryChange, activeSubcategory, onSubcategoryChange, onAdminClick,
  activeLogo
}) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isScrolled ? 'bg-black/95 backdrop-blur-3xl py-4 border-b border-zinc-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-transparent py-10'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center transition-all duration-1000 ${isScrolled ? 'justify-between' : 'justify-center'}`}>
          <div className={`transition-all duration-1000 cursor-pointer z-20 flex items-center justify-center ${isScrolled ? 'w-24 md:w-32 transform-none' : 'w-56 md:w-80 transform -translate-y-2'}`} onClick={() => { onCategoryChange('All'); window.scrollTo({top: 0, behavior: 'smooth'}); }}>
             {activeLogo?.url ? (
               <img src={activeLogo.url} alt="PV Sports" className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all" style={{ height: isScrolled ? '40px' : '75px', width: 'auto', maxWidth: '100%' }} />
             ) : (
               <h1 className="text-2xl font-black italic tracking-tighter text-green-500">PV<span className="text-white">SPORTS</span></h1>
             )}
          </div>
          <div className={`absolute left-1/2 -translate-x-1/2 w-full max-w-xl transition-all duration-1000 pointer-events-none px-4 ${isScrolled ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-12 scale-90'}`}>
            <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
          </div>
          <div className={`flex items-center gap-6 transition-all duration-1000 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12 pointer-events-none'}`}>
            <button onClick={onAdminClick} className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-[24px] text-zinc-400 hover:text-green-500 transition-all shadow-xl active:scale-90"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg></button>
          </div>
        </div>

        <nav className={`transition-all duration-1000 flex items-center justify-center gap-6 overflow-x-auto pb-4 mt-8 no-scrollbar ${isScrolled ? 'max-h-0 opacity-0 pointer-events-none mt-0' : 'max-h-32 opacity-100 mt-12'}`}>
          {categories.map(cat => (
            <div key={cat.id} className="relative group flex flex-col items-center gap-3">
              <button onClick={() => onCategoryChange(cat.id)} className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all duration-500 ${activeCategory === cat.id ? 'border-green-500 scale-110' : 'border-zinc-800'}`}>
                <img src={cat.midia} className="w-full h-full object-cover" alt={cat.nome} />
              </button>
              <span className={`text-[9px] uppercase font-black tracking-[0.2em] ${activeCategory === cat.id ? 'text-green-500' : 'text-zinc-600'}`}>{cat.nome}</span>
              {activeCategory === cat.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 bg-black/90 backdrop-blur-3xl border border-zinc-800 rounded-[32px] p-4 min-w-[240px] shadow-2xl z-[100] animate-in fade-in slide-in-from-top-4">
                   <button onClick={() => onSubcategoryChange('All')} className={`flex items-center gap-4 w-full px-5 py-4 text-[10px] uppercase font-black rounded-2xl ${activeSubcategory === 'All' ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                     <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center text-green-500">★</div> Ver Todos
                   </button>
                   <div className="h-[1px] bg-zinc-900/50 my-3 mx-2"></div>
                   {subcategories.filter(s => s.categoriaId === cat.id).map(sub => (
                     <button key={sub.id} onClick={() => onSubcategoryChange(sub.id)} className={`flex items-center gap-4 w-full px-5 py-4 text-[10px] uppercase font-black rounded-2xl ${activeSubcategory === sub.id ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}>
                       {sub.midia && <img src={sub.midia} className="w-8 h-8 rounded-xl object-cover" alt="" />} {sub.nome}
                     </button>
                   ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
