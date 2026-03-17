
import React from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  neonEffect?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, neonEffect = true }) => {
  return (
    <div className="relative w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative group"
      >
        {/* Animated Glow Background - Alternating between blue and purple for a modern look */}
        <motion.div
          animate={{
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.4)", // Blue
              "0 0 40px rgba(168, 85, 247, 0.6)", // Purple
              "0 0 20px rgba(59, 130, 246, 0.4)"  // Blue
            ],
            scale: [1, 1.01, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-2xl opacity-40 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
        />

        <div className="relative z-10 flex items-center bg-zinc-950/90 backdrop-blur-2xl border border-zinc-800/80 rounded-2xl overflow-hidden group-focus-within:border-blue-500/50 transition-all duration-500 shadow-2xl">
          <div className="pl-6 text-zinc-500 group-focus-within:text-blue-500 transition-colors">
            <Search size={22} strokeWidth={2.5} />
          </div>
          
          <input
            type="text"
            placeholder="Buscar produtos, categorias ou marcas..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent border-none px-4 py-6 text-lg text-white placeholder:text-zinc-600 focus:outline-none font-medium"
          />

          {value && (
            <button
              onClick={() => onChange('')}
              className="pr-6 text-zinc-600 hover:text-white transition-colors p-2"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SearchBar;
