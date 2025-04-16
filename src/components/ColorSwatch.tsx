'use client';

import React from 'react';

interface ColorSwatchProps {
  name: string;
  color: string;
  textColor?: string;
}

export default function ColorSwatch({ name, color, textColor = 'text-white' }: ColorSwatchProps) {
  return (
    <div className="flex flex-col">
      <div 
        className={`h-16 w-full rounded-t-lg ${color} flex items-center justify-center ${textColor}`}
      >
        <span className="font-medium">{name}</span>
      </div>
      <div className="bg-white dark:bg-darkGray p-2 rounded-b-lg border border-t-0 border-lightGray dark:border-gray-700">
        <code className="text-xs">{color.replace('bg-', '')}</code>
      </div>
    </div>
  );
}
