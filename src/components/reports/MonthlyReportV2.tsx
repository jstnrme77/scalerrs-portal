import React from 'react';
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
  ArrowUpRight,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import KPIStrip from '@/components/reports/KPIStrip';
import { CollapsibleSection, ExecutiveSummary } from '@/components/reports/CollapsibleSection';
import { SectionRegistryProvider } from '@/components/reports/SectionRegistryContext';

/* ------------------------------------------------------------------ */
/*  Static placeholder data – replace with live queries later          */
/* ------------------------------------------------------------------ */
const kpiData = {
  traffic           : 17000,
  trafficChangePct  : 9.8,
  leads             : 410,
  leadsChangePct    : 15.6,
  roiPct            : 257,
  roiChangePct      : 4.2,
  cpc               : 124,
  cpcChangePct      : -3.1,
};

/* Charts */
const COLORS = ['#9ea8fb', '#fcdc94', '#eadcff', '#ff9d7d', '#e5e7eb'];

const monthlyPerformanceData = [
  { month: 'Jan', clicks: 12000, leads: 280, revenue: 18000 },
  { month: 'Feb', clicks: 13500, leads: 310, revenue: 21000 },
  { month: 'Mar', clicks: 15000, leads: 350, revenue: 24500 },
  { month: 'Apr', clicks: 17000, leads: 410, revenue: 28000 },
];

const keywordBucketData = [
  { name: 'Top 3',  keywords: 22 },
  { name: '4-10',   keywords: 45 },
  { name: '11-20',  keywords: 67 },
  { name: '20+',    keywords: 89 },
];

const leadSourceData = [
  { name: 'Organic Search', value: 65 },
  { name: 'Direct', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Social', value: 8 },
  { name: 'Other', value: 2 },
];

const competitorRows = [
  { name: 'Competitor A', notes: 'Launched new service pages', link: 'https://example.com/screenshot1' },
  { name: 'Competitor B', notes: 'Aggressive backlink campaign', link: 'https://example.com/screenshot2' },
  { name: 'Competitor C', notes: 'Redesigned blog section',      link: 'https://example.com/screenshot3' },
];

const deliverableRows = [
  { category: 'Content',    item: '5 new briefs created',    status: 'Completed' },
  { category: 'Content',    item: '3 articles published',    status: 'Completed' },
  { category: 'Backlinks',  item: '12 backlinks secured',     status: 'In Progress' },
  { category: 'Backlinks',  item: 'Outreach to 20 domains',   status: 'In Progress' },
];

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

export default function MonthlyReportV2() {
  return (
    <SectionRegistryProvider>
      <div className="space-y-6">
        {/* Quick Links removed here – moved below Monthly Walkthrough */}

        {/* KPI Strip (not collapsible) */}
        <KPIStrip
          traffic={kpiData.traffic}
          leads={kpiData.leads}
          roiPct={kpiData.roiPct}
          cpc={kpiData.cpc}
          showROI={true}
        />

        {/* Executive Summary + TLDR */}
        <CollapsibleSection title="Executive Summary" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />}>
          <h5 className="text-base font-medium text-dark mb-2">TL;DR</h5>
          <p className="text-base text-mediumGray mb-4">
            Traffic, leads and revenue all trended up in April. Key drivers were pillar-content expansion and Core Web Vitals fixes. Our focus next month shifts to structured data and DR-60+ backlinks.
          </p>

          <h5 className="text-base font-medium text-dark mb-2">Executive Summary</h5>
          <ExecutiveSummary />
        </CollapsibleSection>

        {/* Monthly Walkthrough */}
        <CollapsibleSection title="Monthly Walkthrough" icon={<Video className="h-5 w-5 text-[#9EA8FB]" />}>
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4">
            <Video className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-3 text-center">Embed a Loom video walkthrough of this month's performance</p>
          </div>
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
          <h5 className="text-base font-medium text-dark mb-3">Progress vs. Goals</h5>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-dark">Traffic Goal</span>
                <span className="text-sm font-medium text-dark">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-[#9EA8FB] h-3 rounded-full" style={{ width: '65%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-dark">Clicks Goal</span>
                <span className="text-sm font-medium text-dark">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-[#9EA8FB] h-3 rounded-full" style={{ width: '50%' }}></div></div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-dark">Revenue</span>
                <span className="text-sm font-medium text-dark">42%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-[#EADCFF] h-3 rounded-full" style={{ width: '42%' }}></div></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Wins */}
        <CollapsibleSection title="Wins" icon={<ThumbsUp className="h-5 w-5 text-green-600" />} defaultOpen={false}>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5 mr-3"><ArrowUpRight className="h-3 w-3 text-green-600" /></div>
              <div><h6 className="text-base font-medium text-dark">Significant traffic growth to key product pages</h6><p className="text-sm text-gray-600 mt-1">+32% MoM increase in traffic to product category pages, driving 24% more conversions</p></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Cautions */}
        <CollapsibleSection title="Cautions & Areas to Watch" icon={<AlertTriangle className="h-5 w-5 text-amber-600" />} defaultOpen={false}>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-lg flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 mt-0.5 mr-3"><AlertTriangle className="h-3 w-3 text-amber-600" /></div>
              <div><h6 className="text-base font-medium text-dark">Competitor activity increasing in primary market</h6><p className="text-sm text-gray-600 mt-1">Competitor A has launched an aggressive content campaign targeting our top keywords</p></div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Content Movers */}
        <CollapsibleSection title="Content Movers" icon={<TrendingUp className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <div className="overflow-x-auto mb-6">
            {/* Table */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Pos.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50"><td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">/blog/seo-guide-2025</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1</td><td className="px-6 py-4 whitespace-nowrap">+1</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">4500</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">28%</td><td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">$1,260</td></tr>
              </tbody>
            </table>
          </div>
          {/* Key takeaways full width */}
          <div className="bg-gray-50 p-5 rounded-lg"><h5 className="text-base font-medium text-dark mb-3">Key Takeaways</h5><p className="text-base text-mediumGray leading-relaxed">Opportunity to outrank Competitor B on Local SEO keywords where they've lost positions. Competitor A is gaining ground in Technical SEO - we should accelerate our content production in this area to maintain our advantage.</p></div>
        </CollapsibleSection>

        {/* Next Month Roadmap */}
        <CollapsibleSection title="Next Month's Roadmap" icon={<MessageSquare className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <p className="text-base text-mediumGray mb-2">Strong foundation with improved technical performance, growing organic visibility, and established content production pipeline. Key conversion points optimized with clear user journeys.</p>
          <ul className="list-disc pl-6 text-base text-mediumGray space-y-2">
            <li>Expand content clusters around highest-converting topics</li>
            <li>Implement advanced schema markup across key templates</li>
            <li>Launch targeted link-building campaign for product pages</li>
            <li>Develop mobile-first conversion optimization strategy</li>
          </ul>
        </CollapsibleSection>

        {/* Risks & Tradeoffs */}
        <CollapsibleSection title="Risks and Tradeoffs" icon={<AlertTriangle className="h-5 w-5 text-[#9EA8FB]" />} defaultOpen={false}>
          <ul className="list-disc pl-6 text-base text-mediumGray space-y-3">
            <li><span className="font-medium text-dark">Resource allocation:</span> Focusing on mobile optimization may slow content production temporarily</li>
            <li><span className="font-medium text-dark">Algorithm updates:</span> Google updates may favor UX metrics over keyword targeting</li>
          </ul>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliverableRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.item}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CollapsibleSection>
      </div>
    </SectionRegistryProvider>
  );
} 