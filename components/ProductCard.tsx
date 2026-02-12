import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  // Respect inactive status by not rendering the card
  if (product.ativo === false) return null;

  const secondImage = product.images && product.images.length > 1 ? product.images[1] : null;

  return (
    <div 
      className={`group cursor-pointer flex flex-col h-full rounded-3xl p-3 transition-all duration-500 ${product.isPromo ? 'bg-red-500/5 border border-red-500/20 shadow-[0_10px_40px_-15px_rgba(239,68,68,0.1)]' : 'hover:bg-zinc-900/40 border border-transparent hover:border-zinc-800'}`}
      onClick={onClick}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-zinc-900 rounded-3xl mb-6 shadow-2xl transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] group-hover:-translate-y-2">
        {/* Main Image */}
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover grayscale-[0.2] transition-all duration-1000 group-hover:scale-110 group-hover:grayscale-0 ${secondImage ? 'group-hover:opacity-0' : ''}`}
          loading="lazy"
        />
        
        {/* Hover Image (Swap) */}
        {secondImage && (
          <img 
            src={secondImage} 
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700"
            loading="lazy"
          />
        )}
        
        {/* Badges Container */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isPromo && (
            <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-red-600/30 border border-red-400/30 animate-pulse">
              Promoção
            </div>
          )}
          {product.isLancamento && (
            <div className="bg-white text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-white/10 border border-zinc-200">
              New
            </div>
          )}
          {product.isProntaEntrega && (
            <div className="bg-green-500 text-black text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter shadow-lg shadow-green-500/20">
              Pronta Entrega
            </div>
          )}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
           <button className={`w-full py-4 text-[10px] uppercase tracking-[0.2em] font-black shadow-2xl transition-colors ${product.isPromo ? 'bg-red-500 text-white hover:bg-red-400' : 'bg-white text-zinc-950 hover:bg-green-500'}`}>
             Ver Detalhes
           </button>
        </div>
      </div>
      
      <div className="px-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">
              {product.categoryName || 'Produto'}
            </span>
            <h3 className="text-sm font-bold text-zinc-200 group-hover:text-white transition-colors uppercase tracking-tight">
              {product.name}
            </h3>
          </div>
          <div className="text-right">
            {product.oldPrice && (
              <p className="text-[10px] line-through text-zinc-600 mb-0.5">
                R$ {product.oldPrice}
              </p>
            )}
            {product.price && (
              <p className={`text-sm font-bold ${product.isPromo ? 'text-red-500' : 'text-zinc-500'}`}>
                R$ {product.price}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;