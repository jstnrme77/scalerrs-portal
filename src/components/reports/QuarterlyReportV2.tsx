import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  LineChart as LineChartIcon,
  BarChart2,
  MessageSquare,
  FolderOpen,
  Link2,
  FileText,
  FlaskConical,
  ArrowUpRight,
  AlertTriangle,
  Info,
  ArrowDownRight,
  Video,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { CollapsibleSection, ExecutiveSummary } from '@/components/reports/CollapsibleSection';
import { SectionRegistryProvider } from '@/components/reports/SectionRegistryContext';
import KPIStrip from '@/components/reports/KPIStrip';
import { AirtableRecord, fetchFromAirtable } from '@/lib/airtable/helpers';
import { useClientData } from '@/context/ClientDataContext';

/* -------------------------------------------------------------- */
/*  Types                                                         */
/* -------------------------------------------------------------- */

interface QuarterlyReportProps {
  quarterRecord: AirtableRecord<any>;
  recentQuarterRecords: AirtableRecord<any>[]; // newest → oldest
  monthlyRecords: AirtableRecord<any>[];       // for trendline
}

type TrafficRow = { metric: string; prev?: number; current: number; growthPct?: number };

type CompetitorRow = { competitor: string; keywordFocus: string; rankChange: number; activity: string; screenshot?: string };

/* Helper – format % with sign */
const fmtPct = (n?: number) => (n === undefined ? 'NA' : `${n > 0 ? '+' : ''}${n.toFixed(1)}%`);

/* Helper – month label */
const fmtMonth = (d: string) => new Date(d).toLocaleString('default', { month: 'short', year: '2-digit' });

/* Reuse renderRichText helper from Monthly component (simplified) */
const renderRichText = (txt?: string) => {
  if (!txt) return <p className="text-mediumGray">—</p>;
  const hasHtml = /<\w+/.test(txt);
  if (hasHtml) {
    return <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: txt }} />;
  }
  // Plain text – newline ➔ <p>
  return txt.split(/\r?\n/).map((l, i)=>(<p key={i} className="text-base text-mediumGray whitespace-pre-wrap">{l}</p>));
};

export default function QuarterlyReportV2({ quarterRecord, recentQuarterRecords, monthlyRecords }: QuarterlyReportProps) {
  const { clientId } = useClientData();

  // Render nothing until the Airtable data for this quarter has loaded
  if (!quarterRecord || !quarterRecord.fields || Object.keys(quarterRecord.fields).length === 0) {
    return null;
  }

  /* -------------------------------------------------------------- */
  /*  Derive KPI + quarter-level fields                              */
  /* -------------------------------------------------------------- */
  const fields = quarterRecord.fields;

  // Current quarter metrics
  const clicksCurrent = Number(fields['Clicks (Actual)'] ?? 0);
  const leadsCurrent  = Number(fields['Leads (Actual)'] ?? fields['Leads'] ?? 0);
  const revenueCurrent= Number(fields['Revenue (Actual)'] ?? 0);

  // Previous quarter (if available in recent list)
  const idx = recentQuarterRecords.findIndex(r => r.id === quarterRecord.id);
  const prev = idx >= 0 && idx < recentQuarterRecords.length - 1 ? recentQuarterRecords[idx + 1] : undefined;
  const prevFields = prev?.fields ?? {};
  const clicksPrev = Number(prevFields['Clicks (Actual)'] ?? 0) || undefined;
  const leadsPrev  = Number(prevFields['Leads (Actual)'] ?? prevFields['Leads'] ?? 0) || undefined;
  const revenuePrev= Number(prevFields['Revenue (Actual)'] ?? 0) || undefined;

  const growth = (curr: number, prev?: number) => (prev && prev !== 0 ? (curr - prev) / prev * 100 : undefined);

  const clicksGrowthPct = growth(clicksCurrent, clicksPrev);
  const leadsGrowthPct  = growth(leadsCurrent, leadsPrev);

  /* KPI mini-strip cards (dynamic) */
  const kpiCards = [
    { label: 'Clicks Growth (QoQ)', value: fmtPct(clicksGrowthPct), colour: clicksGrowthPct === undefined ? 'text-gray-500' : (clicksGrowthPct > 0 ? 'text-green-600' : 'text-red-600') },
    { label: 'Lead Growth (QoQ)',   value: fmtPct(leadsGrowthPct),  colour: leadsGrowthPct  === undefined ? 'text-gray-500' : (leadsGrowthPct  > 0 ? 'text-green-600' : 'text-red-600') },
    { label: 'Revenue Impact',      value: `$${revenueCurrent.toLocaleString()}`, colour: 'text-primary' },
  ];

  /* -------------------------------------------------------------- */
  /* Trendline – pull last 4 months using monthlyRecords             */
  /* -------------------------------------------------------------- */
  const linkedMonthIds: string[] = (fields['Clients by Month'] ?? fields['Clients By Month'] ?? []) as string[];

  const monthsForTrend = useMemo(() => {
    if (linkedMonthIds.length) {
      // Use the linked records, preserve original order (oldest → newest)
      const linked = linkedMonthIds
        .map(id => monthlyRecords.find(r => r.id === id))
        .filter(Boolean) as typeof monthlyRecords;
      return linked.slice(-4); // max 4 months
    }
    // Fallback: previous logic based on date
    const quarterEnd = fields['Quarter End'] || fields['Quarter'] || quarterRecord.id;
    const endDate = new Date(quarterEnd);
    const subset: any[] = [];
    for (const rec of monthlyRecords) {
      const f = rec.fields as any;
      const start = f['Month Start'] || f['Month'] || rec.id;
      const d = new Date(start);
      if (d <= endDate) subset.push(rec);
      if (subset.length === 4) break;
    }
    return subset.reverse();
  }, [monthlyRecords, linkedMonthIds]);

  const trendlineData = monthsForTrend.map((rec) => {
    const f = rec.fields as any;
    return {
      month: fmtMonth(f['Month Start'] || f['Month'] || rec.id),
      clicks: Number(f['Clicks (Actual)'] ?? f['Clicks Actual'] ?? f['Organic Traffic (Actual)'] ?? 0),
      leads: Number(f['Leads'] ?? 0),
      revenue: Number(f['Estimated Revenue'] ?? 0),
    };
  });

  /* -------------------------------------------------------------- */
  /* Traffic & Revenue table rows                                    */
  /* -------------------------------------------------------------- */
  const trafficRows: TrafficRow[] = [
    { metric: 'Clicks', prev: clicksPrev, current: clicksCurrent, growthPct: clicksGrowthPct },
    { metric: 'Leads',  prev: leadsPrev,  current: leadsCurrent,  growthPct: leadsGrowthPct  },
    { metric: 'Revenue',prev: revenuePrev, current: revenueCurrent, growthPct: growth(revenueCurrent, revenuePrev) },
  ];

  /* Sorting state for table */
  const [trDesc, setTrDesc] = useState(true);
  const sortedTrafficRows = [...trafficRows].sort((a,b)=>{
    const valA = a.growthPct ?? -Infinity;
    const valB = b.growthPct ?? -Infinity;
    return trDesc ? (valB - valA) : (valA - valB);
  });

  /* -------------------------------------------------------------- */
  /* Deliverables Roll-up (Activity Log)                             */
  /* -------------------------------------------------------------- */
  const [deliverableRows, setDeliverableRows] = useState<any[]>([]);

  useEffect(()=>{
    (async ()=>{
      try {
        const quarterName = fields['Quarter Name'] || fields['Client + Quarter'];
        if (!quarterName) return;
        const formula = `{Quarter + Client} = '${quarterName}'`;
        const logs = await fetchFromAirtable<any>('Activity Log', formula);

        /* Dedup by Deliverable – keep latest */
        const latest = new Map<string, any>();
        logs.forEach(r=>{
          const deliv = r.fields['Deliverable'] as string;
          if (!deliv) return;
          const ts = new Date(r.fields['Timestamp'] as string).getTime();
          if (!latest.has(deliv) || ts > latest.get(deliv).ts){
            latest.set(deliv, {
              ts,
              category: r.fields['Category'] as string,
              item: r.fields['Description'] as string,
              status: (()=>{const v=r.fields['To']; return Array.isArray(v)?v.join(', '): (v??'');})(),
            });
          }
        });
        setDeliverableRows(Array.from(latest.values()));
      }catch(err){console.error(err);} })();
  },[fields]);

  const deliverablesByCategory = deliverableRows.reduce((acc: any, r: any)=>{ acc[r.category] = acc[r.category]||[]; acc[r.category].push(r); return acc;}, {} as Record<string, any[]>);

  /* -------------------------------------------------------------- */
  /* Competitor Intel                                               */
  /* -------------------------------------------------------------- */
  const [competitorRows,setCompetitorRows] = useState<CompetitorRow[]>([]);

  useEffect(()=>{
    (async()=>{
      try {
        const ids: string[] = (fields['Competitor Insights'] ?? []) as string[];
        if (!ids.length) return;
        const formula = `OR(${ids.map(id=>`RECORD_ID() = '${id}'`).join(',')})`;
        const recs = await fetchFromAirtable<any>('Competitor Insights', formula);
        const rows: CompetitorRow[] = recs.map(r=>({
          competitor: r.fields['Competitor Name'] as string,
          keywordFocus: r.fields['Keyword Focus'] as string,
          rankChange: Number(r.fields['Rank Change QoQ'] ?? 0),
          activity: r.fields['Notes'] as string,
          screenshot: r.fields['Screenshot Link'] as string,
        }));
        setCompetitorRows(rows);
      }catch(err){console.error(err);} })();
  },[fields]);

  const [compDesc,setCompDesc] = useState(true);
  const sortedCompetitors = [...competitorRows].sort((a,b)=> compDesc ? b.rankChange - a.rankChange : a.rankChange - b.rankChange);

  /* -------------------------------------------------------------- */
  /* Experiments – linked records                                   */
  /* -------------------------------------------------------------- */
  const [experiments,setExperiments] = useState<any[]>([]);
  useEffect(()=>{
    (async()=>{
      try {
        const ids: string[] = (fields['Experiments'] ?? []) as string[];
        if (!ids.length) return;
        const formula = `OR(${ids.map(id=>`RECORD_ID() = '${id}'`).join(',')})`;
        const recs = await fetchFromAirtable<any>('Experiments', formula);
        setExperiments(recs.map(r=>({
          name: r.fields['Name'] as string,
          notes: r.fields['Notes'] as string,
        })));
      }catch(err){console.error(err);} })();
  },[fields]);

  /* -------------------------------------------------------------- */
  /* Risks & Tradeoffs – simple array split by newline              */
  /* -------------------------------------------------------------- */
  const risks = (fields['Risks and Tradeoffs'] as string | undefined)?.split(/\r?\n/).map(l=>l.trim()).filter(Boolean) || [];

  /* -------------------------------------------------------------- */
  /* Top Performing Pages                                           */
  /* -------------------------------------------------------------- */
  const [topPages, setTopPages] = useState<any[]>([]);

  useEffect(()=>{
    (async()=>{
      try {
        if (!clientId) return;

        const kw = await fetchFromAirtable<any>('Keywords', `{Client Record ID} = '${clientId}'`);

        const rows = kw
          .map(r=>({
            url: r.fields['Target Page URL'] as string,
            keyword: r.fields['Main Keyword'] as string,
            traffic: Number(r.fields['Traffic This Month'] ?? 0),
            conversionRateRaw: Number(r.fields['Conversion Rate'] ?? 0),
          }))
          .filter(r=>r.url)
          .sort((a,b)=> b.traffic - a.traffic)
          .slice(0,5);

        setTopPages(rows.map(p=>({
          ...p,
          conversionRate: p.conversionRateRaw >= 1 ? p.conversionRateRaw : p.conversionRateRaw * 100,
        })));
      }catch(err){console.error(err);} })();
  },[fields, clientId]);

  return (
    <SectionRegistryProvider>
      <div className="space-y-6">
        {/* KPI mini-strip – 3 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {kpiCards.map((c) => (
            <div
              key={c.label}
              className="p-5 rounded-lg bg-[#F5F5F9] border border-gray-200 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <p className="text-sm text-mediumGray whitespace-nowrap mb-1">{c.label}</p>
              <div className={`text-2xl font-extrabold tabular-nums ${c.colour}`}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Loom walkthrough */}
        <CollapsibleSection title="Quarterly Walkthrough" icon={<Video className="h-5 w-5 text-[#9EA8FB]" />}> 
          {fields['Quarterly Walkthrough (Loom Embed)'] ? (
            <div className="w-full aspect-w-16 aspect-h-9" dangerouslySetInnerHTML={{ __html: fields['Quarterly Walkthrough (Loom Embed)'] as string }} />
          ) : (
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4">
              <Video className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2 text-center">No Loom video provided for this quarter</p>
            </div>
          )}
        </CollapsibleSection>

        {/* Executive Summary (TL;DR + narrative) */}
        <CollapsibleSection title="Executive Summary" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />}>
          <h5 className="text-base font-medium text-dark mb-2">Executive Summary</h5>
          {renderRichText(fields['Executive Summary'] ?? Object.values(fields)[Object.keys(fields).findIndex(k=>k.startsWith('Executive Summary'))] as string)}
          <div className="mb-4" />

          {/* Trendline Chart */}
          <h5 className="text-base font-medium text-dark mb-4">Quarterly Trendline</h5>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendlineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#9EA8FB" name="Clicks" />
                <Line type="monotone" dataKey="leads" stroke="#FCDC94" name="Leads" />
                <Line type="monotone" dataKey="revenue" stroke="#EADCFF" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Auto-generated bullets of other sections */}
          <div className="mt-6">
            <ExecutiveSummary />
          </div>
        </CollapsibleSection>

        {/* Traffic & Revenue Comparison */}
        <CollapsibleSection title="Traffic & Revenue" icon={<BarChart2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prev Quarter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">This Quarter</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => setTrDesc(d=>!d)}
                >
                  QoQ Growth {trDesc ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTrafficRows.map((r) => (
                <tr key={r.metric} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.metric}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.prev !== undefined ? r.prev.toLocaleString() : 'NA'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.current.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${r.growthPct === undefined ? 'text-gray-500' : (r.growthPct > 0 ? 'text-green-600' : 'text-red-600')}`}>{fmtPct(r.growthPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        {/* Deliverables Roll-up */}
        <CollapsibleSection title="Deliverables Roll Up" icon={<FolderOpen className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          {Object.keys(deliverablesByCategory).length === 0 && (
            <p className="text-sm text-mediumGray">No deliverable updates for this quarter.</p>
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
                  {(rows as any[]).map((row: any, idx: number) => (
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

        {/* Top Performing Pages */}
        <CollapsibleSection title="Top Performing Pages" icon={<Link2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((r, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.traffic.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.conversionRate !== undefined ? `${r.conversionRate.toFixed(1)}%` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        {/* Experiments */}
        <CollapsibleSection title="Experiments" icon={<FileText className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {experiments.map((ex, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:shadow">
                <h6 className="text-base font-bold text-dark mb-2">{ex.name}</h6>
                <div className="prose max-w-none text-sm text-mediumGray" dangerouslySetInnerHTML={{ __html: ex.notes ?? '' }} />
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Next Quarter Roadmap */}
        <CollapsibleSection title="Next Quarter Roadmap" icon={<TrendingUp className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <h5 className="text-base font-medium text-dark mb-3">Where we are now</h5>
          {renderRichText(fields['Where We Are Now (Next Quarter Strategy)'] ?? fields['Focus Areas (Next Quarter Strategy)'])}

          <h5 className="text-base font-medium text-dark mb-3">Where we're heading next</h5>
          {renderRichText(fields["Where We're Heading Next (Next Quarter Strategy)"] ?? fields['Key Performance Targets (Next Quarter Strategy)'])}
        </CollapsibleSection>

        {/* Competitor Intel */}
        <CollapsibleSection title="Competitor Intel" icon={<Info className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword Focus</th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => setCompDesc(d => !d)}
                >
                  Rank Change (QoQ) {compDesc ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notable Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Screenshot</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCompetitors.map((row) => (
                <tr key={row.competitor} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.competitor}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.keywordFocus}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${row.rankChange > 0 ? 'text-green-600' : 'text-red-600'}`}>{fmtPct(row.rankChange)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.activity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">{row.screenshot ? <a href={row.screenshot} target="_blank" rel="noopener noreferrer">View</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {fields['Key Takeaways (Competitor Intel)'] && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h6 className="text-base font-medium text-dark mb-2">Key Takeaways</h6>
              {renderRichText(fields['Key Takeaways (Competitor Intel)'] as string)}
            </div>
          )}
        </CollapsibleSection>

        {/* Risks & Tradeoffs */}
        <CollapsibleSection title="Risks and Tradeoffs" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          {renderRichText(fields['Risks and Tradeoffs'] as string)}
        </CollapsibleSection>
      </div>
    </SectionRegistryProvider>
  );
} 