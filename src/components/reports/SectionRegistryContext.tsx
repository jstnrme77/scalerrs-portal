import React, { createContext, useState, useCallback, useContext } from 'react';

interface RegistryCtx {
  sectionTitles: string[];
  register: (title: string) => void;
}

const SectionRegistryContext = createContext<RegistryCtx | null>(null);

export function SectionRegistryProvider({ children }: { children: React.ReactNode }) {
  const [sectionTitles, setTitles] = useState<string[]>([]);

  const register = useCallback((title: string) => {
    setTitles((prev) => (prev.includes(title) ? prev : [...prev, title]));
  }, []);

  return (
    <SectionRegistryContext.Provider value={{ sectionTitles, register }}>
      {children}
    </SectionRegistryContext.Provider>
  );
}

export function useSectionRegistry() {
  const ctx = useContext(SectionRegistryContext);
  if (!ctx) throw new Error('useSectionRegistry must be used within SectionRegistryProvider');
  return ctx;
} 