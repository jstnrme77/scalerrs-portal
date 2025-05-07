'use client';

import React from 'react';
import ArrowButton from '@/components/ui/custom/ArrowButton';
import DashboardLayout from '@/components/DashboardLayout';

export default function ButtonExamplePage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-2xl font-bold">Button Examples</h1>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Primary Buttons (Dark Background)</h2>
          <div className="flex flex-wrap gap-4">
            <ArrowButton>Join Waiting List</ArrowButton>
            <ArrowButton size="sm">Small Button</ArrowButton>
            <ArrowButton size="lg">Large Button</ArrowButton>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Secondary Buttons (White Background)</h2>
          <div className="flex flex-wrap gap-4">
            <ArrowButton variant="secondary">Join Waiting List</ArrowButton>
            <ArrowButton variant="secondary" size="sm">Small Button</ArrowButton>
            <ArrowButton variant="secondary" size="lg">Large Button</ArrowButton>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Outline Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <ArrowButton variant="outline">Join Waiting List</ArrowButton>
            <ArrowButton variant="outline" size="sm">Small Button</ArrowButton>
            <ArrowButton variant="outline" size="lg">Large Button</ArrowButton>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons Without Arrow</h2>
          <div className="flex flex-wrap gap-4">
            <ArrowButton showArrow={false}>No Arrow</ArrowButton>
            <ArrowButton variant="secondary" showArrow={false}>No Arrow</ArrowButton>
            <ArrowButton variant="outline" showArrow={false}>No Arrow</ArrowButton>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
