
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
        {/* Estrutura flexível: justify-center no topo, justify-start no scroll */}
        <div className={`relative flex items-center transition-all duration-1000 ${isScrolled ? 'justify-start gap-4 md:gap-8' : 'justify-center'}`}>
          
          {/* Logo: Centralizada no topo, lateral no scroll */}
          <div 
            className="transition-all duration-1000 cursor-pointer z-20 flex items-center justify-center shrink-0" 
            onClick={onResetFilter}
          >
             {activeLogo?.midia_url ? (
                <img 
                  src={activeLogo.midia_url} 
                  alt="PV Sports" 
                  className="object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all duration-1000" 
                  style={{ height: isScrolled ? '40px' : '80px', width: 'auto' }}
                />
             ) : (
                <h1 className="text-2xl font-black italic tracking-tighter text-green-500">PV<span className="text-white">SPORTS</span></h1>
             )}
          </div>

          {/* Barra de Pesquisa: Aparece apenas no scroll, ao lado da logo */}
          <div className={`transition-all duration-1000 flex-1 max-w-2xl ${isScrolled ? 'opacity-100 translate-x-0 scale-100 pointer-events-auto relative' : 'opacity-0 translate-x-12 scale-95 pointer-events-none absolute'}`}>
            <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
