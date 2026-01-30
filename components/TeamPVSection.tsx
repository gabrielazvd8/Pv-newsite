
import React, { useRef, useEffect } from 'react';
import { TeamPVItem } from '../types';

interface TeamPVSectionProps {
  items: TeamPVItem[];
}

const TeamPVSection: React.FC<TeamPVSectionProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Debug log para confirmar que a vitrine está recebendo os dados do localStorage
    console.log("VITRINE RE-HIDRATED: TEAM PV DATA:", items);
    
    if (!items || items.length === 0) return;
    
    let scrollStep = 1;
    const scrollInterval = 40; // ms
    
    const autoScroll = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += scrollStep;
        
        // Se chegou no fim, volta pro começo (loop infinito dinâmico)
        if (scrollRef.current.scrollLeft >= (scrollRef.current.scrollWidth - scrollRef.current.clientWidth)) {
           scrollRef.current.scrollLeft = 0;
        }
      }
    }, scrollInterval);
    
    return () => clearInterval(autoScroll);
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <section id="team-pv-section" className="bg-black py-24 border-t border-zinc-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-16 text-center">
          <span className="text-green-500 text-[11px] font-black uppercase tracking-[0.5em] mb-4 bg-green-500/10 px-4 py-1 rounded-full border border-green-500/20">
            Nossa Comunidade
          </span>
          <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
            TEAM <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-green-500">PV</span>
          </h2>
          <p className="text-zinc-500 max-w-md mt-6 text-sm uppercase tracking-widest font-medium opacity-60 italic">
            A elite que veste a armadura da PV Sports.
          </p>
          <div className="w-24 h-1.5 bg-green-500 mt-8 shadow-[0_0_20px_rgba(34,197,94,0.6)] rounded-full"></div>
        </div>

        <div className="relative group">
          <div 
            id="team-pv-carousel"
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-12 snap-x px-4"
          >
            {items.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0 w-64 md:w-80 snap-center group/card transition-all duration-500"
              >
                <div className="relative aspect-[9/16] rounded-[40px] overflow-hidden border border-zinc-800 bg-zinc-950 mb-6 shadow-2xl transition-all duration-500 group-hover/card:-translate-y-2 group-hover/card:border-green-500/50 group-hover/card:shadow-[0_20px_60px_-15px_rgba(34,197,94,0.3)]">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x700/18181b/fafafa?text=PV+Sports+Member';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover/card:opacity-90 transition-opacity" />
                  
                  <div className="absolute bottom-10 left-8 right-8 text-left">
                    <p className="text-white text-xl font-black italic uppercase tracking-tighter mb-2">
                      {item.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,1)]"></div>
                      <span className="text-green-500 text-[10px] font-black uppercase tracking-widest italic">
                        Verified Member ✔
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPVSection;
