import React, { useState, useMemo } from 'react';
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

/* ------------------------------------------------------------------ */
/*  Placeholder datasets – replace with live quarterly data later      */
/* ------------------------------------------------------------------ */
const kpiCards = [
  { label: 'Traffic Growth (QoQ)', value: '+18.4%', colour: 'text-green-600' },
  { label: 'Lead Growth (QoQ)', value: '+12.7%', colour: 'text-green-600' },
  { label: 'Revenue Impact', value: '$124k', colour: 'text-primary' },
];

const trendlineData = [
  { quarter: 'Q2-24', sessions: 42000, leads: 720, revenue: 110000 },
  { quarter: 'Q3-24', sessions: 46500, leads: 810, revenue: 128000 },
  { quarter: 'Q4-24', sessions: 49700, leads: 880, revenue: 139000 },
  { quarter: 'Q1-25', sessions: 54400, leads: 990, revenue: 162000 },
];

type TrafficRow = { metric: string; qoq: string; yoy: string };
const trafficRevenueRows: TrafficRow[] = [
  { metric: 'Sessions', qoq: '+9.5%', yoy: '+22.1%' },
  { metric: 'Leads', qoq: '+8.9%', yoy: '+19.4%' },
  { metric: 'Revenue', qoq: '+11.6%', yoy: '+27.8%' },
];

const deliverableBullets = [
  '28 new briefs delivered',
  '19 articles published (avg 1,450 words)',
  '52 backlinks secured (avg DR 62)',
];

const topPages = [
  { url: '/product/alpha', traffic: 8700, conversions: 218 },
  { url: '/blog/seo-2025-guide', traffic: 6600, conversions: 154 },
  { url: '/solutions/enterprise', traffic: 5900, conversions: 139 },
];

const experiments = [
  { icon: <FlaskConical className="h-6 w-6 text-primary" />, insight: 'Title-tag tests → CTR +1.7 pts' },
  { icon: <FlaskConical className="h-6 w-6 text-primary" />, insight: 'FAQ schema → Rich-snippets on 34 URLs' },
  { icon: <FlaskConical className="h-6 w-6 text-primary" />, insight: 'Internal-link audit → Avg depth −0.4 clicks' },
  { icon: <FlaskConical className="h-6 w-6 text-primary" />, insight: 'Pricing page revamp → CVR +0.6 pts' },
];

type CompetitorRow = { competitor: string; keywordFocus: string; rankChange: string; activity: string; screenshot?: string };
const competitorRows: CompetitorRow[] = [
  { competitor: 'Competitor A', keywordFocus: 'Alternatives', rankChange: '+4', activity: 'Launched comparison pages' },
  { competitor: 'Competitor B', keywordFocus: 'Pricing', rankChange: '−2', activity: 'Paused blog updates' },
  { competitor: 'Competitor C', keywordFocus: 'Templates', rankChange: '+1', activity: 'Added AI-demo feature' },
];

const risks = [
  'Google algorithm volatility may impact featured-snippet traffic',
  'Aggressive link-building could trigger manual review',
  'Resource allocation to CRO might slow content velocity',
];

export default function QuarterlyReportV2() {
  /* -------------------------------------------------------------- */
  /* Sorting state – Traffic & Revenue table                         */
  /* -------------------------------------------------------------- */
  const [trSortBy, setTrSortBy] = useState<'qoq' | 'yoy' | null>(null);
  const [trDesc, setTrDesc] = useState(true);

  const sortedTrafficRows = useMemo(() => {
    if (!trSortBy) return trafficRevenueRows;
    return [...trafficRevenueRows].sort((a, b) => {
      const valA = parseFloat(a[trSortBy].replace('%', '').replace('−', '-'));
      const valB = parseFloat(b[trSortBy].replace('%', '').replace('−', '-'));
      return trDesc ? valB - valA : valA - valB;
    });
  }, [trSortBy, trDesc]);

  /* -------------------------------------------------------------- */
  /* Sorting state – Competitor Intel table                         */
  /* -------------------------------------------------------------- */
  const [compDesc, setCompDesc] = useState(true);

  const sortedCompetitors = useMemo(() => {
    return [...competitorRows].sort((a, b) => {
      const valA = parseInt(a.rankChange.replace('−', '-'));
      const valB = parseInt(b.rankChange.replace('−', '-'));
      return compDesc ? valB - valA : valA - valB;
    });
  }, [compDesc]);

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
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4">
            <Video className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-2 text-center">Embed a Loom video walkthrough of this quarter's performance</p>
            {/* Placeholder iframe for Loom – replace href later */}
            <iframe
              src="https://www.loom.com/embed/placeholder"
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          </div>
        </CollapsibleSection>

        {/* Executive Summary (TL;DR + narrative) */}
        <CollapsibleSection title="Executive Summary" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />}>
          <h5 className="text-base font-medium text-dark mb-2">TL;DR</h5>
          <p className="text-base text-mediumGray mb-4">
            Strong quarter across all KPIs – traffic, leads & revenue hit record highs, driven by evergreen content expansion and technical wins.
          </p>

          {/* Trendline Chart */}
          <h5 className="text-base font-medium text-dark mb-2">Quarterly Trendline</h5>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendlineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="#9EA8FB" name="Sessions" />
                <Line type="monotone" dataKey="leads" stroke="#FCDC94" name="Leads" />
                <Line type="monotone" dataKey="revenue" stroke="#EADCFF" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Narrative summary */}
          <h5 className="text-base font-medium text-dark mb-2">Narrative Summary</h5>
          <p className="text-base text-mediumGray leading-relaxed">
            Content velocity, combined with backlink quality improvements, fueled compound gains in rankings and conversions. Technical SEO efforts reduced CLS by 43%, supporting stronger organic visibility.
          </p>

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
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setTrSortBy('qoq');
                    setTrDesc(sort => (trSortBy === 'qoq' ? !sort : true));
                  }}
                >
                  QoQ {trSortBy === 'qoq' && (trDesc ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />)}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => {
                    setTrSortBy('yoy');
                    setTrDesc(sort => (trSortBy === 'yoy' ? !sort : true));
                  }}
                >
                  YoY {trSortBy === 'yoy' && (trDesc ? <ChevronDown className="inline h-3 w-3" /> : <ChevronUp className="inline h-3 w-3" />)}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedTrafficRows.map((r) => (
                <tr key={r.metric} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.metric}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${r.qoq.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{r.qoq} {r.qoq.startsWith('+') ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${r.yoy.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{r.yoy} {r.yoy.startsWith('+') ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        {/* Deliverables Roll-up */}
        <CollapsibleSection title="Deliverables Roll Up" icon={<FolderOpen className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <ul className="list-disc pl-6 space-y-2 text-base text-mediumGray">
            {deliverableBullets.map((b, idx) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>
        </CollapsibleSection>

        {/* Top Performing Pages */}
        <CollapsibleSection title="Top Performing Pages" icon={<Link2 className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((row) => (
                <tr key={row.url} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline"><a href={row.url} target="_blank" rel="noopener noreferrer">{row.url}</a></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.traffic.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.conversions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>

        {/* Experiments */}
        <CollapsibleSection title="Experiments" icon={<FileText className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {experiments.map((ex, idx) => (
              <div key={idx} className="flex flex-col items-center p-4 bg-gray-50 rounded-lg text-center hover:shadow">
                {ex.icon}
                <p className="text-sm text-mediumGray mt-3">{ex.insight}</p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {/* Next Quarter Roadmap */}
        <CollapsibleSection title="Next Quarter Roadmap" icon={<TrendingUp className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <h5 className="text-base font-medium text-dark mb-1">Where we are now</h5>
          <p className="text-base text-mediumGray mb-4">Solid technical foundation with improving Core Web Vitals; established content engine delivering ~20k words/mo.</p>

          <h5 className="text-base font-medium text-dark mb-1">Where we're heading next</h5>
          <ul className="list-disc pl-6 space-y-2 text-base text-mediumGray">
            <li>Launch programmatic SEO hub for feature-level terms</li>
            <li>Scale DR-70+ backlink outreach to 40/mo</li>
            <li>Iterate on pricing page CRO tests</li>
            <li>Implement server-side render for Next.js app to boost Largest Contentful Paint</li>
          </ul>
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
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${row.rankChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>{row.rankChange}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.activity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 underline">{row.screenshot ? <a href={row.screenshot} target="_blank" rel="noopener noreferrer">View</a> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h6 className="text-base font-medium text-dark mb-2">Key Takeaways</h6>
            <p className="text-base text-mediumGray leading-relaxed">Opportunity to outrank Competitor B on pricing-related queries as they have slowed new content releases. Consider targeted pillar-page build-out.</p>
          </div>
        </CollapsibleSection>

        {/* Risks & Tradeoffs */}
        <CollapsibleSection title="Risks and Tradeoffs" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          <ul className="list-disc pl-6 space-y-2 text-base text-mediumGray">
            {risks.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </CollapsibleSection>
      </div>
    </SectionRegistryProvider>
  );
} 