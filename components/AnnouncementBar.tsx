
import React, { useState, useEffect, useRef } from 'react';
import { Announcement } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AnnouncementBarProps {
  announcements: Announcement[];
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ announcements }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (announcements.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 2500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCurrentIndex(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length]);

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

  const currentAnn = announcements[currentIndex] || announcements[0];

  return (
    <div className="w-full bg-white text-black py-2.5 px-4 overflow-hidden relative z-[60] border-b border-zinc-200 h-10 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentAnn.id || currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest absolute"
        >
          {currentAnn.icone && <span>{getIcon(currentAnn.icone)}</span>}
          <span>{currentAnn.nome}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnnouncementBar;
