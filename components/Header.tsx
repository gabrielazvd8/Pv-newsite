
import React from 'react';
import { Logo, Announcement } from '../types';
import SearchBar from './SearchBar';
import AnnouncementBar from './AnnouncementBar';

interface HeaderProps {
  isScrolled: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeLogo?: Logo;
  onResetFilter: () => void;
  showAnnouncement?: boolean;
  announcements?: Announcement[];
}

const Header: React.FC<HeaderProps> = ({ 
  isScrolled, searchQuery, onSearchChange,
  activeLogo, onResetFilter, showAnnouncement,
  announcements = []
}) => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 pointer-events-none">
      {/* Announcement Bar - Always at the very top */}
      {showAnnouncement && announcements.length > 0 && (
        <div className="pointer-events-auto">
          <AnnouncementBar announcements={announcements} />
        </div>
      )}

      {/* Scrolled Header Content */}
      <header 
        className={`w-full transition-all duration-500 ease-in-out pointer-events-auto ${
          isScrolled 
            ? `translate-y-0 opacity-100 shadow-[0_10px_30px_rgba(0,0,0,0.5)] bg-black/80 backdrop-blur-xl border-b border-zinc-800/50 py-4` 
            : `-translate-y-full opacity-0 pointer-events-none`
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            {/* Logo Container */}
            <div 
              className="cursor-pointer flex items-center shrink-0" 
              onClick={onResetFilter}
            >
               {activeLogo?.midia_url ? (
                  <img 
                    src={activeLogo.midia_url} 
                    alt="PV Sports" 
                    className="h-10 md:h-12 w-auto object-contain" 
                  />
               ) : (
                  <h1 className="font-black italic tracking-tighter text-green-500 text-xl md:text-2xl">
                    PV<span className="text-white">SPORTS</span>
                  </h1>
               )}
            </div>

            {/* Search Bar Container */}
            <div className="w-full max-w-3xl">
              <SearchBar value={searchQuery} onChange={onSearchChange} neonEffect={false} />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
