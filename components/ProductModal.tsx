
import React, { useEffect, useState } from 'react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const [activeMediaIdx, setActiveMediaIdx] = useState(0);

  const productMedias = product ? [
    ...(product.images || []).map(url => ({ url, type: 'image' })),
    ...(product.video ? [{ url: product.video, type: 'video' }] : [])
  ] : [];

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    if (product) {
      document.body.style.overflow = 'hidden';
      const featuredIdx = productMedias.findIndex(m => m.url === product.featuredMediaUrl);
      setActiveMediaIdx(featuredIdx !== -1 ? featuredIdx : 0);
    }
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [product, onClose]);

  if (!product) return null;

  const currentMedia = productMedias[activeMediaIdx];

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
        <div className="w-full md:w-3/5 h-[300px] md:h-[450px] flex items-center justify-center overflow-hidden relative group bg-black">
          {currentMedia.type === 'video' ? (
            <video 
              src={currentMedia.url} 
              className="max-w-full max-h-full object-contain"
              controls
              autoPlay
              muted
              loop
            />
          ) : (
            <img 
              src={currentMedia.url} 
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-all duration-700"
            />
          )}
          
          {/* Navegação da Galeria */}
          {productMedias.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {productMedias.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveMediaIdx(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === activeMediaIdx ? 'bg-green-500 w-8 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-white/30 hover:bg-white/60'}`}
                />
              ))}
            </div>
          )}

          {/* Botões Próximo/Anterior */}
          {productMedias.length > 1 && (
            <>
              <button 
                onClick={() => setActiveMediaIdx(prev => (prev === 0 ? productMedias.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-green-500 hover:text-black rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button 
                onClick={() => setActiveMediaIdx(prev => (prev === productMedias.length - 1 ? 0 : prev + 1))}
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
              {product.productCode || `#${product.id.slice(-4)}`}
            </span>
            <h2 className="text-4xl font-black text-white leading-none mb-6 italic uppercase tracking-tighter">
              {product.name}
            </h2>
            <div className="mb-8">
              {product.isPromo && product.oldPrice ? (
                <div className="flex items-center gap-4">
                  <p className="text-xl line-through text-zinc-600 font-light">
                    R$ {product.oldPrice}
                  </p>
                  <p className="text-3xl font-black text-red-500">
                    R$ {product.price}
                  </p>
                </div>
              ) : product.price ? (
                <p className="text-3xl font-black text-zinc-100">
                  R$ {product.price}
                </p>
              ) : null}
            </div>
            
            <div className={`w-12 h-1 mb-8 ${product.isPromo ? 'bg-red-500' : 'bg-green-500'}`} />

            <div className="text-zinc-500 text-sm leading-relaxed font-light mb-12 space-y-4">
              <p dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>

            {product.isProntaEntrega && product.sizes && (
              <div className="mb-8 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] uppercase font-black text-zinc-500 mb-4 tracking-widest">Tamanhos Disponíveis</p>
                <div className="space-y-3">
                  {product.sizes.kids && product.sizes.kids.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase min-w-[60px]">👶 Criança:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.kids.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded border border-zinc-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes.adult && product.sizes.adult.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase min-w-[60px]">🧑 Adulto:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.adult.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded border border-zinc-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.sizes.babylook && product.sizes.babylook.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase min-w-[60px]">👕 Babylook:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.sizes.babylook.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[10px] font-bold rounded border border-zinc-700">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Thumbnail Grid */}
            {productMedias.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mb-12">
                {productMedias.map((media, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveMediaIdx(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative bg-black flex items-center justify-center ${idx === activeMediaIdx ? 'border-green-500 scale-105' : 'border-zinc-800 opacity-60 hover:opacity-100'}`}
                  >
                    {media.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center relative">
                        <video src={media.url} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15.5l6-3.5-6-3.5v7zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8-8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                        </div>
                      </div>
                    ) : (
                      <img src={media.url} className="w-full h-full object-contain" alt="" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <a 
              href={`https://wa.me/5584998538567?text=${encodeURIComponent(`Olá PV, Gostaria de saber mais da camisa ${product.name}${product.productCode ? `, COD ${product.productCode}` : ''}`)}`}
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
