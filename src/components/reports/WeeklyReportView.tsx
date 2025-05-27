import React, { useEffect, useState, useMemo } from 'react';
import {
  FolderOpen,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Info,
  ArrowRight,
  BarChart2,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { fetchActivityLogForWeek } from '@/lib/airtable/tables/activityLog';
import { useClientData } from '@/context/ClientDataContext';

interface WeeklyReportViewProps {
  /* The Airtable "fields" object coming from Clients By Week */
  weekRecord: any;
}

// Format date like 'May 15, 2023'
const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });
};

// Format week label like '2023-W20'
const formatWeekLabel = (date: Date): string => {
  const year = date.getFullYear();
  
  // Get first day of the year
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Get days passed since first day of the year
  const daysPassed = Math.floor((date.getTime() - firstDayOfYear.getTime()) / (24 * 60 * 60 * 1000));
  
  // Get week number
  const weekNumber = Math.ceil((daysPassed + firstDayOfYear.getDay() + 1) / 7);
  
  // Pad week number with leading zero if needed
  const paddedWeekNumber = weekNumber.toString().padStart(2, '0');
  
  return `${year}-W${paddedWeekNumber}`;
};

// Get week date range (Monday - Sunday)
const getWeekDateRange = (weekLabel: string): { start: Date; end: Date } => {
  const [year, week] = weekLabel.split('-W');
  
  // Calculate the first day of the year
  const firstDayOfYear = new Date(parseInt(year), 0, 1);
  
  // Calculate the first day of the week (Monday)
  const firstDayOfFirstWeek = new Date(firstDayOfYear);
  const dayOffset = firstDayOfYear.getDay() || 7; // If Sunday (0), use 7
  firstDayOfFirstWeek.setDate(firstDayOfYear.getDate() + (1 - dayOffset));
  
  // Calculate the first day of the target week
  const weekStartDate = new Date(firstDayOfFirstWeek);
  weekStartDate.setDate(firstDayOfFirstWeek.getDate() + (parseInt(week) - 1) * 7);
  
  // Calculate the last day of the target week (Sunday)
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 6);
  
  return { start: weekStartDate, end: weekEndDate };
};

export default function WeeklyReportView({ weekRecord }: WeeklyReportViewProps) {
  const { clientId, isLoading: isClientLoading } = useClientData();
  const [activityRows, setActivityRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weekLabel, setWeekLabel] = useState(weekRecord['Week'] || formatWeekLabel(new Date()));
  
  // Calculate week date range
  const { start: weekStart, end: weekEnd } = getWeekDateRange(weekLabel);
  
  useEffect(() => {
    // Wait for client data to be loaded
    if (isClientLoading) {
      setLoading(true);
      return;
    }
    
    if (!clientId) {
      setError('No client selected. Please select a client to view reports.');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    async function fetchData() {
      try {
        console.log(`Fetching activity log for week ${weekLabel} with client ${clientId}`);
        const logs = await fetchActivityLogForWeek(weekLabel, clientId);
        
        if (!logs || logs.length === 0) {
          console.log(`No activity logs found for week ${weekLabel}`);
          setActivityRows([]);
        } else {
          console.log(`Found ${logs.length} activity logs for week ${weekLabel}`);
          setActivityRows(logs.map((r: any) => r.fields));
        }
      } catch (err) {
        console.error('Error fetching activity log:', err);
        setError('Failed to load activity log. Please try again later.');
        setActivityRows([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [weekLabel, clientId, isClientLoading]);

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

  // Group activity log by day and category
  const groupedActivities = activityRows.reduce((acc, item) => {
    const timestamp = new Date(item['Timestamp'] as string);
    const date = timestamp.toLocaleDateString('en-US');
    const category = item['Category'] as string || 'Uncategorized';
    
    if (!acc[date]) acc[date] = {};
    if (!acc[date][category]) acc[date][category] = [];
    
    acc[date][category].push(item);
    return acc;
  }, {} as Record<string, Record<string, any[]>>);
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedActivities).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  // Navigation to previous/next week
  const goToPreviousWeek = () => {
    const [year, week] = weekLabel.split('-W');
    const prevWeek = parseInt(week) - 1;
    
    if (prevWeek < 1) {
      // Go to last week of previous year
      const prevYear = parseInt(year) - 1;
      // Assuming 52 weeks in a year (simplified)
      setWeekLabel(`${prevYear}-W52`);
    } else {
      setWeekLabel(`${year}-W${prevWeek.toString().padStart(2, '0')}`);
    }
  };
  
  const goToNextWeek = () => {
    const [year, week] = weekLabel.split('-W');
    const nextWeek = parseInt(week) + 1;
    
    if (nextWeek > 52) {
      // Go to first week of next year
      const nextYear = parseInt(year) + 1;
      setWeekLabel(`${nextYear}-W01`);
    } else {
      setWeekLabel(`${year}-W${nextWeek.toString().padStart(2, '0')}`);
    }
  };

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */
  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex justify-between items-center">
        <button 
          onClick={goToPreviousWeek}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Previous Week
        </button>
        
        <h2 className="text-lg font-medium">
          {formatDate(weekStart)} - {formatDate(weekEnd)}
        </h2>
        
        <button 
          onClick={goToNextWeek}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        >
          Next Week
        </button>
      </div>
      
      {loading && <div className="text-center py-8">Loading activity log...</div>}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && sortedDates.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <p className="font-medium">No activity found</p>
          <p>There is no activity logged for this week.</p>
        </div>
      )}
      
      {/* Activity Log */}
      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="font-medium">{formatDate(date)}</h3>
            </div>
            
            <div className="divide-y">
              {Object.entries(groupedActivities[date]).map(([category, items]) => (
                <details key={category} className="group" open>
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="font-medium">{category}</span>
                      <span className="ml-2 text-sm text-gray-500">({(items as any[]).length})</span>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  
                  <div className="px-4 py-2 space-y-2 bg-gray-50">
                    {(items as any[]).map((item: any, idx: number) => (
                      <div key={idx} className="bg-white p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <div className="font-medium">{item['Deliverable'] || 'Activity'}</div>
                          <div className="text-sm text-gray-500">
                            {new Date(item['Timestamp'] as string).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="mt-1">{item['Description']}</div>
                        {item['From'] && item['To'] && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-500">Status changed from </span>
                            <span className="font-medium">{item['From']}</span>
                            <span className="text-gray-500"> to </span>
                            <span className="font-medium">{item['To']}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

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