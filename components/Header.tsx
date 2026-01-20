
import React from 'react';
import { Category, Subcategory } from '../types';
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
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, searchQuery, onSearchChange, categories, subcategories, 
  activeCategory, onCategoryChange, activeSubcategory, onSubcategoryChange, onAdminClick 
}) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-700 ${isScrolled ? 'bg-black/95 backdrop-blur-xl py-4 border-b border-zinc-900 shadow-2xl' : 'bg-transparent py-10'}`}>
      <div className="container mx-auto px-4">
        {/* Main Layout Area */}
        <div className={`relative flex items-center transition-all duration-700 ${isScrolled ? 'justify-between' : 'justify-center'}`}>
          
          {/* Logo - Centered (initial) or Side (scrolled) */}
          <div 
            className={`transition-all duration-700 cursor-pointer z-20 ${isScrolled ? 'w-24 md:w-32 transform-none' : 'w-48 md:w-64 transform -translate-y-2'}`} 
            onClick={() => onCategoryChange('All')}
          >
             <img src="/img/IMG_3069.PNG" alt="PV Sports" className="w-full h-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all" />
          </div>

          {/* Search Bar - Appears in center when scrolled */}
          <div className={`absolute left-1/2 -translate-x-1/2 w-full max-w-lg transition-all duration-700 pointer-events-none px-4 ${isScrolled ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-8 scale-90'}`}>
            <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
          </div>

          {/* Right Section Actions - only visible when scrolled to avoid cluttering initial centered logo */}
          <div className={`flex items-center gap-4 transition-all duration-700 ${isScrolled ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <button 
              onClick={onAdminClick} 
              className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-green-500 hover:text-black hover:border-green-400 transition-all group active:scale-90"
              title="Administração"
            >
              <svg className="w-5 h-5 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Categories Menu */}
        <nav className={`transition-all duration-700 flex items-center justify-center gap-3 overflow-x-auto pb-1 mt-8 scrollbar-hide no-scrollbar ${isScrolled ? 'max-h-0 opacity-0 pointer-events-none mt-0' : 'max-h-20 opacity-100 mt-10'}`}>
          <button 
            onClick={() => onCategoryChange('All')}
            className={`px-6 py-2 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] transition-all border ${activeCategory === 'All' ? 'bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
          >
            Tudo
          </button>
          {categories.map(cat => (
            <div key={cat.id} className="relative group">
              <button 
                onClick={() => onCategoryChange(cat.id)}
                className={`px-6 py-2 rounded-2xl text-[10px] uppercase font-black tracking-[0.2em] transition-all border ${activeCategory === cat.id ? 'bg-white text-black border-zinc-200' : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:text-zinc-300'}`}
              >
                {cat.name}
              </button>
              
              {/* Dropdown for Subcategories */}
              {activeCategory === cat.id && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-zinc-950 border border-zinc-800 rounded-3xl p-3 min-w-[200px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] z-50 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2">
                   <button 
                    onClick={() => onSubcategoryChange('All')}
                    className={`block w-full text-center px-4 py-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-colors ${activeSubcategory === 'All' ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                   >
                     Todos
                   </button>
                   <div className="h-[1px] bg-zinc-900 my-2"></div>
                   {subcategories.filter(s => s.categoryId === cat.id).map(sub => (
                     <button 
                      key={sub.id}
                      onClick={() => onSubcategoryChange(sub.id)}
                      className={`block w-full text-center px-4 py-3 text-[10px] uppercase font-black tracking-widest rounded-xl transition-colors ${activeSubcategory === sub.id ? 'bg-green-500/10 text-green-500' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'}`}
                     >
                       {sub.name}
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
