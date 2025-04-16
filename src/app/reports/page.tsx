'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronDown } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample report data
const reports = {
  weekly: [
    { id: 1, title: 'Weekly SEO Update - Apr 1, 2025', date: '2025-04-01', type: 'weekly' },
    { id: 2, title: 'Weekly SEO Update - Mar 25, 2025', date: '2025-03-25', type: 'weekly' },
    { id: 3, title: 'Weekly SEO Update - Mar 18, 2025', date: '2025-03-18', type: 'weekly' },
    { id: 4, title: 'Weekly SEO Update - Mar 11, 2025', date: '2025-03-11', type: 'weekly' },
  ],
  monthly: [
    { id: 5, title: 'March 2025 SEO Performance Report', date: '2025-04-01', type: 'monthly' },
    { id: 6, title: 'February 2025 SEO Performance Report', date: '2025-03-01', type: 'monthly' },
    { id: 7, title: 'January 2025 SEO Performance Report', date: '2025-02-01', type: 'monthly' },
  ],
  quarterly: [
    { id: 8, title: 'Q1 2025 SEO Strategy & Performance Review', date: '2025-04-01', type: 'quarterly' },
    { id: 9, title: 'Q4 2024 SEO Strategy & Performance Review', date: '2025-01-01', type: 'quarterly' },
  ]
};

// Sample report content for demonstration
const sampleReportContent = {
  weekly: (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-dark">Weekly SEO Update - Apr 1, 2025</h3>

      <div className="space-y-2">
        <h4 className="font-medium text-dark">Key Metrics This Week</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Organic Traffic: 11,245 users (+5% week-over-week)</li>
          <li>Keyword Rankings: 324 keywords in top 10 (+12 new keywords)</li>
          <li>Conversion Rate: 2.8% (+0.2% week-over-week)</li>
          <li>Leads Generated: 78 (+8% week-over-week)</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-dark">Content Updates</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Published 3 new blog posts targeting high-intent keywords</li>
          <li>Updated 2 existing pages with fresh content and improved CTAs</li>
          <li>Created 5 new content briefs for upcoming articles</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-dark">Link Building Progress</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Secured 4 new backlinks from DA 40+ websites</li>
          <li>Initiated outreach to 15 potential link partners</li>
          <li>Completed 3 guest post drafts for submission</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-dark">Technical SEO Updates</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Fixed 12 broken internal links</li>
          <li>Improved page load speed on 5 key landing pages</li>
          <li>Implemented schema markup on product pages</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-dark">Next Week's Focus</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Complete technical SEO audit for the new product section</li>
          <li>Publish 2 new case studies targeting competitive keywords</li>
          <li>Finalize content calendar for Q2 2025</li>
        </ul>
      </div>
    </div>
  ),
  monthly: (
    <div className="space-y-6">
      <div className="bg-lightGray p-4 rounded-scalerrs">
        <h3 className="text-lg font-medium text-dark mb-2">March 2025 SEO Performance Report</h3>
        <p className="text-mediumGray">Monthly comprehensive analysis of your SEO campaign performance, achievements, and strategic recommendations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Organic Traffic</h4>
          <p className="text-3xl font-bold text-primary">45.5K</p>
          <p className="text-sm text-green-600">+12.3% vs. February</p>
        </div>

        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Keyword Rankings</h4>
          <p className="text-3xl font-bold text-gold">324</p>
          <p className="text-sm text-green-600">+28 new keywords in top 10</p>
        </div>

        <div className="bg-white p-4 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-2">Leads Generated</h4>
          <p className="text-3xl font-bold text-lavender">320</p>
          <p className="text-sm text-green-600">+15.2% vs. February</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-dark">Monthly Highlights</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Successfully launched new product category pages with optimized content</li>
          <li>Achieved first page rankings for 12 high-value keywords</li>
          <li>Improved site-wide page load speed by 22%</li>
          <li>Secured 15 high-quality backlinks from industry publications</li>
          <li>Published 12 new blog posts targeting strategic keywords</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-dark">Areas for Improvement</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Mobile conversion rate still lags behind desktop by 1.2%</li>
          <li>Bounce rate on product comparison pages remains high at 65%</li>
          <li>Need to improve internal linking structure for deeper pages</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-dark">Next Month's Strategy</h4>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Focus on mobile UX improvements to increase conversion rate</li>
          <li>Implement A/B testing on high-bounce product comparison pages</li>
          <li>Develop comprehensive internal linking strategy</li>
          <li>Expand content creation for middle-of-funnel keywords</li>
          <li>Increase link building efforts targeting competitor backlink gaps</li>
        </ul>
      </div>

      <div className="bg-primary/10 p-4 rounded-scalerrs">
        <h4 className="font-medium text-dark mb-2">Strategic Recommendations</h4>
        <p className="text-mediumGray">Based on our analysis, we recommend allocating additional resources to mobile UX optimization and middle-of-funnel content creation to capitalize on the growing traffic and improve conversion rates.</p>
      </div>
    </div>
  ),
  quarterly: (
    <div className="space-y-6">
      <div className="bg-primary/20 p-6 rounded-scalerrs-lg">
        <h3 className="text-xl font-bold text-dark mb-2">Q1 2025 SEO Strategy & Performance Review</h3>
        <p className="text-mediumGray">Comprehensive quarterly analysis of your SEO campaign performance, strategic achievements, and recommendations for Q2 2025.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-3">Q1 Performance Summary</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Organic Traffic</span>
                <span className="text-sm font-medium text-dark">45.5K (+32.4% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Keyword Rankings</span>
                <span className="text-sm font-medium text-dark">324 (+86 QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-gold h-1.5 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Conversion Rate</span>
                <span className="text-sm font-medium text-dark">2.8% (+0.6% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-lavender h-1.5 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Leads Generated</span>
                <span className="text-sm font-medium text-dark">950 (+42.3% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-mediumGray">Revenue Impact</span>
                <span className="text-sm font-medium text-dark">$125K (+38.2% QoQ)</span>
              </div>
              <div className="w-full bg-lightGray rounded-full h-1.5">
                <div className="bg-gold h-1.5 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
          <h4 className="font-medium text-dark mb-3">Q1 Strategic Achievements</h4>
          <ul className="list-disc pl-5 text-mediumGray space-y-2">
            <li>Completed full technical SEO audit and implemented 85% of recommendations</li>
            <li>Launched new content hub targeting high-value industry topics</li>
            <li>Secured 45 high-quality backlinks from industry publications</li>
            <li>Improved site-wide page load speed by 35%</li>
            <li>Implemented structured data across all product and service pages</li>
            <li>Developed comprehensive competitor gap analysis</li>
            <li>Optimized conversion funnels resulting in 0.6% CR improvement</li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Competitive Analysis</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-lightGray">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Competitor</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Traffic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Keywords</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Backlinks</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Content</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-lightGray">
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Your Company</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">45.5K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">324</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">1,245</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">86 pages</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Competitor A</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">62.3K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">412</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">2,156</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">124 pages</td>
              </tr>
              <tr>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">Competitor B</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">38.7K</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">286</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">985</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">72 pages</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white p-5 rounded-scalerrs border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Q2 2025 Strategic Recommendations</h4>
        <div className="space-y-4">
          <div className="p-3 bg-primary/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Content Gap Opportunity</h5>
            <p className="text-sm text-mediumGray">Develop 15 new in-depth guides targeting competitor content gaps in the middle and bottom of the funnel.</p>
          </div>

          <div className="p-3 bg-gold/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Technical SEO Enhancement</h5>
            <p className="text-sm text-mediumGray">Implement advanced schema markup and improve Core Web Vitals scores across all key landing pages.</p>
          </div>

          <div className="p-3 bg-lavender/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Conversion Rate Optimization</h5>
            <p className="text-sm text-mediumGray">Conduct comprehensive A/B testing on top landing pages to improve conversion rates by at least 0.5%.</p>
          </div>

          <div className="p-3 bg-primary/10 rounded-scalerrs">
            <h5 className="font-medium text-dark mb-1">Link Building Strategy</h5>
            <p className="text-sm text-mediumGray">Focus on acquiring 50+ high-quality backlinks from industry publications and partner websites.</p>
          </div>
        </div>
      </div>

      <div className="bg-primary/20 p-5 rounded-scalerrs">
        <h4 className="font-medium text-dark mb-2">Additional Service Recommendations</h4>
        <p className="text-mediumGray mb-3">Based on our analysis, we recommend the following additional services to accelerate your growth:</p>
        <ul className="list-disc pl-5 text-mediumGray">
          <li>Conversion Rate Optimization (CRO) package to improve lead generation</li>
          <li>Expanded content creation to target competitive keywords</li>
          <li>Advanced competitor analysis and monitoring</li>
        </ul>
      </div>
    </div>
  )
};

// Report Card Component
function ReportCard({ report, onClick }: { report: any; onClick: () => void }) {
  return (
    <div
      className="bg-white p-4 rounded-scalerrs border border-lightGray hover:border-primary cursor-pointer transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-md font-medium text-dark">{report.title}</h3>
          <p className="text-sm text-mediumGray">{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          report.type === 'weekly' ? 'bg-primary/10 text-primary' :
          report.type === 'monthly' ? 'bg-gold/10 text-gold' :
          'bg-lavender/10 text-lavender'
        }`}>
          {report.type === 'weekly' ? 'Weekly' : report.type === 'monthly' ? 'Monthly' : 'Quarterly'}
        </span>
      </div>
    </div>
  );
}

// Sample chart data
const trafficData = [
  { name: 'Jan', organic: 4000, paid: 2400 },
  { name: 'Feb', organic: 5000, paid: 2200 },
  { name: 'Mar', organic: 6000, paid: 2600 },
  { name: 'Apr', organic: 8000, paid: 2900 },
  { name: 'May', organic: 9500, paid: 3100 },
  { name: 'Jun', organic: 11000, paid: 3300 },
];

const conversionData = [
  { name: 'Jan', rate: 1.8 },
  { name: 'Feb', rate: 2.1 },
  { name: 'Mar', rate: 2.3 },
  { name: 'Apr', rate: 2.6 },
  { name: 'May', rate: 2.9 },
  { name: 'Jun', rate: 3.2 },
];

const keywordData = [
  { name: 'Top 3', value: 45 },
  { name: '4-10', value: 75 },
  { name: '11-20', value: 120 },
  { name: '21-50', value: 180 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const weeklyDeliverableData = [
  { name: 'Week 1', briefs: 4, backlinks: 2 },
  { name: 'Week 2', briefs: 3, backlinks: 3 },
  { name: 'Week 3', briefs: 5, backlinks: 1 },
  { name: 'Week 4', briefs: 2, backlinks: 4 },
];

// Date selection options
const dateOptions = {
  weekly: [
    { value: 'april-2024-w1', label: 'April 1-7, 2024' },
    { value: 'april-2024-w2', label: 'April 8-14, 2024' },
    { value: 'april-2024-w3', label: 'April 15-21, 2024' },
    { value: 'april-2024-w4', label: 'April 22-28, 2024' },
  ],
  monthly: [
    { value: 'april-2024', label: 'April 2024' },
    { value: 'march-2024', label: 'March 2024' },
    { value: 'february-2024', label: 'February 2024' },
    { value: 'january-2024', label: 'January 2024' },
  ],
  quarterly: [
    { value: 'q2-2024', label: 'Q2 2024 (Apr-Jun)' },
    { value: 'q1-2024', label: 'Q1 2024 (Jan-Mar)' },
    { value: 'q4-2023', label: 'Q4 2023 (Oct-Dec)' },
    { value: 'q3-2023', label: 'Q3 2023 (Jul-Sep)' },
  ],
  kpi: [
    { value: 'monthly', label: 'Monthly View' },
    { value: 'quarterly', label: 'Quarterly View' },
    { value: 'yearly', label: 'Yearly View' },
  ]
};

// Sample KPI data
const kpiData = {
  summary: {
    currentProgress: 68, // percentage of Q2 goal
    annualProjection: 83, // percentage of annual target
    status: 'warning', // 'success', 'warning', or 'danger'
    kpiCards: [
      {
        title: 'Organic Clicks',
        current: 12543,
        target: 15000,
        delta: 16.4,
        trend: 'up',
        color: 'blue'
      },
      {
        title: 'Conversion Rate',
        current: 3.2,
        target: 4.0,
        delta: 20,
        trend: 'up',
        color: 'green',
        unit: '%'
      },
      {
        title: 'Estimated Leads',
        current: 401,
        target: 600,
        delta: 33.2,
        trend: 'up',
        color: 'purple'
      },
      {
        title: 'SQLs',
        current: 87,
        target: 120,
        delta: 27.5,
        trend: 'up',
        color: 'amber'
      },
      {
        title: 'Revenue Impact',
        current: 24800,
        target: 30000,
        delta: 17.3,
        trend: 'up',
        color: 'green',
        unit: '$'
      },
      {
        title: 'Traffic Growth YoY',
        current: 42,
        target: 50,
        delta: 16,
        trend: 'up',
        color: 'blue',
        unit: '%'
      },
      {
        title: 'MoM Performance',
        current: 8.5,
        target: 10,
        delta: 15,
        trend: 'up',
        color: 'blue',
        unit: '%'
      }
    ]
  },
  forecasting: {
    currentResources: {
      projectedTraffic: 14500,
      projectedLeads: 464,
      targetPercentage: 65,
      deliverables: {
        briefs: 8,
        backlinks: 12,
        techFixes: 15
      },
      timeline: 'September 2024'
    },
    agreedTargets: {
      targetTraffic: 22000,
      targetLeads: 704,
      endDate: 'End of Q3',
      gap: {
        percentage: 35,
        shortfall: 7500
      },
      requiredAdjustments: {
        content: 4, // additional briefs per month
        backlinks: 6, // additional backlinks per month
        conversionRate: { current: 1.7, required: 2.1 },
        timeline: 2 // additional months
      }
    }
  },
  pageTypeBreakdown: {
    enabled: true,
    overview: {
      blog: {
        clicks: 8750,
        conversionRate: 2.1,
        leads: 184
      },
      feature: {
        clicks: 2340,
        engagementRate: 68,
        assistedConversions: 95
      },
      solution: {
        traffic: 1450,
        conversionRate: 3.8,
        timeOnPage: '4:32'
      },
      highIntent: {
        traffic: 980,
        conversionRate: 5.2,
        leads: 51
      }
    },
    funnelStages: [
      { stage: 'ToFU', pages: 12, traffic: 6800, conversionRate: 1.8, leads: 122 },
      { stage: 'MoFU', pages: 9, traffic: 4900, conversionRate: 2.6, leads: 127 },
      { stage: 'BoFU', pages: 5, traffic: 2100, conversionRate: 4.1, leads: 86 }
    ],
    performers: {
      top: [
        { url: '/blog/seo-strategy-2024', metric: 'Traffic', value: 1250, change: 15, tag: 'Top Performer' },
        { url: '/features/analytics', metric: 'Conversions', value: 45, change: 28, tag: 'Top Performer' },
        { url: '/solutions/enterprise', metric: 'Time on Page', value: '6:12', change: 22, tag: 'Top Performer' }
      ],
      bottom: [
        { url: '/blog/seo-basics', metric: 'Traffic', value: 320, change: -12, tag: 'Needs Refresh' },
        { url: '/features/reporting', metric: 'Conversions', value: 8, change: -18, tag: 'Under Review' },
        { url: '/solutions/smb', metric: 'Time on Page', value: '1:45', change: -25, tag: 'Needs Refresh' }
      ]
    },
    bottlenecks: [
      'Blog content is driving traffic but has below-average conversion rates',
      'Feature pages have good engagement but aren't generating enough clicks',
      'BoFU content is performing well but has limited traffic volume'
    ]
  }
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dateOptions.weekly[0]);
  const [activeKpiTab, setActiveKpiTab] = useState('summary'); // 'summary', 'forecasting', or 'breakdown'

  const handleReportClick = (type: string) => {
    setSelectedReport(type);
  };

  const handleBackClick = () => {
    setSelectedReport(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Update selected date when changing tabs
    setSelectedDate(dateOptions[tab as keyof typeof dateOptions][0]);
    // Reset KPI tab when switching to KPI Dashboard
    if (tab === 'kpi') {
      setActiveKpiTab('summary');
    }
  };

  const handleDateSelect = (date: { value: string, label: string }) => {
    setSelectedDate(date);
    setDateOpen(false);
  };

  return (
    <DashboardLayout>
      {selectedReport ? (
        <div>
          <button
            onClick={handleBackClick}
            className="flex items-center text-primary mb-6 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Reports
          </button>

          <div className="bg-white p-6 rounded-scalerrs shadow-sm border border-lightGray">
            {sampleReportContent[selectedReport as keyof typeof sampleReportContent]}
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark">Reports</h1>
              <p className="text-mediumGray">Access your weekly, monthly, and quarterly SEO performance reports</p>
            </div>

            {/* Date Selection Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDateOpen(!dateOpen)}
                className="flex items-center justify-between w-48 px-4 py-2 bg-white border border-lightGray rounded-md shadow-sm text-sm font-medium text-dark hover:bg-gray-50 focus:outline-none"
              >
                {selectedDate.label}
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>

              {dateOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-lightGray rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {dateOptions[activeTab as keyof typeof dateOptions].map((date) => (
                      <button
                        key={date.value}
                        onClick={() => handleDateSelect(date)}
                        className={`block w-full text-left px-4 py-2 text-sm ${selectedDate.value === date.value ? 'bg-primary/10 text-primary' : 'text-dark hover:bg-gray-50'}`}
                      >
                        {date.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-scalerrs shadow-sm border border-lightGray mb-8">
            {/* Tab Navigation */}
            <div className="flex border-b border-lightGray">
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'weekly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => handleTabChange('weekly')}
              >
                Weekly
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'monthly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => handleTabChange('monthly')}
              >
                Monthly
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'quarterly' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => handleTabChange('quarterly')}
              >
                Quarterly
              </button>
              <button
                className={`px-6 py-3 text-sm font-medium ${activeTab === 'kpi' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                onClick={() => handleTabChange('kpi')}
              >
                KPI Dashboard
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'weekly' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Timeframe Covered */}
                  <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-lg font-medium text-dark mb-2">Timeframe Covered</h3>
                    <p className="text-mediumGray">{selectedDate.label}</p>
                  </div>

                  {/* What We Did */}
                  <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-lg font-medium text-dark mb-2">What We Did</h3>
                    <ul className="list-disc pl-5 text-mediumGray space-y-1">
                      <li>Briefed 4 product-led blog articles</li>
                      <li>Fixed Internal linking on 15 key commercial pages</li>
                      <li>Secured 2 new backlinks (DR 55, 62)</li>
                      <li>Re-structured cluster for "AI productivity tools"</li>
                    </ul>
                  </div>

                  {/* Deliverables Progress */}
                  <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-lg font-medium text-dark mb-2">Deliverables Progress</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-dark mb-1">Content Briefs</h4>
                        <ul className="list-disc pl-5 text-mediumGray">
                          <li>4 delivered, 1 in progress</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark mb-1">Backlinks</h4>
                        <ul className="list-disc pl-5 text-mediumGray">
                          <li>2 live this week</li>
                        </ul>
                      </div>
                      <div className="h-40 mt-3">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={weeklyDeliverableData}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="briefs" fill="#8884d8" name="Briefs" />
                            <Bar dataKey="backlinks" fill="#82ca9d" name="Backlinks" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* Next Steps + Requests */}
                  <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-lg font-medium text-dark mb-2">Next Steps + Requests</h3>
                    <ul className="list-disc pl-5 text-mediumGray space-y-1">
                      <li>Finish brief for "Enterprise AI Tools"</li>
                      <li>Begin internal linking from new blog posts to service pages</li>
                      <li>Review slow mobile pages flagged in last crawl</li>
                    </ul>
                  </div>

                  {/* Quick Links */}
                  <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm md:col-span-2">
                    <h3 className="text-lg font-medium text-dark mb-2">Links to Dashboards or Docs</h3>
                    <div className="space-y-2">
                      <a href="#" className="text-primary hover:underline block">Content Performance Dashboard</a>
                      <a href="#" className="text-primary hover:underline block">Technical Audit Report</a>
                      <a href="#" className="text-primary hover:underline block">GSC Dashboard</a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'monthly' && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-xl font-bold text-dark mb-3">Executive Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-medium text-dark mb-1">↑ 45%</h4>
                        <p className="text-sm text-mediumGray">YoY traffic up</p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-medium text-dark mb-1">↑ 32</h4>
                        <p className="text-sm text-mediumGray">Revenue up</p>
                      </div>
                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-medium text-dark mb-1">+$3K</h4>
                        <p className="text-sm text-mediumGray">Revenue up</p>
                      </div>
                    </div>
                    <p className="text-mediumGray">Overall campaign performance continues to exceed expectations with significant growth in organic traffic and conversions.</p>
                  </div>

                  {/* Loom Walkthrough */}
                  <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-xl font-bold text-dark mb-3">Loom Walkthrough</h3>
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-mediumGray">Loom video placeholder</p>
                    </div>
                  </div>

                  {/* Channel Performance */}
                  <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-xl font-bold text-dark mb-3">Channel Performance</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-dark mb-2">Organic Traffic</h4>
                        <div className="aspect-video bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={trafficData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Area type="monotone" dataKey="organic" stackId="1" stroke="#8884d8" fill="#8884d8" name="Organic Traffic" />
                              <Area type="monotone" dataKey="paid" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Paid Traffic" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-dark mb-2">Conversions</h4>
                        <div className="aspect-video bg-white rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={conversionData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Legend />
                              <Line type="monotone" dataKey="rate" stroke="#8884d8" name="Conversion Rate" />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables Recap */}
                  <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                    <h3 className="text-xl font-bold text-dark mb-3">Deliverables Recap</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border border-lightGray rounded-lg p-4">
                        <h4 className="font-medium text-dark mb-2">New backlinks</h4>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-dark">8</span>
                          <div className="flex items-center text-green-500 text-sm">
                            <span>DR</span>
                            <span className="ml-1">76</span>
                            <span className="ml-1">↗</span>
                          </div>
                        </div>
                      </div>
                      <div className="border border-lightGray rounded-lg p-4">
                        <h4 className="font-medium text-dark mb-2">Hiking Tips</h4>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-dark">10</span>
                          <div className="flex items-center text-green-500 text-sm">
                            <span>↗</span>
                          </div>
                        </div>
                      </div>
                      <div className="border border-lightGray rounded-lg p-4">
                        <h4 className="font-medium text-dark mb-2">Packing List</h4>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-bold text-dark">66</span>
                          <div className="flex items-center text-green-500 text-sm">
                            <span>↗</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Movers & Keyword Trends */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                      <h3 className="text-xl font-bold text-dark mb-3">Content Movers</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-dark">Organic clicks</span>
                          <span className="text-sm text-mediumGray">↗</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-dark">Packing List</span>
                          <span className="text-sm text-green-500">+38%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-dark">Trail Running Guide</span>
                          <span className="text-sm text-green-500">+35%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                      <h3 className="text-xl font-bold text-dark mb-3">Keyword Trends</h3>
                      <div className="flex flex-col h-full">
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-dark">backpacking gear</span>
                            <span className="text-sm text-green-500">↑4</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-dark">trail running shoes</span>
                            <span className="text-sm text-green-500">↑1</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-dark">hiking checklist</span>
                            <span className="text-sm text-green-500">↑9</span>
                          </div>
                        </div>

                        <div className="border-t border-lightGray pt-4">
                          <h4 className="font-medium text-dark mb-3 text-center">Keyword Position Distribution</h4>
                          <div className="h-64 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={keywordData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {keywordData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value} keywords`} />
                                <Legend verticalAlign="bottom" height={36} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Wins & Cautions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                      <h3 className="text-xl font-bold text-dark mb-3">Wins & Cautions</h3>
                      <div className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <div className="flex items-start">
                            <span className="text-xl text-green-500 mr-2">🎯</span>
                            <div>
                              <h4 className="font-medium text-dark">Major improvement</h4>
                              <p className="text-sm text-mediumGray">Significant growth in organic traffic to product pages</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="flex items-start">
                            <span className="text-xl text-amber-500 mr-2">⚠️</span>
                            <div>
                              <h4 className="font-medium text-dark">Still need more links</h4>
                              <p className="text-sm text-mediumGray">Need more backlinks to product pages</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
                      <h3 className="text-xl font-bold text-dark mb-3">Recommendations</h3>
                      <div className="space-y-2">
                        <div className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <p className="text-mediumGray">Refresh 'day hikes' post</p>
                        </div>
                        <div className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <p className="text-mediumGray">Start link campaign for product pages</p>
                        </div>
                        <div className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <p className="text-mediumGray">Optimize mobile experience for checkout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quarterly' && (
                <div className="space-y-6">
                  {/* Quarterly Summary */}
                  <div className="bg-primary/20 p-6 rounded-lg">
                    <h3 className="text-xl font-bold text-dark mb-2">{selectedDate.label} Strategy & Performance Review</h3>
                    <p className="text-mediumGray">Comprehensive quarterly analysis of your SEO campaign performance, strategic achievements, and recommendations for the next quarter.</p>
                  </div>
                </div>
              )}

              {activeTab === 'kpi' && (
                <div className="space-y-6">
                  {/* Header Overview */}
                  <div className={`p-6 rounded-lg ${kpiData.summary.status === 'success' ? 'bg-green-100' : kpiData.summary.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <div className="flex items-start">
                      <div className="mr-4 mt-1">
                        {kpiData.summary.status === 'success' ? (
                          <span className="text-2xl">📈</span>
                        ) : kpiData.summary.status === 'warning' ? (
                          <span className="text-2xl">⚠️</span>
                        ) : (
                          <span className="text-2xl">🔻</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-dark mb-2">Performance Overview</h3>
                        <p className="text-mediumGray mb-1">You're currently hitting {kpiData.summary.currentProgress}% of your Q2 goal.</p>
                        <p className="text-mediumGray">Based on current output, you'll reach ~{kpiData.summary.annualProjection}% of the annual target.</p>
                      </div>
                    </div>
                  </div>

                  {/* KPI Dashboard Tabs */}
                  <div className="bg-white rounded-lg border border-lightGray">
                    <div className="flex border-b border-lightGray">
                      <button
                        className={`px-6 py-3 text-sm font-medium ${activeKpiTab === 'summary' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                        onClick={() => setActiveKpiTab('summary')}
                      >
                        KPI Summary
                      </button>
                      <button
                        className={`px-6 py-3 text-sm font-medium ${activeKpiTab === 'forecasting' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                        onClick={() => setActiveKpiTab('forecasting')}
                      >
                        Forecasting Model
                      </button>
                      {kpiData.pageTypeBreakdown.enabled && (
                        <button
                          className={`px-6 py-3 text-sm font-medium ${activeKpiTab === 'breakdown' ? 'text-primary border-b-2 border-primary' : 'text-mediumGray hover:text-dark'}`}
                          onClick={() => setActiveKpiTab('breakdown')}
                        >
                          Breakdown by Page Type
                        </button>
                      )}
                    </div>

                    <div className="p-6">
                      {/* KPI Summary Tab */}
                      {activeKpiTab === 'summary' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {kpiData.summary.kpiCards.map((card, index) => (
                            <div key={index} className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-medium text-dark">{card.title}</h4>
                                <div className={`flex items-center text-xs ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                  {card.trend === 'up' ? (
                                    <span>↑ {card.delta}%</span>
                                  ) : (
                                    <span>↓ {card.delta}%</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-2xl font-bold text-dark mb-2">
                                {card.unit === '$' && '$'}{card.current.toLocaleString()}{card.unit === '%' && '%'}
                              </div>
                              <div className="flex items-center text-xs text-mediumGray mb-2">
                                <span className="mr-1">Target:</span>
                                <span>{card.unit === '$' && '$'}{card.target.toLocaleString()}{card.unit === '%' && '%'}</span>
                              </div>
                              <div className="w-full bg-lightGray rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${card.color === 'blue' ? 'bg-blue-500' : card.color === 'green' ? 'bg-green-500' : card.color === 'purple' ? 'bg-purple-500' : 'bg-amber-500'}`}
                                  style={{ width: `${(card.current / card.target) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Forecasting Model Tab */}
                      {activeKpiTab === 'forecasting' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Card 1 - Forecast Based on Current Resources */}
                          <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                            <h4 className="font-medium text-dark mb-3">Forecast Based on Current Resources</h4>
                            <div className="space-y-4">
                              {/* Projected Outcomes */}
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-medium text-dark mb-2">Projected Outcomes</h5>
                                <ul className="space-y-2 text-sm text-mediumGray">
                                  <li className="flex justify-between">
                                    <span>Total Forecasted Traffic:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.currentResources.projectedTraffic.toLocaleString()}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Forecasted Leads:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.currentResources.projectedLeads}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>% of Target:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.currentResources.targetPercentage}%</span>
                                  </li>
                                </ul>
                                <p className="mt-2 text-xs text-mediumGray">Expected to reach {kpiData.forecasting.currentResources.targetPercentage}% of Q3 traffic goal at current pacing</p>
                              </div>

                              {/* Deliverable Breakdown */}
                              <div>
                                <h5 className="font-medium text-dark mb-2">Deliverable Breakdown</h5>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="p-3 bg-blue-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-dark">{kpiData.forecasting.currentResources.deliverables.briefs}</div>
                                    <div className="text-xs text-mediumGray">Briefs/month</div>
                                  </div>
                                  <div className="p-3 bg-green-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-dark">{kpiData.forecasting.currentResources.deliverables.backlinks}</div>
                                    <div className="text-xs text-mediumGray">Backlinks/month</div>
                                  </div>
                                  <div className="p-3 bg-purple-50 rounded-lg text-center">
                                    <div className="text-lg font-bold text-dark">{kpiData.forecasting.currentResources.deliverables.techFixes}</div>
                                    <div className="text-xs text-mediumGray">Tech fixes</div>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-mediumGray flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span>Assumes avg 500 visits/post, 1.7% CVR, DR 60 = +2 positions</span>
                                </div>
                              </div>

                              {/* Visual Pacing Bar */}
                              <div>
                                <h5 className="font-medium text-dark mb-2">Progress Toward Goal</h5>
                                <div className="relative pt-1">
                                  <div className="flex mb-2 items-center justify-between">
                                    <div>
                                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                                        At Risk
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <span className="text-xs font-semibold inline-block text-amber-600">
                                        {kpiData.forecasting.currentResources.targetPercentage}%
                                      </span>
                                    </div>
                                  </div>
                                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-amber-200">
                                    <div style={{ width: `${kpiData.forecasting.currentResources.targetPercentage}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500"></div>
                                  </div>
                                  <div className="flex justify-between text-xs text-mediumGray">
                                    <span>Current Forecast</span>
                                    <span>Target</span>
                                  </div>
                                </div>
                              </div>

                              {/* Timeline Estimate */}
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-mediumGray">At this pace, you're projected to reach these outcomes by <span className="font-medium text-dark">{kpiData.forecasting.currentResources.timeline}</span>.</p>
                              </div>
                            </div>
                          </div>

                          {/* Card 2 - Forecast Based on Agreed KPI Targets */}
                          <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                            <h4 className="font-medium text-dark mb-3">To Reach Agreed KPIs</h4>
                            <p className="text-sm text-mediumGray mb-4">What would need to change to stay aligned with your campaign goals.</p>

                            <div className="space-y-4">
                              {/* Target KPI Summary */}
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h5 className="font-medium text-dark mb-2">Target KPI Summary</h5>
                                <ul className="space-y-2 text-sm text-mediumGray">
                                  <li className="flex justify-between">
                                    <span>Target Traffic:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.agreedTargets.targetTraffic.toLocaleString()}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>Target Leads:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.agreedTargets.targetLeads}</span>
                                  </li>
                                  <li className="flex justify-between">
                                    <span>End Date:</span>
                                    <span className="font-medium text-dark">{kpiData.forecasting.agreedTargets.endDate}</span>
                                  </li>
                                </ul>
                              </div>

                              {/* Gap Analysis */}
                              <div className="p-4 bg-amber-50 rounded-lg">
                                <h5 className="font-medium text-dark mb-2">Gap Analysis</h5>
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-mediumGray">Gap to close:</span>
                                  <span className="font-medium text-dark">{kpiData.forecasting.agreedTargets.gap.percentage}%</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span className="text-sm text-mediumGray">Estimated shortfall:</span>
                                  <span className="font-medium text-dark">~{kpiData.forecasting.agreedTargets.gap.shortfall.toLocaleString()} visits</span>
                                </div>
                              </div>

                              {/* Required Adjustments */}
                              <div>
                                <h5 className="font-medium text-dark mb-2">Required Adjustments</h5>
                                <div className="space-y-2">
                                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-mediumGray">Deliverables:</span>
                                    <span className="font-medium text-dark">+{kpiData.forecasting.agreedTargets.requiredAdjustments.content} briefs / month</span>
                                  </div>
                                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-mediumGray">Timeline:</span>
                                    <span className="font-medium text-dark">+{kpiData.forecasting.agreedTargets.requiredAdjustments.timeline} months</span>
                                  </div>
                                  <div className="flex justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-mediumGray">Conversion Rate:</span>
                                    <span className="font-medium text-dark">↑ from {kpiData.forecasting.agreedTargets.requiredAdjustments.conversionRate.current}% → {kpiData.forecasting.agreedTargets.requiredAdjustments.conversionRate.required}%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Visual Comparison Chart */}
                              <div>
                                <h5 className="font-medium text-dark mb-2">Trajectory Comparison</h5>
                                <div className="h-40">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                      data={[
                                        { month: 'Apr', current: 8000, target: 8000, required: 8000 },
                                        { month: 'May', current: 10000, target: 12000, required: 11000 },
                                        { month: 'Jun', current: 12000, target: 16000, required: 14000 },
                                        { month: 'Jul', current: 13500, target: 19000, required: 17000 },
                                        { month: 'Aug', current: 14500, target: 22000, required: 20000 },
                                      ]}
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" />
                                      <XAxis dataKey="month" />
                                      <YAxis />
                                      <Tooltip />
                                      <Legend />
                                      <Line type="monotone" dataKey="current" name="Current Trajectory" stroke="#8884d8" />
                                      <Line type="monotone" dataKey="target" name="KPI Goal" stroke="#82ca9d" />
                                      <Line type="monotone" dataKey="required" name="Required Output" stroke="#ffc658" strokeDasharray="5 5" />
                                    </LineChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Internal Tooltip */}
                              <div className="mt-2 text-xs text-mediumGray flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>This assumes content starts compounding 45 days post-publish</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Breakdown by Page Type Tab */}
                      {activeKpiTab === 'breakdown' && (
                        <div className="space-y-6">
                          {/* Top-Level Filters */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-mediumGray">Date Range:</span>
                              <select className="border border-lightGray rounded-md px-2 py-1 text-sm">
                                <option>Last 30 days</option>
                                <option>Last 90 days</option>
                                <option>Year to date</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-mediumGray">Funnel Stage:</span>
                              <select className="border border-lightGray rounded-md px-2 py-1 text-sm">
                                <option>All Stages</option>
                                <option>ToFU</option>
                                <option>MoFU</option>
                                <option>BoFU</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-mediumGray">Page Type:</span>
                              <select className="border border-lightGray rounded-md px-2 py-1 text-sm">
                                <option>All Types</option>
                                <option>Blog</option>
                                <option>Feature</option>
                                <option>Solution</option>
                                <option>High-Intent</option>
                              </select>
                            </div>
                          </div>

                          {/* Performance Overview Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="text-sm font-medium text-dark mb-2">Blog Pages</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Organic Clicks:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.blog.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Conversion Rate:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.blog.conversionRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Leads Captured:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.blog.leads}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="text-sm font-medium text-dark mb-2">Feature Pages</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Clicks:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.feature.clicks.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Engagement Rate:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.feature.engagementRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Assisted Conversions:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.feature.assistedConversions}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="text-sm font-medium text-dark mb-2">Solution Pages</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Traffic Volume:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.solution.traffic.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Conversion Rate:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.solution.conversionRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Avg Time on Page:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.solution.timeOnPage}</span>
                                </div>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="text-sm font-medium text-dark mb-2">High-Intent Pages</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Traffic Volume:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.highIntent.traffic.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Conversion Rate:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.highIntent.conversionRate}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-mediumGray">Leads:</span>
                                  <span className="text-sm font-medium text-dark">{kpiData.pageTypeBreakdown.overview.highIntent.leads}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Funnel Stage Breakdown */}
                          <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                            <h4 className="font-medium text-dark mb-3">Funnel Stage Breakdown</h4>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-lightGray">
                                <thead>
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Stage</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Pages</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Traffic</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Conv. Rate</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Leads</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-lightGray">
                                  {kpiData.pageTypeBreakdown.funnelStages.map((stage, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-dark">{stage.stage}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">{stage.pages}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">{stage.traffic.toLocaleString()}</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">{stage.conversionRate}%</td>
                                      <td className="px-4 py-3 whitespace-nowrap text-sm text-mediumGray">{stage.leads}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* High & Low Performers */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="font-medium text-dark mb-3">Top Performers</h4>
                              <div className="space-y-3">
                                {kpiData.pageTypeBreakdown.performers.top.map((performer, index) => (
                                  <div key={index} className="p-3 bg-green-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium text-dark truncate" style={{ maxWidth: '200px' }}>{performer.url}</p>
                                        <div className="flex items-center mt-1">
                                          <span className="text-xs text-mediumGray mr-2">{performer.metric}:</span>
                                          <span className="text-xs font-medium text-dark">{performer.value}</span>
                                          <span className="ml-2 text-xs text-green-500">↑ {performer.change}%</span>
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">{performer.tag}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                              <h4 className="font-medium text-dark mb-3">Underperforming Pages</h4>
                              <div className="space-y-3">
                                {kpiData.pageTypeBreakdown.performers.bottom.map((performer, index) => (
                                  <div key={index} className="p-3 bg-red-50 rounded-lg">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="text-sm font-medium text-dark truncate" style={{ maxWidth: '200px' }}>{performer.url}</p>
                                        <div className="flex items-center mt-1">
                                          <span className="text-xs text-mediumGray mr-2">{performer.metric}:</span>
                                          <span className="text-xs font-medium text-dark">{performer.value}</span>
                                          <span className="ml-2 text-xs text-red-500">↓ {Math.abs(performer.change)}%</span>
                                        </div>
                                      </div>
                                      <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">{performer.tag}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Bottleneck Insight Callout Box */}
                          <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                            <h4 className="font-medium text-dark mb-3">Bottleneck Insights</h4>
                            <ul className="space-y-2">
                              {kpiData.pageTypeBreakdown.bottlenecks.map((bottleneck, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  <span className="text-sm text-mediumGray">{bottleneck}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-lightGray p-4 rounded-scalerrs">
            <p className="text-sm text-mediumGray">
              <strong>Note:</strong> Reports provide a structured, decision-ready interface that combines performance insights, deliverable updates, and next-step clarity.
            </p>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
