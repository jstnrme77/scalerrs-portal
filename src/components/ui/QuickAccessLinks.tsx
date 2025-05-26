'use client';

import React, { useState } from 'react';
import { MessageSquare, FolderOpen, BarChart3, Plus, X } from 'lucide-react';

type QuickLink = {
  id: string;
  icon: React.ReactNode;
  label: string;
  url: string;
};

type QuickAccessLinksProps = {
  links: QuickLink[];
};

export default function QuickAccessLinks({ links }: QuickAccessLinksProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Main toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-[#9EA8FB] text-white shadow-lg flex items-center justify-center transition-transform duration-300 hover:bg-[#7D8AF2]"
        aria-label={isOpen ? "Close quick access menu" : "Open quick access menu"}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </button>

      {/* Quick access links */}
      <div className={`absolute bottom-16 right-0 transition-all duration-300 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex flex-col-reverse gap-3 items-end">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white text-[#12131C] px-4 py-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 get-started-icon"
              aria-label={link.label}
            >
              <span className="text-sm font-medium">{link.label}</span>
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
