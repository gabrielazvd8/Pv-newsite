
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(4);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update items per view based on window size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else {
        setItemsPerView(4);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - itemsPerView);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isPaused) {
        nextSlide();
      }
    }, 2500);
  }, [nextSlide, isPaused]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const handleManualNav = (direction: 'next' | 'prev') => {
    if (direction === 'next') nextSlide();
    else prevSlide();
    startTimer(); // Reset timer on manual click
  };

  if (products.length === 0) return null;

  return (
    <div 
      className="relative group w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Navigation Arrows */}
      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-2 z-30 pointer-events-none">
        <button
          onClick={() => handleManualNav('prev')}
          className="p-2 rounded-full bg-black/50 border border-zinc-800 text-white backdrop-blur-md pointer-events-auto hover:bg-green-500 hover:text-black transition-all shadow-xl opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleManualNav('next')}
          className="p-2 rounded-full bg-black/50 border border-zinc-800 text-white backdrop-blur-md pointer-events-auto hover:bg-green-500 hover:text-black transition-all shadow-xl opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
          aria-label="Próximo"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Carousel Container */}
      <div className="overflow-hidden px-1">
        <motion.div
          className="flex gap-4 md:gap-6"
          animate={{
            x: `calc(-${currentIndex * (100 / itemsPerView)}% - ${currentIndex * (itemsPerView === 2 ? 16 : 24) / itemsPerView}px)`
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {products.map((product) => (
            <div 
              key={product.id} 
              className="flex-shrink-0"
              style={{ width: `calc((100% - ${(itemsPerView - 1) * (itemsPerView === 2 ? 16 : 24)}px) / ${itemsPerView})` }}
            >
              <ProductCard 
                product={product} 
                onClick={() => onProductClick(product)} 
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Mobile Swipe Indicator (Optional but helpful) */}
      <div className="flex justify-center gap-1.5 mt-6 md:hidden">
        {Array.from({ length: Math.ceil(products.length / itemsPerView) }).map((_, i) => (
          <div 
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              Math.floor(currentIndex / itemsPerView) === i ? 'w-8 bg-green-500' : 'w-2 bg-zinc-800'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
