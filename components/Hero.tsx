
import React, { useState, useEffect, useMemo } from 'react';
import * as storage from '../services/storage';
import { CarouselImage } from '../types';

const Hero: React.FC = () => {
  const [slides, setSlides] = useState<CarouselImage[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    const data = await storage.getCarouselImages();
    if (data && data.length > 0) {
      setSlides(data);
    }
  };

  const activeSlides = useMemo(() => slides.filter(s => s.active), [slides]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % activeSlides.length), 7000);
    return () => clearInterval(timer);
  }, [activeSlides]);

  if (activeSlides.length === 0) {
    return (
      <div className="relative h-[70vh] w-full bg-zinc-950 flex items-center justify-center border-b border-zinc-900">
         <div className="text-center">
            <h2 className="text-2xl font-black uppercase tracking-widest text-zinc-800 animate-pulse">PV SPORTS CLOUD</h2>
         </div>
      </div>
    );
  }

  const getAlignClasses = (align: string) => {
    switch(align) {
      case 'left': return 'items-start text-left';
      case 'right': return 'items-end text-right';
      default: return 'items-center text-center';
    }
  };

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden bg-black">
      {activeSlides.map((slide, i) => (
        <div 
          key={slide.id}
          className={`absolute inset-0 transition-all duration-[2s] ease-in-out ${i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        >
          {/* Gradients de Profundidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-transparent to-black z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent z-10" />
          
          <img 
            src={slide.url} 
            className="w-full h-full object-cover transition-transform duration-[10s] ease-linear" 
            style={{ transform: i === current ? 'scale(1.1)' : 'scale(1)' }}
            alt={slide.title || "PV Sports Banner"} 
          />
          
          <div className={`absolute inset-0 flex flex-col justify-center container mx-auto px-6 md:px-20 z-20 pt-12 ${getAlignClasses(slide.align)}`}>
            {slide.subtitle && (
              <span className="text-green-500 text-xs md:text-sm font-black uppercase tracking-[0.8em] mb-6 bg-green-500/10 px-6 py-2 rounded-full border border-green-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                {slide.subtitle}
              </span>
            )}
            {slide.title && (
              <h2 className="text-5xl md:text-[8rem] font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-1000">
                {slide.title}
              </h2>
            )}
            
            <div className="mt-16 flex gap-3 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {activeSlides.map((_, dot) => (
                <button 
                  key={dot} 
                  onClick={() => setCurrent(dot)}
                  className={`h-1.5 transition-all duration-700 rounded-full ${dot === current ? 'w-20 bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : 'w-4 bg-white/20 hover:bg-white/40'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40 z-20 hidden md:block">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
