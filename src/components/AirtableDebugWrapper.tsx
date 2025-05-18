'use client';

import dynamic from 'next/dynamic';

// Dynamically import the AirtableDebug component with no SSR
const AirtableDebug = dynamic(() => import('@/components/AirtableDebug'), { 
  ssr: false 
});

export default function AirtableDebugWrapper() {
  return <AirtableDebug />;
}
