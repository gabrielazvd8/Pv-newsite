
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  neonEffect?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, neonEffect = false }) => {
  return (
    <div className="relative group w-full">
      {/* Neon Glow Halo */}
      {neonEffect && (
        <div className="absolute inset-0 bg-green-500/20 blur-[40px] rounded-full opacity-40 group-focus-within:opacity-80 transition-opacity duration-700 pointer-events-none"></div>
      )}
      
      <div className="relative z-10 flex items-center">
        <input
          type="text"
          placeholder="Busque por time, seleção ou jogador..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-zinc-950 border border-zinc-800 rounded-full px-10 py-5 text-sm font-medium focus:outline-none transition-all duration-500 placeholder:text-zinc-700 ${neonEffect ? 'focus:border-green-500/50 shadow-2xl' : 'bg-zinc-900/40 border-zinc-800/50 focus:border-green-500/50'}`}
        />
        
        {/* Search Icon */}
        <div className="absolute left-4 text-zinc-600 group-focus-within:text-green-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Clear Icon */}
        {value && (
          <button 
            onClick={() => onChange('')}
            className="absolute right-4 text-zinc-700 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Subtle bottom line for premium feel */}
      <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[1px] bg-gradient-to-r from-transparent via-green-500/40 to-transparent transition-all duration-700 ${neonEffect ? 'w-3/4 opacity-100 group-focus-within:w-full' : 'w-0 opacity-0'}`}></div>
    </div>
  );
};

export default SearchBar;
