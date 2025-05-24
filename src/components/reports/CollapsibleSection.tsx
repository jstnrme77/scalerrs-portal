import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useSectionRegistry } from './SectionRegistryContext';

interface CollapsibleSectionProps {
  title: string;
  icon?: React.ReactNode;
  /**  When provided, overrides the automatic "open" behaviour  */
  defaultOpen?: boolean;
  children: React.ReactNode;
}

/**
 * Generic wrapper that adds collapse / expand behaviour and
 * automatically registers its title with the SectionRegistryContext
 * so the Executive Summary can auto-list all sections on the page.
 */
export function CollapsibleSection({
  title,
  icon,
  defaultOpen,
  children,
}: CollapsibleSectionProps) {
  /* -------------------------------------------------------------- */
  /*  Auto-expand critical sections unless caller overrides          */
  /* -------------------------------------------------------------- */
  const autoOpenTitles = ['Executive Summary', 'Monthly Walkthrough'];
  const [open, setOpen] = useState(
    defaultOpen !== undefined ? defaultOpen : autoOpenTitles.includes(title)
  );

  const { register } = useSectionRegistry();

  // Register this title exactly once
  useEffect(() => {
    register(title);
  }, [register, title]);

  /* -------------------------------------------------------------- */
  /*  Dynamic top-border colour per section                          */
  /* -------------------------------------------------------------- */
  const borderColorClass =
    title === 'Wins'
      ? 'border-green-200'
      : title === 'Cautions & Areas to Watch' || title === 'Risks and Tradeoffs'
      ? 'border-amber-200'
      : 'border-[#F5F5F9]';

  return (
    <section
      className={`bg-white p-6 rounded-lg shadow-sm border-t-4 ${borderColorClass}`}
      data-section={title}
    >
      <header
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF]">
              {icon}
            </div>
          )}
          <h4 className="text-lg font-bold text-dark break-words">{title}</h4>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </header>

      {open && <div className="space-y-4">{children}</div>}
    </section>
  );
}

/* -------------------------------------------------------------- */
/* Executive Summary – auto-lists registered sections              */
/* -------------------------------------------------------------- */
export function ExecutiveSummary({ override }: { override?: string }) {
  const { sectionTitles } = useSectionRegistry();

  // Exclude self + KPI strip from the auto-generated list
  const excluded = new Set<string>(['Executive Summary', 'KPI Strip']);
  const bullets = sectionTitles.filter((t) => !excluded.has(t));

  return (
    <div className="bg-lightGray p-5 rounded-lg">
      <div className="flex items-center mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
          {/* simple speech-bubble icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-[#9EA8FB]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h6m-6 4h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-dark">Executive Summary</h4>
      </div>

      {/* Auto-generated bullets */}
      {bullets.length > 0 && (
        <ul className="list-disc pl-6 space-y-1 text-base text-mediumGray mb-4">
          {bullets.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      )}
    </div>
  );
} 