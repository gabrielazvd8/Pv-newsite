
import React from 'react';
import { Logo } from '../types';
import SearchBar from './SearchBar';

interface HeaderProps {
  isScrolled: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAdminClick: () => void;
  activeLogo?: Logo;
  onResetFilter: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, searchQuery, onSearchChange, onAdminClick,
  activeLogo, onResetFilter
}) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isScrolled ? 'bg-black/95 backdrop-blur-3xl py-4 border-b border-zinc-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-transparent py-10'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center transition-all duration-1000 ${isScrolled ? 'justify-between gap-2 md:gap-4' : 'justify-center'}`}>
          
          {/* Logo Central/Lateral */}
          <div 
            className={`transition-all duration-1000 cursor-pointer z-20 flex items-center justify-center shrink-0 ${isScrolled ? 'w-24 md:w-32 transform-none' : 'w-56 md:w-80 transform translate-y-0 md:-translate-y-2'}`} 
            onClick={onResetFilter}
          >
             {activeLogo?.midia_url ? (
               <img 
                 src={activeLogo.midia_url} 
                 alt="PV Sports" 
                 className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all" 
                 style={{ height: isScrolled ? '40px' : '75px', width: 'auto', maxWidth: '100%' }}
               />
             ) : (
               <h1 className="text-2xl font-black italic tracking-tighter text-green-500">PV<span className="text-white">SPORTS</span></h1>
             )}
          </div>

          {/* Search Bar */}
          <div className={`transition-all duration-1000 pointer-events-none px-0 md:px-4 ${isScrolled ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto relative flex-1 md:absolute md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-xl' : 'absolute left-1/2 -translate-x-1/2 w-full max-w-xl opacity-0 -translate-y-12 scale-90'}`}>
            <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
          </div>

          {/* Área Administrativa */}
          <div className={`flex items-center shrink-0 transition-all duration-1000 ${isScrolled ? 'opacity-100 translate-x-0 relative' : 'opacity-0 translate-x-12 pointer-events-none absolute right-4 md:relative md:right-auto'}`}>
            <button 
              onClick={onAdminClick} 
              className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-[24px] text-zinc-400 hover:text-green-500 transition-all shadow-xl active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
