'use client';

import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/forms';

interface ThemeCardProps {
  theme: 'light' | 'dark';
  children?: ReactNode;
}

export default function ThemeCard({ theme, children }: ThemeCardProps) {
  const isDark = theme === 'dark';
  
  return (
    <div 
      className={`
        p-6 rounded-scalerrs
        ${isDark 
          ? 'bg-dark text-white' 
          : 'bg-white text-dark border border-lightGray'
        }
      `}
    >
      <div className="mb-4">
        <span 
          className="inline-block px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
        >
          Theme {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </div>
      
      <div className="mb-6">
        <h3 className="text-3xl font-bold mb-4">Heading</h3>
        <p className={`${isDark ? 'text-gray-300' : 'text-mediumGray'} mb-6`}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
          Suspendisse varius enim in eros elementum tristique.
          Duis cursus, mi quis viverra ornare
        </p>
        
        <div className="flex space-x-4">
          <Button variant="primary">Button Text</Button>
          <Button 
            variant="outline" 
            className={`${isDark ? 'bg-transparent' : 'bg-transparent'}`}
          >
            Button Text
          </Button>
        </div>
      </div>
      
      {children}
    </div>
  );
}
