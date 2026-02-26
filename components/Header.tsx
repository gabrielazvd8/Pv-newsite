
import React from 'react';
import { Logo } from '../types';
import SearchBar from './SearchBar';

interface HeaderProps {
  isScrolled: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeLogo?: Logo;
  onResetFilter: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, searchQuery, onSearchChange,
  activeLogo, onResetFilter
}) => {
  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-1000 ${isScrolled ? 'bg-black/95 backdrop-blur-3xl py-4 border-b border-zinc-900/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'bg-transparent py-10'}`}>
      <div className="container mx-auto px-4">
        <div className={`relative flex items-center transition-all duration-1000 ${isScrolled ? 'justify-between gap-4' : 'justify-center'}`}>
          
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

          {/* Search Bar - Only visible on scroll */}
          <div className={`transition-all duration-1000 flex-1 max-w-2xl px-4 ${isScrolled ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-12 scale-90 pointer-events-none absolute'}`}>
            <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
          </div>

          {/* Placeholder to maintain centering when scrolled if needed, but justify-between with flex-1 search bar works well */}
          {isScrolled && <div className="w-24 md:w-32 hidden md:block"></div>}
        </div>
      </div>
    </header>
  );
};

export default Header;
