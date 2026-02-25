
import React from 'react';
import { Announcement } from '../types';

interface AnnouncementBarProps {
  announcements: Announcement[];
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'caminhão': return '🚚';
      case 'cupom': return '🎫';
      case 'fogo': return '🔥';
      case 'relógio': return '🕒';
      case 'estrela': return '⭐';
      case 'caixa': return '📦';
      default: return null;
    }
  };

  return (
    <div className="w-full bg-white text-black py-2.5 px-4 overflow-hidden relative z-[60] border-b border-zinc-200">
      <div className="flex items-center justify-center gap-8 whitespace-nowrap animate-marquee">
        {announcements.map((ann, idx) => (
          <div key={ann.id || idx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            {ann.icone && <span>{getIcon(ann.icone)}</span>}
            <span>{ann.nome}</span>
          </div>
        ))}
        {/* Duplicate for seamless loop if needed, but for now simple list is fine if centered */}
        {announcements.length > 1 && announcements.map((ann, idx) => (
          <div key={`dup-${ann.id || idx}`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            {ann.icone && <span>{getIcon(ann.icone)}</span>}
            <span>{ann.nome}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: fit-content;
          animation: marquee 30s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: 20s;
          }
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBar;
