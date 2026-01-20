
import React, { useState, useEffect } from 'react';

const SLIDES = [
  { 
    url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=1200', 
    title: 'LEGADO EUROPEU',
    subtitle: 'COLEÇÃO 24/25'
  },
  { 
    url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1200', 
    title: 'SELEÇÕES DE ELITE',
    subtitle: 'O MUNDO EM CAMPO'
  }
];

const Hero: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[75vh] md:h-[85vh] w-full overflow-hidden">
      {SLIDES.map((slide, i) => (
        <div 
          key={i}
          className={`absolute inset-0 transition-all duration-[1.5s] ease-in-out ${i === current ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}
        >
          {/* Enhanced Gradients for Luxury Look */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
          
          <img src={slide.url} className="w-full h-full object-cover" alt="" />
          
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4">
            <span className="text-green-500 text-xs md:text-sm font-black uppercase tracking-[0.8em] mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              {slide.subtitle}
            </span>
            <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-in fade-in zoom-in-95 duration-1000">
              {slide.title}
            </h2>
            <div className="mt-12 flex gap-3">
              {SLIDES.map((_, dot) => (
                <button 
                  key={dot} 
                  onClick={() => setCurrent(dot)}
                  className={`h-1.5 transition-all duration-500 rounded-full ${dot === current ? 'w-16 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'w-4 bg-white/20 hover:bg-white/40'}`} 
                />
              ))}
            </div>
          </div>
        </div>
      ))}
      
      {/* Down Arrow Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Hero;
