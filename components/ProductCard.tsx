
import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <div 
      className="group cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-zinc-900 rounded-3xl mb-6 shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] group-hover:-translate-y-2">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0"
          loading="lazy"
        />
        
        {/* Pronta Entrega Badge */}
        {product.isProntaEntrega && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-green-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-green-500/20">
              Pronta Entrega
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <button className="w-full bg-white text-zinc-950 py-4 text-[10px] uppercase tracking-[0.2em] font-black shadow-2xl hover:bg-green-500 transition-colors">
             Ver Detalhes
           </button>
        </div>
      </div>
      
      <div className="px-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
              {product.categoryId === 'cat1' ? 'Internacional' : 'Nacional'}
            </span>
            <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors uppercase tracking-tight">
              {product.name}
            </h3>
          </div>
          {product.price && (
            <p className="text-sm font-light text-zinc-500">
              R$ {product.price}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
