
import React, { useEffect } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (product) document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  if (!product) return null;

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
          className="absolute top-6 right-6 z-20 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 rounded-full transition-all hover:rotate-90"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="w-full md:w-3/5 h-[45vh] md:h-auto overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-2/5 p-8 md:p-14 overflow-y-auto flex flex-col">
          <div className="mb-auto">
            {/* Corrected: product.category does not exist in the Product type. Using categoryId instead. */}
            <span className="inline-block px-3 py-1 bg-zinc-800 text-[9px] uppercase tracking-[0.3em] text-zinc-400 font-bold mb-6 rounded">
              {product.categoryId}
            </span>
            <h2 className="text-4xl font-black text-white leading-none mb-6">
              {product.name}
            </h2>
            <p className="text-3xl font-light text-zinc-400 mb-8">
              R$ {product.price}
            </p>
            
            <div className="w-12 h-1 bg-white mb-8" />

            <div className="text-zinc-500 text-sm leading-relaxed font-light mb-12 space-y-4">
              <p dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          </div>

          <div className="space-y-4">
            <a 
              href={`https://wa.me/?text=Olá! Gostaria de mais informações sobre: ${product.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 w-full py-5 bg-white text-zinc-950 text-xs uppercase tracking-[0.2em] font-black hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-xl"
            >
              <span>Consultar Consultor</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.107l-.694 2.537 2.59-.68c.767.415 1.748.796 2.847.796 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.76-5.768-5.76zm3.377 8.272c-.14.393-.7.712-1.147.76-.32.033-.733.053-1.18-.093-.277-.093-.637-.215-1.077-.41-1.85-.807-3.047-2.7-3.14-2.827-.093-.126-.76-.993-.76-1.893 0-.9.467-1.34.633-1.527.167-.187.367-.233.49-.233h.353c.113 0 .26.013.407.34.167.387.573 1.4.627 1.507.053.113.087.24.013.387-.073.14-.113.22-.227.353-.113.133-.24.3-.34.407-.113.12-.233.253-.1.48.133.227.593.973 1.273 1.58.873.78 1.607 1.02 1.833 1.133.227.113.36.093.493-.06.133-.153.573-.667.727-.893.153-.227.307-.187.52-.107.213.08 1.353.64 1.587.753.233.113.387.167.447.267.06.1.06.58-.14.973z"/>
              </svg>
            </a>
            <p className="text-center text-[9px] text-zinc-700 uppercase tracking-widest">
              Atendimento exclusivo 24h
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
