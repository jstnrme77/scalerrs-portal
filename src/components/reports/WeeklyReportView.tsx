import React, { useEffect, useState, useMemo } from 'react';
import {
  FolderOpen,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Info,
  ArrowRight,
  BarChart2,
  ChevronDown,
} from 'lucide-react';
import { fetchActivityLogForWeek } from '@/lib/airtable/tables/activityLog';

interface WeeklyReportViewProps {
  /* The Airtable "fields" object coming from Clients By Week */
  weekRecord: any;
}

export default function WeeklyReportView({ weekRecord }: WeeklyReportViewProps) {
  const [activityRows, setActivityRows] = useState<any[]>([]);

  useEffect(() => {
    if (!weekRecord) return;

    (async () => {
      try {
        console.log('WeeklyReportView: Fetching activity logs for week:', weekRecord['Week']);
        console.log('Current clientRecordID from localStorage:', localStorage.getItem('clientRecordID'));
        
        const logs = await fetchActivityLogForWeek(weekRecord['Week']);
        console.log(`Fetched ${logs.length} activity logs for week ${weekRecord['Week']}`);
        setActivityRows(logs.map((r: any) => r.fields));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [weekRecord]);

  /* -------------------------------------------------------------- */
  /* Parsing helper functions                                        */
  /* -------------------------------------------------------------- */
  const splitBullets = (raw: string | undefined) => {
    if (!raw) return [] as string[];
    return raw
      .split(/(?:\n|•|\r)/)
      .map((t) => t.replace(/^[\s\-–—•]+/, '').trim())
      .filter(Boolean);
  };

  /* ────────────────────────────────────────────────────────────── */
  /*  Convert simple "-" / "•" bullet markup to semantic <ul><li>  */
  /* ────────────────────────────────────────────────────────────── */
  const formatRichText = (raw: string | undefined): string => {
    if (!raw) return '';
    const trimmed = raw.trim();

    // If the text already contains HTML, use it verbatim
    if (/^\s*<.+?>/.test(trimmed)) return trimmed;

    // Split into non-empty, trimmed lines
    const lines = trimmed
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return '';
    if (lines.length === 1) return `<p>${lines[0]}</p>`;

    /* -------------------------------------------------------------- */
    /* Build hierarchical structure with optional sub-bullets (◦, ○) */
    /* -------------------------------------------------------------- */
    const SUB_BULLET_RE = /^(?:◦|○|o|\*)\s+/;
    const ROOT_BULLET_RE = /^(?:[•\-—–])\s*/;

    type Item = { txt: string; subs: string[] };
    const items: Item[] = [];

    lines.forEach((raw) => {
      const isSub = SUB_BULLET_RE.test(raw);

      if (isSub && items.length === 0) {
        // Treat stray sub-bullet as root
        raw = raw.replace(SUB_BULLET_RE, '');
        items.push({ txt: raw.replace(/^\d+\.\s+/, '').replace(ROOT_BULLET_RE, ''), subs: [] });
        return;
      }

      if (isSub) {
        const cleaned = raw
          .replace(SUB_BULLET_RE, '')
          .replace(/^\d+\.\s+/, '')
          .trim();
        items[items.length - 1].subs.push(cleaned);
      } else {
        const cleaned = raw
          .replace(ROOT_BULLET_RE, '')
          .replace(/^\d+\.\s+/, '')
          .trim();
        items.push({ txt: cleaned, subs: [] });
      }
    });

    const rootLines = lines.filter((l) => !SUB_BULLET_RE.test(l));
    const numbered = rootLines.length > 0 && rootLines.every((l) => /^(?:[•\-—–]\s*)?\d+\.\s+/.test(l));

    const ListTag = numbered ? 'ol' : 'ul';
    const listClass = numbered ? 'list-decimal' : 'list-disc';

    const lis = items
      .map((item) => {
        const subLis = item.subs
          .map((s) => `<li>${s}</li>`) 
          .join('');
        const nested = subLis ? `<ul class="list-disc pl-6 space-y-1">${subLis}</ul>` : '';
        return `<li>${item.txt}${nested}</li>`;
      })
      .join('');

    return `<${ListTag} class="${listClass} pl-6 space-y-1 text-base text-mediumGray">${lis}</${ListTag}>`;
  };

  /* --------------------------------------------- */
  /* Parse nested bullet structure for Highlights   */
  /* • Main bullet                                 */
  /*   ◦ Sub bullet → shows under same card        */
  /* --------------------------------------------- */
  type Highlight = { title: string; subtitle?: string };
  const parseHighlights = (raw: string | undefined): Highlight[] => {
    if (!raw) return [];
    const lines = raw
      .split(/\n|\r/)
      .map((l) => l.trim())
      .filter(Boolean);

    const output: Highlight[] = [];
    let current: Highlight | null = null;

    lines.forEach((line) => {
      if (/^(?:•|\-|—|–)\s*/.test(line)) {
        // push previous before starting new
        if (current) output.push(current);
        current = {
          title: line
            .replace(/^(?:•|\-|—|–)\s*/, '') // leading bullet
            .replace(/^\d+\.\s+/, '')       // leading number
            .trim(),
        };
      } else if (/^(?:◦|○|o|\*)\s*/.test(line)) {
        const txt = line
          .replace(/^(?:◦|○|o|\*)\s*/, '')
          .replace(/^\d+\.\s+/, '')
          .trim();
        if (current) {
          current.subtitle = txt;
        } else {
          // unexpected sub-bullet without main; treat as main
          current = { title: txt };
        }
      } else {
        // plain line → append to subtitle
        if (current) {
          current.subtitle = current.subtitle ? current.subtitle + ' ' + line : line;
        } else {
          current = { title: line };
        }
      }
    });
    if (current) output.push(current);
    return output;
  };

  const highlights = parseHighlights(weekRecord['Weekly Highlights']);

  const whatWeDidHTML   = formatRichText(weekRecord['What We Did']);
  const nextStepsHTML   = formatRichText(weekRecord['Next Steps']);

  /* ------------------------------------------------------------------ */
  /*  Build Weekly Deliverables table                                   */
  /* ------------------------------------------------------------------ */
  const deliverablesByCategory = useMemo(() => {
    // De-duplicate by Deliverable – keep latest Timestamp
    type Row = { ts: number; category: string; item: string; status: string };
    const latest = new Map<string, Row>();

    activityRows.forEach((row: any) => {
      const deliv = row['Deliverable'] as string;
      if (!deliv) return;

      const ts = new Date(row['Timestamp'] as string).getTime();
      if (!latest.has(deliv) || ts > latest.get(deliv)!.ts) {
        latest.set(deliv, {
          ts,
          category: row['Category'] as string,
          item: row['Description'] as string,
          status: (() => {
            const val = row['To'];
            return Array.isArray(val) ? val.join(', ') : (val ?? '');
          })(),
        });
      }
    });

    // Group by Category → { [cat]: rows[] }
    return Array.from(latest.values()).reduce((acc: Record<string, Row[]>, r) => {
      acc[r.category] = acc[r.category] || [];
      acc[r.category].push(r);
      return acc;
    }, {} as Record<string, Row[]>);
  }, [activityRows]);

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */
  return (
    <div className="space-y-6">
      {/* What We Did */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>What We Did</span>
          </div>
        </h4>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: whatWeDidHTML }} />
      </div>

      {/* Weekly Deliverable Progress */}
      <div className="card bg-white p-6 border-t-4 border-[#FCDC94] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <BarChart2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Weekly Deliverable Progress</span>
          </div>
        </h4>

        {Object.keys(deliverablesByCategory).length === 0 && (
          <p className="text-sm text-mediumGray">No deliverable updates for this week.</p>
        )}

        {Object.entries(deliverablesByCategory).map(([category, rows]) => (
          <details key={category} className="mb-3 group">
            <summary className="cursor-pointer flex items-center font-medium text-dark mb-2 list-none">
              <ChevronDown className="h-4 w-4 mr-2 transition-transform group-open:rotate-180" />
              {category}
            </summary>
            <table className="min-w-full divide-y divide-gray-200 mb-2">
              <colgroup>
                <col style={{ width: '65%' }} />
                <col style={{ width: '35%' }} />
              </colgroup>
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(rows as any[]).map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-500 whitespace-pre-wrap align-top">{row.item}</td>
                    <td className="px-4 py-2 text-sm text-gray-500 align-top">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        ))}
      </div>

      {/* Weekly Highlights */}
      <div className="card bg-white p-6 border-t-4 border-[#EADCFF] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <LineChartIcon className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Weekly Highlights</span>
          </div>
        </h4>

        <div className="space-y-4">
          {highlights.map((item, idx) => (
            <div key={idx} className="p-4 bg-[#F5F5F9] rounded-lg">
              <div className="flex items-start">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${idx === 0 ? 'bg-green-100' : 'bg-blue-100'} mt-0.5 mr-3`}>
                  {idx === 0 ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600" />
                  ) : (
                    <Info className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div>
                  <h6 className="text-base font-medium text-dark">{item.title}</h6>
                  {item.subtitle && (
                    <p className="text-sm text-mediumGray mt-1">{item.subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ArrowRight className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Next Steps</span>
          </div>
        </h4>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: nextStepsHTML }} />
      </div>
    </div>
  );
} 