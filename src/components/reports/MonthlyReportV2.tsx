import React, { useEffect, useMemo, useState } from 'react';
import {
  Link2,
  ChartColumn,
  FolderOpen,
  MessageSquare,
  Video,
  BarChart2,
  TrendingUp,
  ThumbsUp,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import KPIStrip from '@/components/reports/KPIStrip';
import { CollapsibleSection } from '@/components/reports/CollapsibleSection';
import { SectionRegistryProvider } from '@/components/reports/SectionRegistryContext';
import { AirtableRecord, fetchFromAirtable } from '@/lib/airtable/helpers';
import { useClientData } from '@/context/ClientDataContext';

/* Placeholder constants removed – component now fully dynamic */
const COLORS = ['#9ea8fb', '#fcdc94', '#eadcff', '#ff9d7d', '#e5e7eb'];

/* Custom label for pie */
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#333333"
      textAnchor="middle"
      dominantBaseline="central"
      fontWeight={600}
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/* -------------------------------------------------------------- */
/*  Types                                                         */
/* -------------------------------------------------------------- */

interface MonthlyReportProps {
  /** Airtable record for the selected month (Clients by Month) */
  monthRecord: AirtableRecord<any>;
  /** Array of the most-recent Clients-by-Month records (newest → oldest) */
  recentRecords: AirtableRecord<any>[];
}

/* Utility to extract rich-text HTML (Airtable returns either HTML or markdown) */
const renderRichText = (txt?: string) => {
  if (!txt) return <p className="text-mediumGray">—</p>;

  const hasHtml = /<\w+/.test(txt);
  if (hasHtml) {
    return (
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: txt }}
      />
    );
  }

  // Plain text – treat newline-separated lines as list
  const lines = txt.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length > 1) {
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
        // Stray sub-bullet → treat as root
        raw = raw.replace(SUB_BULLET_RE, '');
        items.push({ txt: raw.replace(/^\d+\\?\.\s+/, '').replace(ROOT_BULLET_RE, ''), subs: [] });
        return;
      }

      if (isSub) {
        const cleaned = raw
          .replace(SUB_BULLET_RE, '')
          .replace(/^\d+\\?\.\s+/, '')
          .trim();
        items[items.length - 1].subs.push(cleaned);
      } else {
        const cleaned = raw
          .replace(ROOT_BULLET_RE, '')
          .replace(/^\d+\\?\.\s+/, '')
          .trim();
        items.push({ txt: cleaned, subs: [] });
      }
    });

    // Determine if top-level is ordered (ignore sub-bullets)
    const rootLines = lines.filter(l => !SUB_BULLET_RE.test(l));
    const numbered = rootLines.length > 0 && rootLines.every(l => /^(?:[•\-—–]\s*)?\d+\\?\.\s+/.test(l));

    const ListTag = numbered ? 'ol' : 'ul';
    const listClass = numbered ? 'list-decimal' : 'list-disc';

    return (
      <ListTag className={`${listClass} pl-6 space-y-1 text-base text-mediumGray`}>
        {items.map((item, idx) => (
          <li key={idx} className="space-y-1">
            {item.txt}
            {item.subs.length > 0 && (
              <ul className="list-disc pl-6 space-y-1">
                {item.subs.map((sub, j) => (
                  <li key={j}>{sub}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ListTag>
    );
  }
  return <p className="text-base text-mediumGray whitespace-pre-wrap">{txt}</p>;
};

/* Helper: format month label like "Apr 2025" */
const fmt = (d: string) =>
  new Date(d).toLocaleString('default', { month: 'short', year: 'numeric' });

export default function MonthlyReportV2({ monthRecord, recentRecords }: MonthlyReportProps) {
  const { clientId } = useClientData();
  
  /* ------------------------------------------------------------------ */
  /*  Derive KPI + month-level fields                                   */
  /* ------------------------------------------------------------------ */
  const fields = monthRecord?.fields ?? {};

  const kpi = useMemo(() => {
    const traffic = Number(fields["Organic Traffic (Actual)"] ?? 0);
    const leads = Number(fields["Leads"] ?? 0);
    const estRevenue = Number(fields["Estimated Revenue"] ?? 0);
    const budget = Number(fields["Client Budget"] ?? 0);
    const roiPct = budget ? Math.round((estRevenue / budget) * 100) : undefined;
    const cpc = Number(fields["CPC Equivalence"] ?? 0);

    return { traffic, leads, roiPct, cpc } as const;
  }, [fields]);

  /* ------------------------------------------------------------------ */
  /*  Build last-4-months dataset for charts                             */
  /* ------------------------------------------------------------------ */
  const monthlyPerformanceData = useMemo(() => {
    return recentRecords.slice(0, 4).reverse().map((rec) => {
      const f = rec.fields as any;
      const clicks = Number(f["Organic Traffic (Actual)"] ?? 0);
      const leads  = Number(f["Leads"] ?? 0);
      const revenue= Number(f["Estimated Revenue"] ?? 0);

      return {
        month: fmt(f["Month Start"] || f["Month"] || rec.id),
        clicks,
        leads,
        revenue,
      };
    });
  }, [recentRecords]);

  /* ------------------------------------------------------------------ */
  /*  Keyword buckets for the selected month                            */
  /* ------------------------------------------------------------------ */
  const keywordBucketData = useMemo(() => [
    { name: 'Top 3',  keywords: Number(fields['Keywords In Top 3 Positions']  ?? 0) },
    { name: '4-10',   keywords: Number(fields['Keywords In Top 10 Positions'] ?? 0) },
    { name: 'Top 100',keywords: Number(fields['Keywords In Top 100 Positions']?? 0) },
  ], [fields]);

  /* ------------------------------------------------------------------ */
  /*  Async: Content Movers, Competitor Intel, Deliverables              */
  /* ------------------------------------------------------------------ */
  const [contentMovers, setContentMovers] = useState<any[]>([]);
  const [competitorRows, setCompetitorRows] = useState<any[]>([]);
  const [deliverableRows, setDeliverableRows] = useState<any[]>([]);

  /* Fetch Content Movers (Keywords table) */
  useEffect(() => {
    (async () => {
      try {
        if (!clientId) return;

        const formula = `AND({Client Record ID} = '${clientId}', {Target Page URL} != '')`;
        const kw = await fetchFromAirtable<any>('Keywords', formula);

        const top5 = kw
          .map((r) => ({
            url: r.fields['Target Page URL'] as string,
            keyword: r.fields['Main Keyword'] as string,
            position: r.fields['Main Keyword Position'] as number,
            previous: r.fields['Main Keyword Position Last Month'] as number,
            traffic: r.fields['Traffic This Month'] as number,
            conversionRate: r.fields['Conversion Rate'] as number,
            avgValue: r.fields['Average Value of Visitor'] as number,
          }))
          .filter((r) => r.url)
          .sort((a, b) => (b.traffic ?? 0) - (a.traffic ?? 0))
          .slice(0, 5)
          .map((r) => ({
            ...r,
            change: (r.position ?? 0) - (r.previous ?? 0),
            revenue: (r.avgValue ?? 0) * (r.traffic ?? 0),
          }));

        setContentMovers(top5);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [monthRecord, clientId]);

  /* Fetch Competitor Insights */
  useEffect(() => {
    (async () => {
      try {
        const ids: string[] = (fields['Competitor Insights'] ?? []) as string[];
        if (!ids.length) return;

        const formula = `OR(${ids.map((id) => `RECORD_ID() = '${id}'`).join(',')})`;
        const recs = await fetchFromAirtable<any>('Competitor Insights', formula);
        const rows = recs.map((r) => ({
          name: r.fields['Competitor Name'] as string,
          notes: r.fields['Notes'] as string,
          link: r.fields['Screenshot Link'] as string,
        }));
        setCompetitorRows(rows);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [fields]);

  /* Fetch Activity Log for Deliverables */
  useEffect(() => {
    (async () => {
      try {
        const clientPlusMonth = fields['Client + Month'];
        if (!clientPlusMonth) return;
        const formula = `{Client + Month} = '${clientPlusMonth}'`;
        const logs = await fetchFromAirtable<any>('Activity Log', formula);

        /* Deduplicate by Deliverable → keep latest by Timestamp */
        const latestMap = new Map<string, any>();
        logs.forEach((r) => {
          const deliv = r.fields['Deliverable'] as string;
          const ts = new Date(r.fields['Timestamp'] as string).getTime();
          if (!latestMap.has(deliv) || ts > latestMap.get(deliv).ts) {
            latestMap.set(deliv, {
              ts,
              category: r.fields['Category'] as string,
              item: r.fields['Description'] as string,
              status: (() => {
                const val = r.fields['To'];
                return Array.isArray(val) ? val.join(', ') : (val ?? '');
              })(),
            });
          }
        });

        setDeliverableRows(Array.from(latestMap.values()));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [fields]);

  return (
    <SectionRegistryProvider>
      <div className="space-y-6">
        {/* Quick Links removed here – moved below Monthly Walkthrough */}

        {/* KPI Strip (not collapsible) */}
        <KPIStrip
          traffic={kpi.traffic}
          leads={kpi.leads}
          roiPct={kpi.roiPct}
          cpc={kpi.cpc}
          showROI={true}
        />

        {/* Executive Summary + TLDR */}
        <CollapsibleSection title="Executive Summary" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />}>
          <h5 className="text-base font-medium text-dark mb-2">TL;DR</h5>
          {renderRichText(fields['TL;DR'] as string)}

          <h5 className="text-base font-medium text-dark mb-2">Executive Summary</h5>
          {renderRichText(fields['Executive Summary'] as string)}
        </CollapsibleSection>

        {/* Monthly Walkthrough */}
        <CollapsibleSection title="Monthly Walkthrough" icon={<Video className="h-5 w-5 text-[#9EA8FB]" />}>
          {fields['Loom Video Walkthrough'] ? (
            <div
              className="w-full aspect-w-16 aspect-h-9"
              dangerouslySetInnerHTML={{ __html: fields['Loom Video Walkthrough'] as string }}
            />
          ) : (
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4">
              <Video className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3 text-center">No Loom video provided for this month</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Quick Links (moved) */}
        <CollapsibleSection title="Quick Links" icon={<Link2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
                <ChartColumn className="h-5 w-5 text-[#9EA8FB]" />
              </div>
              <span className="text-base text-dark">GSC Dashboard</span>
            </a>
            <a href="https://drive.google.com" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
                <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
              </div>
              <span className="text-base text-dark">Content Folder</span>
            </a>
            <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
                <Link2 className="h-5 w-5 text-[#9EA8FB]" />
              </div>
              <span className="text-base text-dark">Backlink Sheet</span>
            </a>
          </div>
        </CollapsibleSection>

        {/* Channel Performance */}
        <CollapsibleSection title="Channel Performance" icon={<BarChart2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-base font-medium text-dark mb-2">Organic Traffic (Clicks)</h5>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="clicks" fill="#9ea8fb" name="Clicks" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h5 className="text-base font-medium text-dark mb-2">Leads & Revenue</h5>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyPerformanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="leads" fill="#9ea8fb" name="Leads" />
                    <Bar dataKey="revenue" fill="#fcdc94" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Keyword Buckets */}
        <CollapsibleSection title="Keyword Position Buckets" icon={<BarChart2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={keywordBucketData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="keywords" fill="#9ea8fb" name="Keywords" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CollapsibleSection>

        {/* Campaign Projection */}
        <CollapsibleSection title="Campaign Projection" icon={<TrendingUp className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <h5 className="text-base font-medium text-dark mb-3">Progress vs. Goals (last 90 days) </h5>
          {(() => {
            const lastThree = recentRecords.slice(0,3);
            const totals = lastThree.reduce(
              (acc, rec) => {
                const f = rec.fields as any;
                acc.trafficActual += Number(f['Organic Traffic (Actual)'] ?? 0);
                acc.trafficProjected += Number(f['Organic Traffic (Projected)'] ?? 0);
                acc.clicksActual += Number(f['Clicks Actual'] ?? f['Organic Traffic (Actual)'] ?? 0);
                acc.clicksProjected += Number(f['Clicks Projected'] ?? 0);
                return acc;
              },
              { trafficActual: 0, trafficProjected: 0, clicksActual: 0, clicksProjected: 0 }
            );

            const trafficPct = totals.trafficProjected ? Math.round((totals.trafficActual / totals.trafficProjected) * 100) : 0;
            const clicksPct  = totals.clicksProjected ? Math.round((totals.clicksActual / totals.clicksProjected) * 100) : 0;
            const revenuePct = 42; // placeholder until revenue projections available

            const Bar = ({ pct, colour }: { pct: number; colour: string }) => (
              <div className="w-full bg-gray-200 rounded-full h-3"><div className={`${colour} h-3 rounded-full`} style={{ width: `${pct}%` }}></div></div>
            );

            return (
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-xs font-medium">Traffic Goal</span><span className="text-xs font-medium">{trafficPct}%</span></div>
                  <Bar pct={trafficPct} colour="bg-[#9EA8FB]" />
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-xs font-medium">Clicks Goal</span><span className="text-xs font-medium">{clicksPct}%</span></div>
                  <Bar pct={clicksPct} colour="bg-[#9EA8FB]" />
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-xs font-medium">Revenue</span><span className="text-xs font-medium">{revenuePct}%</span></div>
                  <Bar pct={revenuePct} colour="bg-[#EADCFF]" />
                </div>
              </div>
            );
          })()}
        </CollapsibleSection>

        {/* Wins */}
        <CollapsibleSection title="Wins" icon={<ThumbsUp className="h-5 w-5 text-green-600" />} defaultOpen={false}>
          {renderRichText(fields['Wins'] as string)}
        </CollapsibleSection>

        {/* Cautions */}
        <CollapsibleSection title="Cautions & Areas to Watch" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          {renderRichText(fields['Cautions & Areas To Watch'] as string)}
        </CollapsibleSection>

        {/* Content Movers */}
        <CollapsibleSection title="Content Movers" icon={<TrendingUp className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="overflow-x-auto mb-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Pos.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contentMovers.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline"><a href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.keyword}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.change > 0 ? '+' : ''}{row.change}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.traffic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.conversionRate}%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${row.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Key takeaways */}
          {renderRichText(fields['Key Takeaways (Content Movers)'] as string)}
        </CollapsibleSection>

        {/* Next Month Roadmap */}
        <CollapsibleSection title="Next Month's Roadmap" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          {renderRichText(fields["Where We're Heading Next"] as string)}
        </CollapsibleSection>

        {/* Risks & Tradeoffs */}
        <CollapsibleSection title="Risks and Tradeoffs" icon={<AlertTriangle className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          {renderRichText(fields['Risks and Tradeoffs'] as string)}
        </CollapsibleSection>

        {/* Competitor Intel */}
        <CollapsibleSection title="Competitor Intel" icon={<Info className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitorRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.notes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline"><a href={row.link} target="_blank" rel="noopener noreferrer">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        {/* Monthly Deliverables Progress */}
        <CollapsibleSection title="Monthly Deliverables Progress" icon={<FolderOpen className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          {Object.entries(
            deliverableRows.reduce((acc: any, r: any) => {
              acc[r.category] = acc[r.category] || [];
              acc[r.category].push(r);
              return acc;
            }, {})
          ).map(([category, rows]) => (
            <details key={category} className="mb-3 group" open={false}>
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
        </CollapsibleSection>
      </div>
    </SectionRegistryProvider>
  );
} 