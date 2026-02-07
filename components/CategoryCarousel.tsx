
import React, { useRef, useMemo } from 'react';
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

  const currentSubcategories = useMemo(() => {
    if (activeCategory === 'All') return [];
    return subcategories.filter(s => s.categoriaId === activeCategory);
  }, [subcategories, activeCategory]);

  return (
    <section className="py-24 bg-black overflow-hidden border-t border-zinc-950">
      <div className="container mx-auto px-4">
        {/* Categorias Principais (Retangulares) */}
        <div className="mb-16">
          <div className="flex flex-col mb-12">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter border-l-[12px] border-white pl-8 mb-2">
              CATEGORIAS
            </h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-zinc-700 font-black ml-10">
              Selecione uma liga ou continente
            </p>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4 px-2"
          >
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={`flex-shrink-0 w-48 md:w-64 cursor-pointer transition-all duration-700 ${activeCategory === cat.id ? 'scale-105' : 'opacity-40 hover:opacity-80'}`}
              >
                <div className={`relative aspect-video rounded-3xl overflow-hidden border-2 mb-4 transition-all duration-700 ${activeCategory === cat.id ? 'border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.3)]' : 'border-zinc-900'}`}>
                  {cat.midia ? (
                    <img src={cat.midia} alt={cat.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 text-[10px] font-black">PV SPORTS</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <p className="absolute bottom-5 left-0 right-0 text-center text-[11px] font-black uppercase tracking-[0.3em] text-white drop-shadow-xl italic">
                    {cat.nome}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subcategorias (Circulares - Exibidas apenas se categoria estiver ativa) */}
        {activeCategory !== 'All' && currentSubcategories.length > 0 && (
          <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col mb-12 items-center text-center">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-green-500 mb-2">
                {categories.find(c => c.id === activeCategory)?.nome} <span className="text-white">Explorar</span>
              </h3>
              <div className="w-16 h-1 bg-green-500 rounded-full mb-8"></div>
            </div>

            <div 
              ref={subScrollRef}
              className="flex gap-10 overflow-x-auto no-scrollbar scroll-smooth justify-center px-4"
            >
              {currentSubcategories.map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => onSubcategoryChange(sub.id)}
                  className={`flex-shrink-0 w-24 md:w-32 cursor-pointer flex flex-col items-center gap-4 transition-all duration-500 ${activeSubcategory === sub.id ? 'scale-110' : 'opacity-50 hover:opacity-100'}`}
                >
                  <div className={`relative aspect-square w-full rounded-full overflow-hidden border-[3px] transition-all duration-500 ${activeSubcategory === sub.id ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]' : 'border-zinc-900'}`}>
                    <img src={sub.midia} alt={sub.nome} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </div>
                  <p className={`text-[9px] font-black uppercase tracking-widest text-center leading-tight ${activeSubcategory === sub.id ? 'text-green-500' : 'text-zinc-500'}`}>
                    {sub.nome}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryCarousel;
