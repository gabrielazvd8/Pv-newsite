
import React, { useRef } from 'react';
import { TeamPVItem } from '../types';

interface TeamPVSectionProps {
  items: TeamPVItem[];
}

const TeamPVSection: React.FC<TeamPVSectionProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-black py-24 border-t border-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20">
            Nossa Comunidade
          </span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white">
            TEAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-green-500">PV</span>
          </h2>
          <p className="text-zinc-500 max-w-md mt-6 text-sm uppercase tracking-widest font-medium opacity-60">
            Quem veste a armadura da PV Sports. Clientes que são elite.
          </p>
          <div className="w-24 h-1.5 bg-green-500 mt-8 shadow-[0_0_20px_rgba(34,197,94,0.6)] rounded-full"></div>
        </div>

        <div className="relative group">
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-12 snap-x px-4"
          >
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0 w-64 md:w-80 snap-center group/card transition-all duration-500"
              >
                <div className="relative aspect-[9/16] rounded-[32px] overflow-hidden border border-zinc-800 bg-zinc-950 mb-6 shadow-2xl transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:border-green-500/50 group-hover/card:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.2)]">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x700/18181b/fafafa?text=PV+Sports';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white text-lg font-black uppercase tracking-tighter mb-1">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        Cliente verificado ✔
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:flex absolute top-1/2 -translate-y-1/2 -left-4 -right-4 justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => scrollRef.current?.scrollBy({left: -320, behavior: 'smooth'})} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-green-500 hover:text-black transition-all shadow-xl">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollRef.current?.scrollBy({left: 320, behavior: 'smooth'})} className="p-3 bg-white/10 backdrop-blur-md rounded-full text-white pointer-events-auto hover:bg-green-500 hover:text-black transition-all shadow-xl">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPVSection;
