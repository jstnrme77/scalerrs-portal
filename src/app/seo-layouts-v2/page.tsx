'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import { getClientId } from '@/lib/airtable/getClientId';
import { fetchFromAirtable, AirtableRecord } from '@/lib/airtable/helpers';
import { Link2 } from 'lucide-react';

/**
 * Airtable → SEO Layouts table record type (partial)
 */
interface SeoLayoutFields {
  Name?: string;
  Description?: string;
  'Layout Embed'?: string;
  'Client Record ID'?: string; // text column mirroring linked Client
}

type SeoLayoutRecord = AirtableRecord<SeoLayoutFields>;

async function fetchSeoLayouts(): Promise<SeoLayoutRecord[]> {
  const clientRecordID = getClientId();
  if (!clientRecordID) return [];
  const formula = `{Client Record ID} = '${clientRecordID}'`;
  return await fetchFromAirtable<SeoLayoutFields>('SEO Layouts', formula);
}

// Simple toast – replace with design-system component if available
function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-[9999] flex items-center space-x-2">
      <span>{msg}</span>
      <button onClick={onClose} className="font-bold">×</button>
    </div>
  );
}

/** Rich-text helper (HTML passthrough or newline-to-paragraphs) */
function renderRichText(raw?: string) {
  if (!raw) return null;

  // If already HTML, output directly
  const hasHtml = /<\w+/.test(raw);
  if (hasHtml) {
    // eslint-disable-next-line react/no-danger
    return <div className="prose max-w-3xl mb-4" dangerouslySetInnerHTML={{ __html: raw }} />;
  }

  // Split into trimmed, non-empty lines
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Detect if this is a bullet list (starts with - or • etc.)
  const BULLET_RE = /^(?:[-•—–]\s+)/;
  const SUB_BULLET_RE = /^(?:◦|○|o|\*)\s+/;

  const isBulletList = lines.every((l) => BULLET_RE.test(l) || SUB_BULLET_RE.test(l));

  if (!isBulletList) {
    // Treat as plain paragraphs
    return (
      <div className="max-w-3xl mb-4 space-y-2">
        {lines.map((l, i) => (
          <p key={i} className="text-sm text-gray-700 whitespace-pre-wrap">{l}</p>
        ))}
      </div>
    );
  }

  // Build list structure (one level of nesting)
  type Item = { txt: string; subs: string[] };
  const items: Item[] = [];

  lines.forEach((rawLine) => {
    if (SUB_BULLET_RE.test(rawLine)) {
      const cleaned = rawLine.replace(SUB_BULLET_RE, '').trim();
      if (!items.length) {
        items.push({ txt: cleaned, subs: [] });
      } else {
        items[items.length - 1].subs.push(cleaned);
      }
    } else {
      const cleaned = rawLine.replace(BULLET_RE, '').trim();
      items.push({ txt: cleaned, subs: [] });
    }
  });

  return (
    <ul className="list-disc pl-6 space-y-1 max-w-3xl mb-4">
      {items.map((it, idx) => (
        <li key={idx} className="text-sm text-gray-700">
          {it.txt}
          {it.subs.length > 0 && (
            <ul className="list-disc pl-6 space-y-1 mt-1">
              {it.subs.map((s, j) => (
                <li key={j} className="text-sm text-gray-700">{s}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function SEOLayoutsV2Page() {
  const [layouts, setLayouts] = useState<SeoLayoutRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Fetch layouts on mount */
  useEffect(() => {
    // Ensure Airtable iframe stretches full width
    const style = document.createElement('style');
    style.innerHTML = `.airtable-embed {width: 100% !important; height: 100% !important;}`;
    document.head.appendChild(style);

    // Cleanup
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const recs = await fetchSeoLayouts();
        setLayouts(recs);
        if (recs.length) setActiveId(recs[0].id);
      } catch (err) {
        console.error(err);
        setError('Failed to load SEO layouts. Please try again later.');
      }
      setLoading(false);
    })();
  }, []);

  /** Currently-selected record */
  const current = layouts.find((r) => r.id === activeId) ?? null;

  return (
    <DashboardLayout>
      {/* Error toast */}
      {error && <Toast msg={error} onClose={() => setError(null)} />}
      <PageContainer className="w-full">
        {/* Selector bar */}
        {loading ? (
          <PageContainerTabs>
            <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />
          </PageContainerTabs>
        ) : layouts.length > 0 && (
          <PageContainerTabs>
            <TabNavigation
              tabs={layouts.map((r) => ({
                id: r.id,
                label: r.fields.Name ?? 'Untitled',
                icon: <Link2 size={18} />,
              }))}
              activeTab={activeId ?? ''}
              onTabChange={(val) => setActiveId(val)}
              variant="primary"
            />
          </PageContainerTabs>
        )}

        <PageContainerBody className="p-6">
          {/* Loading skeleton */}
          {loading && (
            <div className="w-full h-[533px] bg-gray-100 animate-pulse rounded" />
          )}

          {/* Empty state */}
          {!loading && layouts.length === 0 && (
            <div className="w-full h-[300px] flex items-center justify-center bg-white border border-gray-200 rounded-lg">
              <p className="text-mediumGray text-base">No SEO layouts available for this client.</p>
            </div>
          )}

          {/* Description + Layout embed */}
          {!loading && current && (
            <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden min-h-[600px] h-[80vh] p-6 flex flex-col">
              {renderRichText(current.fields.Description)}
              {/* eslint-disable-next-line react/no-danger */}
              <div className="flex-1" dangerouslySetInnerHTML={{ __html: current.fields['Layout Embed'] ?? '' }} />
            </div>
          )}
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
} 