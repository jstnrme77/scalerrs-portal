import React, { useEffect, useState, useMemo } from 'react';
import {
  FolderOpen,
  LineChart as LineChartIcon,
  ArrowUpRight,
  Info,
  ArrowRight,
  BarChart2,
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
        const logs = await fetchActivityLogForWeek(weekRecord['Week']);
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
    // If the text already contains HTML tags, return as-is
    if (/^\s*<.+?>/.test(trimmed)) return trimmed;

    const lines = trimmed
      .split(/\n|\r/)
      .map((l) => l.replace(/^[\s\-–—•]+/, '').trim())
      .filter(Boolean);

    if (lines.length === 0) return '';
    if (lines.length === 1) return `<p>${lines[0]}</p>`;

    const lis = lines.map((l) => `<li>${l}</li>`).join('');
    return `<ul class="list-disc pl-5 space-y-1">${lis}</ul>`;
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
        current = { title: line.replace(/^(?:•|\-|—|–)\s*/, '').trim() };
      } else if (/^(?:◦|○|o|\*)\s*/.test(line)) {
        const txt = line.replace(/^(?:◦|○|o|\*)\s*/, '').trim();
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

  /* Group activity by the "Category" column */
  const activityByCategory = useMemo(() => {
    return activityRows.reduce((acc: Record<string, any[]>, row: any) => {
      const cat = row['Category'] || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(row);
      return acc;
    }, {} as Record<string, any[]>);
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

        {Object.keys(activityByCategory).length === 0 && (
          <p className="text-sm text-mediumGray">No deliverable updates for this week.</p>
        )}

        {Object.entries(activityByCategory).map(([category, rows]) => (
          <div key={category} className="mb-4">
            <h5 className="text-base font-medium text-dark mb-2">{category}</h5>
            <ul className="list-disc pl-5 space-y-1 text-base text-mediumGray">
              {rows.map((row: any, idx: number) => (
                <li key={idx}>
                  {row['Deliverable']} &nbsp;–&nbsp; {row['From']} → {row['To']}
                </li>
              ))}
            </ul>
          </div>
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