'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ResetMockDataButton
const ResetMockDataButton = dynamic(
  () => import('./ResetMockDataButton'),
  { ssr: false }
);

export default function ResetButtonWrapper() {
  return <ResetMockDataButton />;
} 