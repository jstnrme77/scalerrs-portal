'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function ThemeToggleWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full bg-lightGray border border-lightGray"></div>
    );
  }

  return <ThemeToggle />;
}
