
import React, { useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      setActiveImageIdx(0);
    }
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  if (!product) return null;

  const productImages = product.images || [product.image];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-zinc-900 w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col md:flex-row">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-30 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-full transition-all hover:rotate-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Galeria Lado Esquerdo */}
        <div className="w-full md:w-3/5 h-[45vh] md:h-auto overflow-hidden relative group bg-black">
          <img 
            src={productImages[activeImageIdx]} 
            alt={product.name}
            className="w-full h-full object-contain transition-all duration-700"
          />
          
          {/* Navegação da Galeria */}
          {productImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {productImages.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeImageIdx ? 'bg-green-500 w-8 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}

          {/* Botões Próximo/Anterior */}
          {productImages.length > 1 && (
            <>
              <button 
                onClick={() => setActiveImageIdx(prev => (prev === 0 ? productImages.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-green-500 hover:text-black rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => setActiveImageIdx(prev => (prev === productImages.length - 1 ? 0 : prev + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-green-500 hover:text-black rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>

        {/* Detalhes Lado Direito */}
        <div className="w-full md:w-2/5 p-8 md:p-14 overflow-y-auto flex flex-col bg-zinc-900 border-l border-zinc-800">
          <div className="mb-auto">
            <span className="inline-block px-3 py-1 bg-zinc-800 text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6 rounded">
              #{product.id.slice(-4)}
            </span>
            <h2 className="text-4xl font-black text-white leading-none mb-6 italic uppercase tracking-tighter">
              {product.name}
            </h2>
            <div className="flex items-center gap-4 mb-8">
              {product.oldPrice && (
                <p className="text-xl line-through text-zinc-600 font-light">
                  R$ {product.oldPrice}
                </p>
              )}
              <p className={`text-3xl font-black ${product.isPromo ? 'text-red-500' : 'text-zinc-100'}`}>
                R$ {product.price}
              </p>
            </div>
            
            <div className={`w-12 h-1 mb-8 ${product.isPromo ? 'bg-red-500' : 'bg-green-500'}`} />

            <div className="text-zinc-500 text-sm leading-relaxed font-light mb-12 space-y-4">
              <p dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {/* Thumbnail Grid */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mb-12">
                {productImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${idx === activeImageIdx ? 'border-green-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <a 
              href={`https://wa.me/5584998081630?text=Olá! Gostaria de mais informações sobre: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-3 w-full py-5 text-xs uppercase tracking-[0.2em] font-black transition-all active:scale-[0.98] shadow-xl ${product.isPromo ? 'bg-red-600 text-white hover:bg-red-500' : 'bg-white text-zinc-950 hover:bg-green-500'}`}
            >
              <span>Consultar Disponibilidade</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.107l-.694 2.537 2.59-.68c.767.415 1.748.796 2.847.796 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.76-5.768-5.76zm3.377 8.272c-.14.393-.7.712-1.147.76-.32.033-.733.053-1.18-.093-.277-.093-.637-.215-1.077-.41-1.85-.807-3.047-2.7-3.14-2.827-.093-.126-.76-.993-.76-1.893 0-.9.467-1.34.633-1.527.167-.187.367-.233.49-.233h.353c.113 0 .26.013.407.34.167.387.573 1.4.627 1.507.053.113.087.24.013.387-.073.14-.113.22-.227.353-.113.133-.24.3-.34.407-.113.12-.233.253-.1.48.133.227.593.973 1.273 1.58.873.78 1.607 1.02 1.833 1.133.227.113.36.093.493-.06.133-.153.573-.667.727-.893.153-.227.307-.187.52-.107.213.08 1.353.64 1.587.753.233.113.387.167.447.267.06.1.06.58-.14.973z"/>
              </svg>
            </a>
            <p className="text-center text-[9px] text-zinc-700 uppercase tracking-widest font-black">
              PV Sports Heritage &mdash; Qualidade de Elite
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
