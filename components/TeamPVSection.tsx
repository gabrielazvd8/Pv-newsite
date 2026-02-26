
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamPVItem } from '../types';

interface TeamPVSectionProps {
  items: TeamPVItem[];
}

const TeamPVSection: React.FC<TeamPVSectionProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!isPaused) {
      timerRef.current = setInterval(nextSlide, 2500);
    }
  }, [nextSlide, isPaused]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleManualNav = (direction: 'next' | 'prev' | number) => {
    if (direction === 'next') nextSlide();
    else if (direction === 'prev') prevSlide();
    else setCurrentIndex(direction);
    resetTimer();
  };

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

        <div 
          className="relative group max-w-5xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows - Mobile Visible, Desktop Hover Visible */}
          <button 
            onClick={() => handleManualNav('prev')}
            className="absolute left-[-20px] md:left-[-60px] top-1/2 -translate-y-1/2 z-10 p-2 text-white/30 hover:text-green-500 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft size={40} strokeWidth={1} />
          </button>
          
          <button 
            onClick={() => handleManualNav('next')}
            className="absolute right-[-20px] md:right-[-60px] top-1/2 -translate-y-1/2 z-10 p-2 text-white/30 hover:text-green-500 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight size={40} strokeWidth={1} />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden rounded-[40px]">
            <motion.div 
              className="flex"
              animate={{ x: `-${currentIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex-shrink-0 w-full px-4"
                >
                  <div className="relative aspect-[9/16] md:aspect-[16/9] rounded-[40px] overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl group/card">
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover/card:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/18181b/fafafa?text=PV+Sports+Member';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
                    
                    <div className="absolute bottom-10 left-8 right-8 text-left">
                      <p className="text-white text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,1)]"></div>
                        <span className="text-green-500 text-xs font-black uppercase tracking-widest italic">
                          Verified Member ✔
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots Indicators */}
          <div className="flex justify-center gap-3 mt-12">
            {items.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleManualNav(idx)}
                className={`h-1.5 transition-all duration-500 rounded-full ${
                  currentIndex === idx 
                    ? 'w-12 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                    : 'w-3 bg-zinc-800 hover:bg-zinc-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPVSection;
