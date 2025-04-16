'use client';

import React from 'react';
import ColorSwatch from './ColorSwatch';

export default function ThemeColors() {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-dark dark:text-white">Theme Colors</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <ColorSwatch name="Primary" color="bg-primary" />
        <ColorSwatch name="Dark" color="bg-dark" />
        <ColorSwatch name="Gold" color="bg-gold" textColor="text-dark" />
        <ColorSwatch name="Lavender" color="bg-lavender" textColor="text-dark" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ColorSwatch name="Light Gray" color="bg-lightGray" textColor="text-dark" />
        <ColorSwatch name="Medium Gray" color="bg-mediumGray" />
        <ColorSwatch name="Dark Gray" color="bg-darkGray" />
        <ColorSwatch name="White" color="bg-white" textColor="text-dark" />
      </div>
    </div>
  );
}
