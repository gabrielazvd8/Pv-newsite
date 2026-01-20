
import React, { useRef } from 'react';
import { Category, Subcategory } from '../types';

interface CategoryCarouselProps {
  categories: Category[];
  subcategories: Subcategory[];
  activeCategory: string;
  onCategoryChange: (id: string) => void;
  activeSubcategory: string;
  onSubcategoryChange: (id: string) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  subcategories,
  activeCategory,
  onCategoryChange,
  activeSubcategory,
  onSubcategoryChange
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const subScrollRef = useRef<HTMLDivElement>(null);

  const activeSubs = subcategories.filter(s => s.categoryId === activeCategory);

  return (
    <section className="py-20 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-black uppercase tracking-tighter border-l-8 border-white pl-6 mb-2">
            CATEGORIAS
          </h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 font-bold ml-8">
            Navegue por Ligas e Clubes
          </p>
        </div>

        {/* Categorias Principais */}
        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-8"
          >
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex-shrink-0 w-32 md:w-40 cursor-pointer group/item transition-all duration-500 ${activeCategory === cat.id ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className={`relative aspect-square rounded-full overflow-hidden border-2 mb-4 transition-all duration-500 ${activeCategory === cat.id ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]' : 'border-zinc-800'}`}>
                  <img 
                    src={cat.image || 'https://placehold.co/400x400/18181b/fafafa?text=PV'} 
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                  />
                  <div className={`absolute inset-0 bg-black/20 transition-opacity ${activeCategory === cat.id ? 'opacity-0' : 'opacity-40 group-hover/item:opacity-0'}`} />
                </div>
                <p className={`text-center text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-colors ${activeCategory === cat.id ? 'text-green-500' : 'text-zinc-500'}`}>
                  {cat.name}
                </p>
              </div>
            ))}
          </div>
          
          {/* Scroll Indicators (Desktop Only) */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-4 -right-4 justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => scrollRef.current?.scrollBy({left: -300, behavior: 'smooth'})} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-white/20 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollRef.current?.scrollBy({left: 300, behavior: 'smooth'})} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-white/20 transition-all">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Subcategorias (Times/Ligas Específicas) */}
        {activeCategory !== 'All' && activeSubs.length > 0 && (
          <div className="mt-16 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-4 mb-8">
               <div className="h-[1px] flex-grow bg-zinc-900"></div>
               <span className="text-[9px] uppercase tracking-[0.5em] text-zinc-700 font-black">Times & Coleções</span>
               <div className="h-[1px] flex-grow bg-zinc-900"></div>
            </div>

            <div 
              ref={subScrollRef}
              className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth justify-center px-4"
            >
              <button 
                onClick={() => onSubcategoryChange('All')}
                className={`flex-shrink-0 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeSubcategory === 'All' ? 'bg-zinc-100 text-black border-zinc-100' : 'bg-transparent text-zinc-500 border-zinc-900 hover:text-white hover:border-zinc-700'}`}
              >
                Ver Todos
              </button>
              
              {activeSubs.map(sub => (
                <button 
                  key={sub.id}
                  onClick={() => onSubcategoryChange(sub.id)}
                  className={`flex-shrink-0 flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${activeSubcategory === sub.id ? 'bg-green-500 text-black border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-transparent text-zinc-500 border-zinc-900 hover:text-white hover:border-zinc-700'}`}
                >
                  {sub.image && <img src={sub.image} className="w-6 h-6 rounded-md object-cover" alt="" />}
                  {sub.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryCarousel;
