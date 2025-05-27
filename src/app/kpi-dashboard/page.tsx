'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Download,
  Filter,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  ChevronUp,
  RefreshCw,
  AlertOctagon,
  ExternalLink,
  BarChart4,
  LineChart,
  PieChartIcon,
  CheckCircle,
  TargetIcon,
  BarChart3
} from "lucide-react";
import { fetchClientsByMonth } from '@/lib/airtable/tables/clientsByMonth';
import { fetchFromAirtable } from '@/lib/airtable/helpers';
import { useClientData } from '@/context/ClientDataContext';
import { ResponsiveContainer } from 'recharts';
import { Cell } from 'recharts';
import { Legend } from 'recharts';
import { Tooltip } from 'recharts';
import { Pie } from 'recharts';
import { PieChart } from 'recharts';

// Custom styles to fix z-index issues
const customStyles = {
  selectContent: {
    zIndex: 100, // Higher z-index for dropdowns
  },
  topNavbar: {
    zIndex: 50, // Lower than dropdowns but higher than other content
  },
  pageContent: {
    zIndex: 10, // Lower than navbar
    position: 'relative' as const,
  }
};

// Colour palette reused across Page-Type charts
const PAGE_TYPE_COLORS = ['#9EA8FB', '#FFE4A6', '#B1E3FF', '#A5D7A7', '#F8BBD0'];

// Sample KPI data (static) – dynamic summary will be merged in component
const sampleKpiData = {
  summary: {
    /* Placeholder critical KPIs – overwritten once Airtable data loads */
    revenueImpact: {
      total: 0,
      target: 0,
    },
    conversionRate: {
      current: 0,
      goal: 0,
    },
    sqls: {
      current: 0,
      goal: 0,
    },
    trafficGrowth: {
      current: 0,
      goal: 0,
    },
    organicTraffic: {
      current: 45250,
      previous: 38750,
      change: 16.8,
      goal: 50000,
      progress: 90.5
    },
    organicConversions: {
      current: 1250,
      previous: 980,
      change: 27.6,
      goal: 1500,
      progress: 83.3
    },
    averagePosition: {
      current: 12.4,
      previous: 15.8,
      change: -21.5,
      goal: 10,
      progress: 80.6
    },
    keywordRankings: {
      top3: {
        current: 28,
        previous: 22,
        change: 27.3
      },
      top10: {
        current: 124,
        previous: 98,
        change: 26.5
      },
      top100: {
        current: 1240,
        previous: 1050,
        change: 18.1
      }
    }
  },
  topPages: [
    { url: '/product/seo-tool', traffic: 4250, conversions: 185, conversionRate: 4.35, avgPosition: 2.3, change: 15.2 },
    { url: '/blog/seo-strategy-2025', traffic: 3850, conversions: 112, conversionRate: 2.91, avgPosition: 1.8, change: 22.4 },
    { url: '/services/technical-seo', traffic: 3250, conversions: 98, conversionRate: 3.02, avgPosition: 3.2, change: 8.3 },
    { url: '/blog/keyword-research', traffic: 2950, conversions: 76, conversionRate: 2.58, avgPosition: 2.5, change: 12.1 },
    { url: '/case-studies/ecommerce', traffic: 2650, conversions: 92, conversionRate: 3.47, avgPosition: 4.1, change: 18.6 }
  ],
  newPages: [
    { url: '/blog/ai-seo-tools', traffic: 1850, conversions: 42, conversionRate: 2.27, avgPosition: 5.2, daysLive: 18 },
    { url: '/services/local-seo', traffic: 1650, conversions: 58, conversionRate: 3.52, avgPosition: 4.8, daysLive: 24 },
    { url: '/product/rank-tracker', traffic: 1450, conversions: 65, conversionRate: 4.48, avgPosition: 3.9, daysLive: 12 },
    { url: '/blog/ecommerce-seo-guide', traffic: 1250, conversions: 28, conversionRate: 2.24, avgPosition: 6.3, daysLive: 8 },
    { url: '/case-studies/saas', traffic: 950, conversions: 32, conversionRate: 3.37, avgPosition: 5.7, daysLive: 15 }
  ],
  forecasting: {
    trafficForecast: [
      { month: 'Jan', actual: 32500, forecast: null },
      { month: 'Feb', actual: 35800, forecast: null },
      { month: 'Mar', actual: 38750, forecast: null },
      { month: 'Apr', actual: 45250, forecast: null },
      { month: 'May', actual: null, forecast: 48500 },
      { month: 'Jun', actual: null, forecast: 52000 },
      { month: 'Jul', actual: null, forecast: 54500 },
      { month: 'Aug', actual: null, forecast: 57000 },
      { month: 'Sep', actual: null, forecast: 60500 },
      { month: 'Oct', actual: null, forecast: 64000 },
      { month: 'Nov', actual: null, forecast: 68500 },
      { month: 'Dec', actual: null, forecast: 72000 }
    ],
    trafficForecastMoM: [
      { month: 'Jan', growth: null },
      { month: 'Feb', growth: 10.2 },
      { month: 'Mar', growth: 8.2 },
      { month: 'Apr', growth: 16.8 },
      { month: 'May', growth: 7.2 },
      { month: 'Jun', growth: 7.2 },
      { month: 'Jul', growth: 4.8 },
      { month: 'Aug', growth: 4.6 },
      { month: 'Sep', growth: 6.1 },
      { month: 'Oct', growth: 5.8 },
      { month: 'Nov', growth: 7.0 },
      { month: 'Dec', growth: 5.1 }
    ],
    yearlyBreakdown: {
      thisYear: { total: 625800, growth: 32.5 },
      previousYear: { total: 472300, growth: 18.2 },
      nextYearForecast: { total: 840000, growth: 34.2 }
    },
    conversionForecast: [
      { month: 'Jan', actual: 850, forecast: null },
      { month: 'Feb', actual: 920, forecast: null },
      { month: 'Mar', actual: 980, forecast: null },
      { month: 'Apr', actual: 1250, forecast: null },
      { month: 'May', actual: null, forecast: 1350 },
      { month: 'Jun', actual: null, forecast: 1450 },
      { month: 'Jul', actual: null, forecast: 1550 },
      { month: 'Aug', actual: null, forecast: 1650 },
      { month: 'Sep', actual: null, forecast: 1750 },
      { month: 'Oct', actual: null, forecast: 1850 },
      { month: 'Nov', actual: null, forecast: 1950 },
      { month: 'Dec', actual: null, forecast: 2050 }
    ],
    keywordForecast: [
      { month: 'Jan', top3: 18, top10: 82, top100: 950 },
      { month: 'Feb', top3: 20, top10: 90, top100: 1000 },
      { month: 'Mar', top3: 22, top10: 98, top100: 1050 },
      { month: 'Apr', top3: 28, top10: 124, top100: 1240 },
      { month: 'May', top3: 32, top10: 135, top100: 1300 },
      { month: 'Jun', top3: 36, top10: 150, top100: 1350 },
      { month: 'Jul', top3: 40, top10: 165, top100: 1400 },
      { month: 'Aug', top3: 45, top10: 180, top100: 1450 },
      { month: 'Sep', top3: 50, top10: 200, top100: 1550 },
      { month: 'Oct', top3: 55, top10: 225, top100: 1650 },
      { month: 'Nov', top3: 65, top10: 250, top100: 1750 },
      { month: 'Dec', top3: 75, top10: 275, top100: 1850 }
    ]
  },
  pageTypeBreakdown: {
    traffic: [
      { type: 'Blog Pages', traffic: 15840, conversions: 312, conversionRate: 1.97, avgPosition: 4.8, momChange: 12.5 },
      { type: 'Product Pages', traffic: 11310, conversions: 500, conversionRate: 4.42, avgPosition: 3.2, momChange: 8.3 },
      { type: 'Category Pages', traffic: 9050, conversions: 188, conversionRate: 2.08, avgPosition: 5.1, momChange: 6.7 },
      { type: 'Landing Pages', traffic: 6790, conversions: 225, conversionRate: 3.31, avgPosition: 2.9, momChange: 15.2 },
      { type: 'Resource Pages', traffic: 2260, conversions: 25, conversionRate: 1.11, avgPosition: 7.5, momChange: -2.3 }
    ],
    opportunities: [
      {
        type: 'Blog Posts',
        title: 'Improve Internal Linking Structure',
        description: 'Add more strategic internal links from high-traffic blog posts to relevant product pages to improve conversion paths.',
        priority: 'High',
        impact: 'Medium'
      },
      {
        type: 'Product Pages',
        title: 'Enhance Schema Markup',
        description: 'Implement more detailed product schema to improve rich snippet visibility and CTR from search results.',
        priority: 'Medium',
        impact: 'High'
      },
      {
        type: 'Category Pages',
        title: 'Optimize Title Tags & Meta Descriptions',
        description: 'Update title tags and meta descriptions to improve CTR. Current versions are too generic and not compelling.',
        priority: 'Medium',
        impact: 'Medium'
      },
      {
        type: 'Landing Pages',
        title: 'Mobile Optimization',
        description: 'Improve mobile page speed and UX. Mobile conversion rate is 25% lower than desktop despite good traffic.',
        priority: 'High',
        impact: 'High'
      },
      {
        type: 'Resource Pages',
        title: 'Content Refresh',
        description: 'Update outdated content and add more actionable information to improve engagement and backlink potential.',
        priority: 'Low',
        impact: 'Medium'
      }
    ],
    highLowPerformers: {
      traffic: {
        high: [
          { url: '/blog/seo-strategy-2025', metric: 3850, change: 22.4, tag: 'Top Performer' },
          { url: '/product/seo-tool', metric: 4250, change: 15.2, tag: 'Top Performer' },
          { url: '/case-studies/ecommerce', metric: 2650, change: 18.6, tag: 'Top Performer' }
        ],
        low: [
          { url: '/resources/seo-checklist', metric: 450, change: -8.2, tag: 'Needs Refresh' },
          { url: '/blog/link-building-2023', metric: 620, change: -12.5, tag: 'Under Review' },
          { url: '/services/content-writing', metric: 780, change: -5.1, tag: 'Needs Refresh' }
        ]
      },
      conversions: {
        high: [
          { url: '/product/seo-tool', metric: 185, change: 24.8, tag: 'Top Performer' },
          { url: '/blog/seo-strategy-2025', metric: 112, change: 18.2, tag: 'Top Performer' },
          { url: '/product/rank-tracker', metric: 65, change: 30.0, tag: 'Top Performer' }
        ],
        low: [
          { url: '/blog/ecommerce-seo-guide', metric: 28, change: -15.2, tag: 'Needs Refresh' },
          { url: '/resources/seo-checklist', metric: 12, change: -22.5, tag: 'Under Review' },
          { url: '/blog/link-building-2023', metric: 18, change: -8.3, tag: 'Needs Refresh' }
        ]
      },
      clicks: {
        high: [
          { url: '/product/seo-tool', metric: 4250, change: 15.2, tag: 'Top Performer' },
          { url: '/blog/seo-strategy-2025', metric: 3850, change: 22.4, tag: 'Top Performer' },
          { url: '/case-studies/ecommerce', metric: 2650, change: 18.6, tag: 'Top Performer' }
        ],
        low: [
          { url: '/resources/seo-checklist', metric: 450, change: -8.2, tag: 'Needs Refresh' },
          { url: '/blog/link-building-2023', metric: 620, change: -12.5, tag: 'Under Review' },
          { url: '/services/content-writing', metric: 780, change: -5.1, tag: 'Needs Refresh' }
        ]
      },
      timeOnPage: {
        high: [
          { url: '/case-studies/ecommerce', metric: '4:35', change: 12.8, tag: 'Top Performer' },
          { url: '/blog/seo-strategy-2025', metric: '3:42', change: 8.5, tag: 'Top Performer' },
          { url: '/product/rank-tracker', metric: '3:28', change: 15.2, tag: 'Top Performer' }
        ],
        low: [
          { url: '/blog/link-building-2023', metric: '0:48', change: -32.5, tag: 'Under Review' },
          { url: '/resources/seo-checklist', metric: '1:12', change: -18.6, tag: 'Needs Refresh' },
          { url: '/services/content-writing', metric: '1:35', change: -9.2, tag: 'Needs Refresh' }
        ]
      }
    }
  },
  funnelStageBreakdown: {
    summary: [
      { stage: 'ToFU', pages: 24, traffic: 18750, conversionRate: 1.2, leads: 225 },
      { stage: 'MoFU', pages: 15, traffic: 12350, conversionRate: 2.8, leads: 346 },
      { stage: 'BoFU', pages: 9, traffic: 8950, conversionRate: 4.2, leads: 376 },
      { stage: 'High-Intent', pages: 6, traffic: 5200, conversionRate: 5.8, leads: 302 }
    ],
    performance: {
      ToFU: {
        blogPages: { traffic: 12800, conversions: 142, conversionRate: 1.1, timeOnPage: '2:05' },
        resourcePages: { traffic: 5950, conversions: 83, conversionRate: 1.4, timeOnPage: '2:35' }
      },
      MoFU: {
        featurePages: { traffic: 6850, conversions: 178, conversionRate: 2.6, timeOnPage: '3:12' },
        comparePages: { traffic: 5500, conversions: 168, conversionRate: 3.1, timeOnPage: '3:48' }
      },
      BoFU: {
        solutionPages: { traffic: 4750, conversions: 184, conversionRate: 3.9, timeOnPage: '3:25' },
        useCasePages: { traffic: 4200, conversions: 192, conversionRate: 4.6, timeOnPage: '4:10' }
      },
      HighIntent: {
        pricingPages: { traffic: 2850, conversions: 175, conversionRate: 6.1, timeOnPage: '4:25' },
        integrationPages: { traffic: 2350, conversions: 127, conversionRate: 5.4, timeOnPage: '3:55' }
      }
    },
    bottlenecks: [
      {
        issue: "High-traffic but low-converting blog content",
        description: "Your SEO strategy blog posts get 3x more traffic than other content but convert 25% less effectively.",
        recommendation: "Add stronger CTAs and lead magnets to these high-traffic blog posts."
      },
      {
        issue: "MoFU dropout rate",
        description: "Feature pages have good initial engagement but 65% of visitors don't continue to BoFU pages.",
        recommendation: "Improve content linking between Feature and Solution pages."
      },
      {
        issue: "Underperforming resource section",
        description: "Resource pages represent 12% of site content but generate only 5% of conversions.",
        recommendation: "Refresh outdated resources with more actionable, conversion-focused content."
      }
    ]
  }
};

// Date filter options
const dateFilterOptions = [
  { value: 'monthly', label: 'Monthly View' },
  { value: 'quarterly', label: 'Quarterly View' },
  { value: 'yearly', label: 'Yearly View' },
  { value: 'mom', label: 'MoM View' }
];

// Comparison period options
const comparisonOptions = [
  { value: 'previous-period', label: 'Previous Period' },
  { value: 'previous-year', label: 'Previous Year' },
  { value: 'custom', label: 'Custom Period' }
];

function KpiDashboard() {
  const { clientId, isLoading: isClientLoading } = useClientData();
  const [selectedDateView, setSelectedDateView] = useState(dateFilterOptions[0]);
  const [selectedComparison, setSelectedComparison] = useState(comparisonOptions[0]);
  const [activeTab, setActiveTab] = useState('summary');
  const [forecastView, setForecastView] = useState('standard');

  /* -------------------------------------------------------------- */
  /*  KPI summary derived from Airtable (Clients by Month)           */
  /* -------------------------------------------------------------- */
  const [summaryData, setSummaryData] = useState<any | null>(null);
  const [pageData, setPageData] = useState<{ topPages: any[]; newPages: any[] }>({ topPages: [], newPages: [] });
  const [momRows, setMomRows] = useState<any[]>([]);
  // Dynamic Yearly + Quarterly breakdown
  const [yearlyBreakdown, setYearlyBreakdown] = useState<any | null>(null);
  const [quarterRows, setQuarterRows] = useState<any[]>([]);
  const [pageTypeData, setPageTypeData] = useState<any | null>(null);

  /* Deep-merge summary so live fields overwrite placeholders */
  const kpiData = useMemo(() => ({
    ...sampleKpiData,
    summary: {
      ...sampleKpiData.summary,
      ...(summaryData ?? {}),
    },
    topPages: pageData.topPages.length ? pageData.topPages : sampleKpiData.topPages,
    newPages: pageData.newPages.length ? pageData.newPages : sampleKpiData.newPages,
    forecasting: {
      ...sampleKpiData.forecasting,
      yearlyBreakdown: yearlyBreakdown ?? sampleKpiData.forecasting.yearlyBreakdown,
    },
    pageTypeBreakdown: pageTypeData ? {
      traffic: pageTypeData.rows,
      highLowPerformers: pageTypeData.highLow,
      opportunities: pageTypeData.opportunities,
    } : sampleKpiData.pageTypeBreakdown,
  }), [summaryData, pageData, yearlyBreakdown, pageTypeData]);

  useEffect(() => {
    // Don't fetch if client data isn't loaded yet
    if (isClientLoading) {
      console.log('Client data still loading, delaying fetch');
      return;
    }

    (async () => {
      try {
        const records = await fetchClientsByMonth();
        if (!records.length) return;

        /* Sort newest → oldest by Month Start */
        const sorted = [...records].sort((a: any, b: any) => {
          const d = (r: any) => new Date((r.fields as any)['Month Start'] || (r.fields as any)['Month'] || r.id).getTime();
          return d(b) - d(a);
        });

        const latest = sorted[0].fields as any;
        const prev   = (sorted[1]?.fields ?? {}) as any;

        const pct = (cur: number, prv: number) => (prv ? Math.round(((cur - prv) / prv) * 100) : 0);

        /* -------------------------------------------------------------- */
        /*  Compute average MoM traffic growth – actual & projected       */
        /* -------------------------------------------------------------- */
        const asc = [...sorted].reverse(); // oldest → newest
        let actSum = 0, actCnt = 0;
        let projSum = 0, projCnt = 0;
        for (let i = 1; i < asc.length; i++) {
          const curF  = asc[i].fields  as any;
          const prevF = asc[i-1].fields as any;

          const curActual  = Number(curF ['Clicks (Actual)']   ?? curF ['Organic Traffic (Actual)']   ?? 0);
          const prevActual = Number(prevF['Clicks (Actual)']   ?? prevF['Organic Traffic (Actual)']  ?? 0);
          if (prevActual) { actSum  += (curActual - prevActual) / prevActual * 100; actCnt++; }

          const curProj  = Number(curF ['Clicks (Projected)']  ?? curF ['Organic Traffic (Projected)']  ?? 0);
          const prevProj = Number(prevF['Clicks (Projected)']  ?? prevF['Organic Traffic (Projected)'] ?? 0);
          if (prevProj)  { projSum += (curProj - prevProj) / prevProj * 100;  projCnt++; }
        }

        const avgActualGrowth = actCnt  ? parseFloat((actSum  / actCnt).toFixed(1)) : 0;
        const avgProjGrowth   = projCnt ? parseFloat((projSum / projCnt).toFixed(1)) : 0;

        const summary = {
          revenueImpact: {
            total: Number(latest['Estimated Revenue'] ?? 0),
            target: Number(latest['Estimated Revenue Projection'] ?? latest['Estimated Revenue (Projected)'] ?? 0),
          },
          organicTraffic: {
            current: Number(latest['Clicks (Actual)'] ?? latest['Organic Traffic (Actual)'] ?? 0),
            goal:    Number(latest['Clicks (Projected)'] ?? latest['Organic Traffic (Projected)'] ?? 0),
            change:  pct(Number(latest['Clicks (Actual)'] ?? 0), Number(prev['Clicks (Actual)'] ?? 0)),
          },
          organicConversions: {
            current: Number(latest['Leads'] ?? 0),
            goal:    Number(latest['Leads Projected'] ?? latest['Leads (Projected)'] ?? 0),
            change:  pct(Number(latest['Leads'] ?? 0), Number(prev['Leads'] ?? 0)),
          },
          conversionRate: {
            current: Number(latest['Conversion Rate'] ?? 0),
            goal:    Number(latest['Conversion Rate (Projected)'] ?? 0),
          },
          sqls: {
            current: Number(latest['SQL'] ?? latest['SQLs'] ?? 0),
            goal:    Number(latest['SQL Projected'] ?? latest['SQLs Projected'] ?? 0),
          },
          trafficGrowth: {
            current: avgActualGrowth,
            goal:    avgProjGrowth,
          },
          keywordRankings: {
            top3: {
              current: Number(latest['Keywords In Top 3 Positions'] ?? 0),
              previous: Number(prev['Keywords In Top 3 Positions'] ?? 0),
              change: pct(Number(latest['Keywords In Top 3 Positions'] ?? 0), Number(prev['Keywords In Top 3 Positions'] ?? 0)),
            },
            top10: {
              current: Number(latest['Keywords In Top 10 Positions'] ?? 0),
              previous: Number(prev['Keywords In Top 10 Positions'] ?? 0),
              change: pct(Number(latest['Keywords In Top 10 Positions'] ?? 0), Number(prev['Keywords In Top 10 Positions'] ?? 0)),
            },
            top100: {
              current: Number(latest['Keywords In Top 100 Positions'] ?? 0),
              previous: Number(prev['Keywords In Top 100 Positions'] ?? 0),
              change: pct(Number(latest['Keywords In Top 100 Positions'] ?? 0), Number(prev['Keywords In Top 100 Positions'] ?? 0)),
            },
          },
        };

        /* -------------------------------------------------------------- */
        /*  Build Month-over-Month rows for MoM Growth table              */
        /* -------------------------------------------------------------- */
        const momRowsArray = asc
          .map((rec, idx) => {
            const f = rec.fields as any;
            const label = new Date(
              f['Month Start'] || f['Month'] || rec.id
            ).toLocaleString('default', { month: 'short', year: 'numeric' });

            const trafficVal = Number(
              f['Organic Traffic (Actual)'] ?? f['Clicks (Actual)'] ?? 0
            );

            let growth: number | null = null;
            if (idx > 0) {
              const prevF = asc[idx - 1].fields as any;
              const prevTraffic = Number(
                prevF['Organic Traffic (Actual)'] ?? prevF['Clicks (Actual)'] ?? 0
              );
              if (prevTraffic) {
                growth = +(
                  ((trafficVal - prevTraffic) / prevTraffic) * 100
                ).toFixed(1);
              }
            }

            return { month: label, traffic: trafficVal, growth } as const;
          })
          .reverse(); // newest first for UI table

        setMomRows(momRowsArray);

        setSummaryData(summary);

        /* -------------------------------------------------------------- */
        /*  Yearly + Quarterly breakdown                                  */
        /* -------------------------------------------------------------- */
        const nowYear   = new Date().getFullYear();
        const prevYear  = nowYear - 1;
        const nextYear  = nowYear + 1;
        const prevPrev  = nowYear - 2;

        /* Aggregate totals by year */
        const totalsByYear: Record<number, { actual: number; projected: number }> = {};
        records.forEach((rec: any) => {
          const f = rec.fields as any;
          const dateStr = f['Month Start'] || f['Month'] || rec.id;
          const yr = new Date(dateStr).getFullYear();
          totalsByYear[yr] = totalsByYear[yr] || { actual: 0, projected: 0 };
          totalsByYear[yr].actual    += Number(f['Organic Traffic (Actual)']    ?? f['Clicks (Actual)']    ?? 0);
          totalsByYear[yr].projected += Number(f['Organic Traffic (Projected)'] ?? f['Clicks (Projected)'] ?? 0);
        });

        const pctYoY = (cur: number, base: number) => (base ? +(((cur - base) / base) * 100).toFixed(1) : null);

        setYearlyBreakdown({
          previousYear: {
            total: totalsByYear[prevYear]?.actual || 0,
            growth: pctYoY(totalsByYear[prevYear]?.actual || 0, totalsByYear[prevPrev]?.actual || 0),
          },
          thisYear: {
            total: totalsByYear[nowYear]?.actual || 0,
            growth: pctYoY(totalsByYear[nowYear]?.actual || 0, totalsByYear[prevYear]?.actual || 0),
          },
          nextYearForecast: {
            total: totalsByYear[nextYear]?.projected || 0,
            growth: pctYoY(totalsByYear[nextYear]?.projected || 0, totalsByYear[nowYear]?.actual || 0),
          },
        });

        /* Quarterly breakdown for current year */
        const qArr = [
          { quarter: 'Q1', total: 0, isActual: false },
          { quarter: 'Q2', total: 0, isActual: false },
          { quarter: 'Q3', total: 0, isActual: false },
          { quarter: 'Q4', total: 0, isActual: false },
        ];

        records.forEach((rec: any) => {
          const f = rec.fields as any;
          const dateStr = f['Month Start'] || f['Month'] || rec.id;
          const d = new Date(dateStr);
          if (d.getFullYear() !== nowYear) return;
          const qIdx = Math.floor(d.getMonth() / 3);
          const act = Number(f['Organic Traffic (Actual)'] ?? f['Clicks (Actual)'] ?? 0);
          const proj = Number(f['Organic Traffic (Projected)'] ?? f['Clicks (Projected)'] ?? 0);
          if (act) {
            qArr[qIdx].total += act;
            qArr[qIdx].isActual = true;
          } else if (!qArr[qIdx].isActual) {
            qArr[qIdx].total += proj;
          }
        });

        setQuarterRows(qArr);
      } catch (err) {
        console.error('Error fetching KPI data:', err);
      }
    })();
  }, [clientId, isClientLoading]);

  // Add global styles for z-index fixes
  useEffect(() => {
    // Add a style tag to fix z-index issues
    const style = document.createElement('style');
    style.innerHTML = `
      /* Fix z-index for dropdown menus */
      [role="listbox"] {
        z-index: 100 !important;
      }
      
      /* Ensure top navbar has appropriate z-index */
      header {
        z-index: 50 !important;
      }
    `;
    document.head.appendChild(style);
    
    // Clean up function
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Calculate current performance metrics for the header
  const currentProgress = 68; // Example: 68% of Q2 goal
  const projectedAnnual = 83; // Example: 83% of annual target

  // Handler functions for selectors
  const handleDateViewChange = (viewValue: string) => {
    const newView = dateFilterOptions.find(option => option.value === viewValue) || dateFilterOptions[0];
    setSelectedDateView(newView);
  };

  const handleComparisonChange = (comparisonValue: string) => {
    const newComparison = comparisonOptions.find(option => option.value === comparisonValue) || comparisonOptions[0];
    setSelectedComparison(newComparison);
  };

  // Handler function for forecast view
  const handleForecastViewChange = (viewValue: string) => {
    setForecastView(viewValue);
  };

  // Determine growth pacing indicator
  const getGrowthPacingIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (percentage >= 50) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <AlertCircle className="h-5 w-5 text-rose-500" />;
  };

  // Get appropriate time period text based on selected view
  const getTimePeriodText = () => {
    if (selectedDateView.value === 'monthly') return 'End of Month';
    if (selectedDateView.value === 'quarterly') {
      const currentQuarter = Math.floor((new Date().getMonth() / 3) + 1);
      return `End of Q${currentQuarter}`;
    }
    return 'End of Year';
  };

  // Get appropriate pacing text based on selected view
  const getPacingText = () => {
    if (selectedDateView.value === 'monthly') return 'monthly';
    if (selectedDateView.value === 'quarterly') {
      const currentQuarter = Math.floor((new Date().getMonth() / 3) + 1);
      return `Q${currentQuarter}`;
    }
    return 'annual';
  };

  // Get appropriate projected outcome text
  const getProjectedOutcomeText = () => {
    if (selectedDateView.value === 'monthly') {
      return `At this pace you're projected to reach the monthly traffic & leads goal by the end of the month`;
    } else if (selectedDateView.value === 'quarterly') {
      const currentQuarter = Math.floor((new Date().getMonth() / 3) + 1);
      return `At this pace you're projected to reach the quarterly traffic & leads goal by the end of Q${currentQuarter}`;
    }
    return `At this pace you're projected to reach the yearly traffic & leads goal by December 2024`;
  };

  // Custom TopNavBar props
  const topNavBarProps = {
    pathname: '/kpi-dashboard', // Set the current path
    dateView: selectedDateView.value,
    comparisonPeriod: selectedComparison.value,
    onDateViewChange: handleDateViewChange,
    onComparisonChange: handleComparisonChange
  };

  /* ------------------------------------------------------------------ */
  /*  Fetch Top Pages + New Pages from Keywords table                    */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    (async () => {
      try {
        const clientRecordID = clientId;
        if (!clientRecordID) return;

        const formula = `{Client Record ID} = '${clientRecordID}'`;
        const kw = await fetchFromAirtable<any>('Keywords', formula);

        const rows = kw.map((r:any)=>{
          const f = r.fields as any;
          const url = (f['Target Page URL'] ?? '') as string;
          const pathOnly = url ? url.replace(/^https?:\/\//,'').replace(/^[^/]+\//,'/') : '';
          const traffic = Number(f['Traffic This Month'] ?? f['Clicks Last Month'] ?? 0);
          const clicks = Number(f['Clicks This Month'] ?? f['Clicks Last Month'] ?? 0);
          const conversions = Number(f['Conversions This Month'] ?? f['Leads'] ?? 0);
          const convRateRaw = Number(f['Conversion Rate'] ?? f['Sign Up CVR % (Tag)'] ?? f['Adjusted CVR%'] ?? 0);
          const conversionRate = convRateRaw >= 1 ? convRateRaw : convRateRaw * 100;
          const position = Number(f['Main Keyword Position'] ?? 0);
          const lastPos = Number(f['Main Keyword Position Last Month'] ?? position);
          const startPosition = Number(f['Starting Keyword Position'] ?? position);
          const pageType = f['Page Type ( Main )'] as string | undefined;
          return {
            id: r.id,
            pageType: pageType || 'Other',
            url: pathOnly || url,
            traffic,
            clicks,
            conversions,
            conversionRate: +conversionRate.toFixed(2),
            avgPosition: position,
            lastPos,
            change: startPosition ? +( ( (startPosition - position) / startPosition) * 100 ).toFixed(1 ) : 0,
            publicationDate: f['Due Date (Publication)'] ?? f['Publication'] ?? f['Last Updated'] ?? null,
          };
        }).filter((r:any)=>r.url);

        /* Top Pages – top 5 by traffic */
        const topPages = [...rows].sort((a,b)=> b.traffic - a.traffic).slice(0,5);

        /* New Pages – published in last 30 days */
        const now = Date.now();
        const newPages = rows.filter(r=>{
          if(!r.publicationDate) return false;
          const diff = now - new Date(r.publicationDate as string).getTime();
          return diff <= 30*24*3600*1000;
        }).sort((a,b)=> new Date(b.publicationDate).getTime()-new Date(a.publicationDate).getTime()).slice(0,10);

        /* ------------------------------------------------------------------ */
        /*  Build Page Type breakdown                                         */
        /* ------------------------------------------------------------------ */
        const byType: Record<string, { traffic: number; clicks: number; conversions: number; convRates: number[]; positions: number[]; lastPos: number[] }> = {};

        rows.forEach((r:any) => {
          const type = r.pageType;
          if(!byType[type]) byType[type] = { traffic:0, clicks:0, conversions:0, convRates:[], positions:[], lastPos:[] };
          byType[type].traffic += r.traffic;
          byType[type].clicks  += r.clicks;
          byType[type].conversions  += r.conversions;
          byType[type].convRates.push(r.conversionRate);
          byType[type].positions.push(r.avgPosition);
          byType[type].lastPos.push(r.lastPos);
        });

        const trafficArr = Object.entries(byType).map(([type,data])=>({
          type,
          traffic:data.traffic,
          clicks:data.clicks,
          conversions:data.conversions,
          conversionRate: data.convRates.length? +(data.convRates.reduce((a,b)=>a+b,0)/data.convRates.length).toFixed(2):0,
          avgPosition: data.positions.length? +(data.positions.reduce((a,b)=>a+b,0)/data.positions.length).toFixed(1):0,
          momChange: (()=>{
            const prevAvg = data.lastPos.length? data.lastPos.reduce((a,b)=>a+b,0)/data.lastPos.length:0;
            const currAvg = data.positions.length? data.positions.reduce((a,b)=>a+b,0)/data.positions.length:0;
            return prevAvg? +(((prevAvg-currAvg)/prevAvg)*100).toFixed(1):0; // positive if improvement
          })()
        }));

        /* High / low performers by clicks and traffic */
        const pagesByClicks = [...rows].sort((a,b)=> b.clicks - a.clicks);
        const pagesByTraffic = [...rows].sort((a,b)=> b.traffic - a.traffic);

        const highLow = {
          traffic:{
            high: pagesByTraffic.slice(0,3).map(p=>({url:p.url,metric:p.traffic,change:p.change})),
            low: pagesByTraffic.filter(p=>p.traffic>0).slice(-3).map(p=>({url:p.url,metric:p.traffic,change:p.change}))
          },
          clicks:{
            high: pagesByClicks.slice(0,3).map(p=>({url:p.url,metric:p.clicks,change:p.change})),
            low: pagesByClicks.filter(p=>p.clicks>0).slice(-3).map(p=>({url:p.url,metric:p.clicks,change:p.change}))
          },
          timeOnPage:{
            high:[],
            low:[]
          }
        };

        setPageTypeData({ rows:trafficArr, highLow, opportunities: [] });

        setPageData({ topPages, newPages });
      } catch(err){
        console.error(err);
      }
    })();
  }, [clientId, isClientLoading]);

  // --- Standard Forecasting (current month) derived metrics ---
  const [forecastStd, setForecastStd] = useState<{
    trafficGoal: number;
    trafficActual: number;
    leadsGoal: number;
    leadsActual: number;
    pctGoalAchieved: number;
    projectedPct: number;
    gap: number;
    gapPct: number;
    deliverables: { category: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    (async () => {
      /* -------------------------------------------------------------- */
      /*  Forecast Standard metrics for the current month               */
      /* -------------------------------------------------------------- */
      try {
        const clientRecordID = clientId;
        if (!clientRecordID) return;

        const all = await fetchClientsByMonth();
        if (!all.length) return;

        const today = new Date();
        const monthIso = today.toISOString().slice(0, 7); // YYYY-MM

        const rec = all.find((r) => {
          const f = r.fields as any;
          const dStr = f['Month Start'] || f['Month'] || r.id;
          return dStr.slice(0, 7) === monthIso;
        });

        if (rec) {
          const f = rec.fields as any;

          /* Monthly KPI targets + actuals */
          const trafficGoal = Number(f['Organic Traffic (Projected)'] ?? f['Clicks (Projected)'] ?? 0);
          const trafficActual = Number(f['Organic Traffic (Actual)'] ?? f['Clicks (Actual)'] ?? 0);
          const leadsGoal = Number(f['Leads Projected'] ?? f['Leads (Projected)'] ?? 0);
          const leadsActual = Number(f['Leads'] ?? 0);

          /* Days + pacing */
          const daysPassed = today.getDate();
          const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          const runRate = daysPassed ? trafficActual / daysPassed : 0;
          const projectedTraffic = runRate * daysInMonth;

          const pctGoalAchieved = trafficGoal ? (trafficActual / trafficGoal) * 100 : 0;
          const projectedPct = trafficGoal ? (projectedTraffic / trafficGoal) * 100 : 0;
          const gap = trafficGoal - projectedTraffic;
          const gapPct = trafficGoal ? (gap / trafficGoal) * 100 : 0;

          /* Deliverable counts – Activity Log */
          let deliverables: { category: string; count: number }[] = [];
          const clientPlusMonth = f['Client + Month'];
          if (clientPlusMonth) {
            const formula = `{Client + Month} = '${clientPlusMonth}'`;
            const logs = await fetchFromAirtable<any>('Activity Log', formula);
            const counts: Record<string, number> = {};
            logs.forEach((r: any) => {
              const cat = (r.fields['Category'] as string) || 'Uncategorised';
              counts[cat] = (counts[cat] || 0) + 1;
            });
            deliverables = Object.entries(counts).map(([category, count]) => ({ category, count }));
          }

          setForecastStd({
            trafficGoal,
            trafficActual,
            leadsGoal,
            leadsActual,
            pctGoalAchieved,
            projectedPct,
            gap,
            gapPct,
            deliverables,
          });
        }
      } catch (err) {
        console.error(err);
      }
      /* -------------------------------------------------------------- */
    })();
  }, [clientId, isClientLoading]);

  return (
    <DashboardLayout topNavBarProps={topNavBarProps}>
      {/* Performance Summary Banner */}
      <div className="p-6 rounded-lg mb-6 border-8 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm relative z-10">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-dark text-lg mb-1 notification-text">You're currently hitting {currentProgress}% of your Q2 goal.</p>
            <p className="text-base text-mediumGray">Based on current output, you'll reach ~{projectedAnnual}% of the annual target.</p>
          </div>
        </div>
      </div>

      <PageContainer className="relative z-10">
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'summary', label: 'KPI Summary', icon: <BarChart4 size={18} /> },
              { id: 'forecasting', label: 'Forecasting Model', icon: <LineChart size={18} /> },
              { id: 'pageTypeBreakdown', label: 'Breakdown by Page Type', icon: <PieChartIcon size={18} /> },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="primary"
          />
        </PageContainerTabs>

        <PageContainerBody>
          {/* KPI Summary Tab Content */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Main KPI Metrics - 2 rows x 3 columns grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Row 1: Critical Business KPIs */}

                {/* Revenue Impact Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">Revenue Impact</CardTitle>
                      <div className="flex items-center text-green-600 text-sm font-medium hidden">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>12%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#FFE4A6]">{kpiData ? `$${kpiData.summary.revenueImpact.total.toLocaleString()}` : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? `$${kpiData.summary.revenueImpact.target.toLocaleString()}` : '—'}</div>
                      </div>

                      {/* Micro-visual: Sparkline */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[40, 55, 45, 60, 75, 65, 80, 85, 75, 90].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#FFE4A6]/50 rounded-sm"
                              style={{ height: `${value}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Organic Clicks Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">Organic Clicks</CardTitle>
                      <div className={`hidden items-center text-sm font-medium ${kpiData ? (kpiData.summary.organicTraffic.change >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                        {kpiData ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>{kpiData ? kpiData.summary.organicTraffic.change + '%' : ''}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData ? kpiData.summary.organicTraffic.current.toLocaleString() : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? kpiData.summary.organicTraffic.goal.toLocaleString() : '—'}</div>
                      </div>

                      {/* Micro-visual: Sparkline */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[30, 40, 50, 45, 60, 75, 70, 85, 90, 95].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#9EA8FB]/50 rounded-sm"
                              style={{ height: `${value}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Conversion Rate Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                      <div className="hidden items-center text-green-600 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>0.3%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData ? `${kpiData.summary.conversionRate.current}%` : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? `${kpiData.summary.conversionRate.goal}%` : '—'}</div>
                      </div>

                      {/* Micro-visual: Bar chart */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[1.8, 2.0, 2.2, 2.1, 2.3, 2.5, 2.6, 2.7, 2.8].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#9EA8FB]/50 rounded-sm"
                              style={{ height: `${(value/3.5)*100}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Row 2: Supporting Metrics */}

                {/* Leads Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">Leads</CardTitle>
                      <div className={`hidden items-center text-sm font-medium ${kpiData ? (kpiData.summary.organicConversions.change >= 0 ? 'text-green-600' : 'text-red-600') : ''}`}>
                        {kpiData ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>{kpiData ? kpiData.summary.organicConversions.change + '%' : ''}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#FFE4A6]">{kpiData ? kpiData.summary.organicConversions.current.toLocaleString() : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? kpiData.summary.organicConversions.goal.toLocaleString() : '—'}</div>
                      </div>

                      {/* Micro-visual: Sparkline */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[35, 45, 55, 50, 65, 75, 70, 85, 90, 95].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#FFE4A6]/50 rounded-sm"
                              style={{ height: `${value}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SQLs Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">SQLs</CardTitle>
                      <div className="hidden items-center text-green-600 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>18%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData ? kpiData.summary.sqls.current.toLocaleString() : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? kpiData.summary.sqls.goal.toLocaleString() : '—'}</div>
                      </div>

                      {/* Micro-visual: Bar chart */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[180, 210, 240, 260, 290, 320, 350, 370, 385].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#9EA8FB]/50 rounded-sm"
                              style={{ height: `${(value/450)*100}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Traffic Growth Card */}
                <Card className="border-gray-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-medium text-gray-600">Traffic Growth</CardTitle>
                      <div className="hidden items-center text-green-600 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>5.2%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData ? `${kpiData.summary.trafficGrowth.current}%` : '—'}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData ? `${kpiData.summary.trafficGrowth.goal}%` : '—'}</div>
                      </div>

                      {/* Micro-visual: Sparkline */}
                      <div className="mt-4 h-8">
                        <div className="flex items-end space-x-1 h-full">
                          {[5, 7, 9, 8, 10, 12, 14, 15, 16.8].map((value, i) => (
                            <div
                              key={i}
                              className="w-full bg-[#9EA8FB]/50 rounded-sm"
                              style={{ height: `${(value/20)*100}%` }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Keyword Rankings */}
              <Card className="shadow-none border-0">
                <CardHeader>
                  <CardTitle>Keyword Rankings</CardTitle>
                  <CardDescription>Distribution of keyword positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Top 3 Keywords */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Top 3 Positions</h4>
                        <div className={`flex items-center text-xs ${kpiData.summary.keywordRankings.top3.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.keywordRankings.top3.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {kpiData.summary.keywordRankings.top3.change}%
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold">{kpiData.summary.keywordRankings.top3.current}</span>
                        <span className="text-sm text-gray-500">keywords</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Previous: {kpiData.summary.keywordRankings.top3.previous}
                      </div>
                    </div>

                    {/* Top 10 Keywords */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Top 10 Positions</h4>
                        <div className={`flex items-center text-xs ${kpiData.summary.keywordRankings.top10.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.keywordRankings.top10.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {kpiData.summary.keywordRankings.top10.change}%
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold">{kpiData.summary.keywordRankings.top10.current}</span>
                        <span className="text-sm text-gray-500">keywords</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Previous: {kpiData.summary.keywordRankings.top10.previous}
                      </div>
                    </div>

                    {/* Top 100 Keywords */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Top 100 Positions</h4>
                        <div className={`flex items-center text-xs ${kpiData.summary.keywordRankings.top100.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.keywordRankings.top100.change >= 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          )}
                          {kpiData.summary.keywordRankings.top100.change}%
                        </div>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold">{kpiData.summary.keywordRankings.top100.current}</span>
                        <span className="text-sm text-gray-500">keywords</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Previous: {kpiData.summary.keywordRankings.top100.previous}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Top Pages Performance */}
              <Card className="shadow-none border-0">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Top Pages Performance</CardTitle>
                    <CardDescription>Pages with highest organic traffic</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto hidden">
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%] rounded-bl-[12px]">Page Type</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Traffic</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Conversions</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Conversion Rate</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%]">Avg. Position</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[15%] rounded-br-[12px]">MoM Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiData.topPages.map((page, index) => (
                          <tr key={index} className="hover:bg-gray-50 border-b">
                            <td className="px-4 py-4 text-base font-medium text-gray-900">{page.url}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.traffic.toLocaleString()}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.conversions}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.conversionRate}%</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.avgPosition.toFixed(1)}</td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                page.change >= 0 ? 'bg-[#9EA8FB]/20 text-[#6A6AC9]' : 'bg-[#FFE4A6]/20 text-[#B58B2A]'
                              }`}>
                                {page.change >= 0 ? '+' : ''}{page.change}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* New Pages Performance */}
              <Card className="shadow-none border-0">
                <CardHeader>
                  <CardTitle>New Pages Performance</CardTitle>
                  <CardDescription>Pages published in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                      <thead>
                        <tr className="bg-gray-100 border-b border-gray-200">
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[40%] rounded-bl-[12px]">URL</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%]">Traffic</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%]">Conversions</th>
                          <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%] rounded-br-[12px]">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiData.newPages.map((page, index) => (
                          <tr key={index} className="hover:bg-gray-50 border-b">
                            <td className="px-4 py-4 text-base font-medium text-gray-900">{page.url}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.traffic.toLocaleString()}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.conversions}</td>
                            <td className="px-4 py-4 text-base text-gray-700">{page.conversionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forecasting Model Tab Content */}
          {activeTab === 'forecasting' && (
            <div className="space-y-6">
              {/* Forecast View Selector */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button 
                    variant={forecastView === 'standard' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleForecastViewChange('standard')}
                    className="flex items-center"
                  >
                    <LineChart className="h-4 w-4 mr-1" />
                    Standard
                  </Button>
                  <Button 
                    variant={forecastView === 'mom' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleForecastViewChange('mom')}
                    className="flex items-center"
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    MoM Growth
                  </Button>
                  <Button 
                    variant={forecastView === 'yearly' ? 'default' : 'outline'} 
                    size="sm" 
                    onClick={() => handleForecastViewChange('yearly')}
                    className="flex items-center"
                  >
                    <BarChart4 className="h-4 w-4 mr-1" />
                    Yearly
                  </Button>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>

              {/* Standard Forecast View */}
              {forecastView === 'standard' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Card 1 - Forecast Based on Current Resources */}
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center">
                            <LineChart className="h-5 w-5 mr-2 text-[#9EA8FB]" />
                            Forecast Based on Current Resources
                          </CardTitle>
                          <CardDescription>What you&apos;re projected to achieve with current deliverables and timeline</CardDescription>
                        </div>
                        <RefreshCw className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 1. Projected Outcomes */}
                      <div className="space-y-2 border-b border-gray-100 pb-4 min-h-[140px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1 text-gray-500" />
                          Projected Outcomes
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Total Forecasted Traffic by {getTimePeriodText()}</span>
                            <span className="text-sm font-medium">{forecastStd ? forecastStd.trafficGoal.toLocaleString() : '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Forecasted Leads</span>
                            <span className="text-sm font-medium">{forecastStd ? forecastStd.leadsGoal.toLocaleString() : '—'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">% of Original KPI Target</span>
                            <span className="text-sm font-medium text-amber-600">{forecastStd ? forecastStd.pctGoalAchieved.toFixed(1) + '%' : '—'}</span>
                          </div>
                        </div>
                        <div className="text-sm text-amber-600 mt-1 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {forecastStd ? `Expected to reach ${Math.round(forecastStd.projectedPct)}% of ${getPacingText()} traffic goal at current pacing` : 'Calculating…'}
                        </div>
                      </div>

                      {/* 2. Deliverable Breakdown */}
                      <div className="space-y-2 border-b border-gray-100 pb-4 min-h-[160px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <PieChartIcon className="h-4 w-4 mr-1 text-gray-500" />
                          Deliverable Breakdown
                        </h3>
                        {forecastStd ? (
                          <div className="space-y-1">
                            {forecastStd.deliverables.map((d) => (
                              <div key={d.category} className="flex justify-between">
                                <span className="text-sm">{d.category}</span>
                                <span className="text-sm font-medium">{d.count}</span>
                              </div>
                            ))}
                            {forecastStd.deliverables.length === 0 && (
                              <p className="text-sm text-mediumGray">No deliverables logged for this month.</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-mediumGray">Loading…</p>
                        )}
                      </div>

                      {/* 3. Progress Towards Target */}
                      <div className="space-y-4 min-h-[200px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <BarChart3 className="h-4 w-4 mr-1 text-gray-500" />
                          Progress Towards Target
                        </h3>

                        {(() => {
                          if (!forecastStd) return <p className="text-sm text-mediumGray">Loading…</p>;
                          const pct = forecastStd.projectedPct;
                          const status = pct >= 100 ? 'onTrack' : pct >= 90 ? 'onPace' : 'atRisk';
                          const badge = {
                            onTrack: { colour: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" />, label: 'On Track' },
                            onPace:  { colour: 'bg-amber-100 text-amber-800', icon: <TrendingUp className="h-3 w-3" />, label: 'On Pace' },
                            atRisk:  { colour: 'bg-rose-100 text-rose-800', icon: <AlertTriangle className="h-3 w-3" />, label: 'At Risk' },
                          }[status];

                          const progressPct = Math.min(forecastStd.pctGoalAchieved, 100);

                          return (
                            <>
                              {/* Status & numbers */}
                              <div className="flex justify-between items-center">
                                <Badge className={`flex items-center gap-1 ${badge.colour}`}>{badge.icon}<span>{badge.label}</span></Badge>
                                <div className="text-sm text-muted-foreground">
                                  {forecastStd.trafficActual.toLocaleString()} / {forecastStd.trafficGoal.toLocaleString()}
                                </div>
                              </div>

                              {/* Progress bar */}
                              <div className="relative">
                                {/* track */}
                                <div className="w-full h-6 bg-gray-100 rounded-lg overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#9EA8FB] to-[#6A6AC9] transition-all duration-500"
                                    style={{ width: `${progressPct.toFixed(1)}%` }}
                                  />
                                  {/* Target indicator */}
                                  <div
                                    className="absolute top-0 w-1 h-full bg-red-500"
                                    style={{ left: '100%', transform: 'translateX(-50%)' }}
                                  >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                      <TargetIcon className="h-4 w-4 text-red-500" />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Dynamic pacing message */}
                              <p className="text-xs text-gray-600 mt-2">
                                {pct >= 100
                                  ? 'Goal already achieved for this month!'
                                  : `At this pace you're projected to reach ~${Math.round(pct)}% of the monthly traffic & leads goal by the end of the month`}
                              </p>

                              {/* Context call-out when At Risk */}
                              <div className={status === 'atRisk' ? 'bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2' : 'hidden'}>
                                <div className="flex items-start gap-3">
                                  <TrendingUp className="h-5 w-5 text-amber-600 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-amber-800">{Math.max(0, 100 - Math.round(pct))}% behind target</p>
                                    <p className="text-xs text-amber-700 mt-1">Action needed to reach goal by month end.</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* 4. Timeline Estimate */}
                      <div className="pt-2">
                        <p className="text-sm text-gray-700 flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          {getProjectedOutcomeText()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Card 2 - Forecast Based on Agreed KPI Targets */}
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                            To Reach Agreed KPIs
                          </CardTitle>
                          <CardDescription>What would need to change to stay aligned with your campaign goals</CardDescription>
                        </div>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* 1. Target KPI Summary */}
                      <div className="space-y-2 border-b border-gray-100 pb-4 min-h-[140px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <ChevronUp className="h-4 w-4 mr-1 text-gray-500" />
                          Target KPI Summary
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">Target Traffic</span>
                            <span className="text-sm font-medium">92,000</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Target Leads</span>
                            <span className="text-sm font-medium">2,700</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">End Date of Goal</span>
                            <span className="text-sm font-medium">{getTimePeriodText()}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Gap Analysis */}
                      <div className="space-y-2 border-b border-gray-100 pb-4 min-h-[160px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <AlertOctagon className="h-4 w-4 mr-1 text-gray-500" />
                          Gap Analysis
                        </h3>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-sm">% of Gap to Close</span>
                            {forecastStd && (
                              <div className={`flex items-center ${forecastStd.gap > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                                {forecastStd.gap > 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                <span className="text-sm font-medium">{Math.abs(forecastStd.gapPct).toFixed(1)}%</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Estimated Shortfall</span>
                            {forecastStd && (
                              <span className={`text-sm font-medium ${forecastStd.gap > 0 ? 'text-rose-600' : 'text-green-600'}`}>
                                {forecastStd.gap > 0
                                  ? `~${Math.round(Math.abs(forecastStd.gap)).toLocaleString()} visits below ${getPacingText()} target`
                                  : `Projected to exceed target by ~${Math.round(Math.abs(forecastStd.gap)).toLocaleString()} visits`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 3. Trajectory Comparison */}
                      <div className="space-y-2 min-h-[180px]">
                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                          <BarChart4 className="h-4 w-4 mr-1 text-gray-500" />
                          Trajectory Comparison
                        </h3>
                        {forecastStd ? (
                          <>
                            <div className="h-[150px] w-full bg-gray-50 rounded-lg border border-gray-200 p-2">
                              <div className="flex items-end h-full w-full">
                                {/* Current actual progress */}
                                <div className="flex-1 flex flex-col items-center">
                                  <div
                                    className="w-4 rounded-t-sm bg-[#9EA8FB]"
                                    style={{ height: `${forecastStd.pctGoalAchieved}%` }}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">Current</div>
                                </div>
                                {/* Projected */}
                                <div className="flex-1 flex flex-col items-center">
                                  <div
                                    className="w-4 rounded-t-sm bg-amber-400"
                                    style={{ height: `${Math.min(forecastStd.projectedPct,100)}%` }}
                                  />
                                  <div className="text-xs text-gray-500 mt-1">Projected</div>
                                </div>
                                {/* Target */}
                                <div className="flex-1 flex flex-col items-center">
                                  <div className="w-4 h-full bg-green-500 rounded-t-sm"></div>
                                  <div className="text-xs text-gray-500 mt-1">Target</div>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Current: {forecastStd.trafficActual.toLocaleString()}</span>
                              <span>Projected: {Math.round(forecastStd.projectedPct)}%</span>
                              <span>Target: 100%</span>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-mediumGray">Loading…</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Month-over-Month View */}
              {forecastView === 'mom' && (
                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="h-5 w-5 mr-2 text-[#9EA8FB]" />
                            Month-over-Month Growth
                          </CardTitle>
                          <CardDescription>Monthly growth rate for organic traffic</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* MoM Growth Table */}
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                          <thead>
                            <tr className="bg-gray-100 border-b border-gray-200">
                              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%] rounded-bl-[12px]">Month</th>
                              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%]">Traffic</th>
                              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%]">MoM Growth</th>
                              <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[25%] rounded-br-[12px]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {momRows.length ? momRows.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50 border-b">
                                <td className="px-4 py-4 text-base font-medium text-gray-900">{row.month}</td>
                                <td className="px-4 py-4 text-base text-gray-700">
                                  {row.traffic?.toLocaleString()}
                                </td>
                                <td className="px-4 py-4">
                                  {row.growth !== null && row.growth !== undefined ? (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                      row.growth >= 5 ? 'bg-[#9EA8FB]/20 text-[#6A6AC9]' : row.growth >= 0 ? 'bg-[#FFE4A6]/20 text-[#B58B2A]' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {row.growth >= 0 ? '+' : ''}{row.growth}%
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-4">
                                  {row.growth !== null && row.growth !== undefined && (
                                    <div className="flex items-center">
                                      {row.growth >= 5 ? (
                                        <>
                                          <TrendingUp className="h-4 w-4 mr-1 text-[#6A6AC9]" />
                                          <span className="text-xs text-[#6A6AC9]">Strong</span>
                                        </>
                                      ) : row.growth >= 0 ? (
                                        <>
                                          <ArrowUpDown className="h-4 w-4 mr-1 text-[#B58B2A]" />
                                          <span className="text-xs text-[#B58B2A]">Stable</span>
                                        </>
                                      ) : (
                                        <>
                                          <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
                                          <span className="text-xs text-red-500">Declining</span>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan={4} className="px-4 py-4 text-center text-sm text-gray-500">No month-over-month data available.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Yearly Breakdown View */}
              {forecastView === 'yearly' && (
                <div className="space-y-6">
                  <Card className="border border-gray-200">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="flex items-center">
                            <BarChart4 className="h-5 w-5 mr-2 text-[#9EA8FB]" />
                            Yearly Traffic Breakdown
                          </CardTitle>
                          <CardDescription>Annual traffic performance and forecasts</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Previous Year */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Previous Year</h3>
                            <Badge variant="outline" className="text-gray-500">
                              Completed
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {kpiData.forecasting.yearlyBreakdown.previousYear.total.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm">
                            <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600">+{kpiData.forecasting.yearlyBreakdown.previousYear.growth}% YoY</span>
                          </div>
                          <div className="mt-4 h-[100px] bg-gray-50 rounded-lg border border-gray-100 flex items-end p-2">
                            <div className="w-full h-[60%] bg-gray-200 rounded-t"></div>
                          </div>
                        </div>

                        {/* Current Year */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Current Year</h3>
                            <Badge className="bg-[#9EA8FB] text-white hover:bg-[#9EA8FB]">
                              In Progress
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {kpiData.forecasting.yearlyBreakdown.thisYear.total.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm">
                            <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600">+{kpiData.forecasting.yearlyBreakdown.thisYear.growth}% YoY</span>
                          </div>
                          <div className="mt-4 h-[100px] bg-gray-50 rounded-lg border border-gray-100 flex items-end p-2">
                            <div className="w-full h-[80%] bg-[#9EA8FB] rounded-t"></div>
                          </div>
                        </div>

                        {/* Next Year (Forecast) */}
                        <div className="bg-white p-6 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Next Year (Forecast)</h3>
                            <Badge variant="outline" className="text-amber-500 border-amber-200">
                              Projected
                            </Badge>
                          </div>
                          <div className="text-3xl font-bold mb-2">
                            {kpiData.forecasting.yearlyBreakdown.nextYearForecast.total.toLocaleString()}
                          </div>
                          <div className="flex items-center text-sm">
                            <ArrowUp className="h-4 w-4 mr-1 text-green-500" />
                            <span className="text-green-600">+{kpiData.forecasting.yearlyBreakdown.nextYearForecast.growth}% YoY</span>
                          </div>
                          <div className="mt-4 h-[100px] bg-gray-50 rounded-lg border border-gray-100 flex items-end p-2">
                            <div className="w-full h-[100%] bg-amber-200 rounded-t"></div>
                          </div>
                        </div>
                      </div>

                      {/* Quarterly Breakdown */}
                      <div className="mt-8">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">Quarterly Breakdown</h3>
                        <div className="grid grid-cols-4 gap-4">
                          {quarterRows.length ? quarterRows.map((q) => (
                            <div
                              key={q.quarter}
                              className={`p-4 rounded-lg border border-gray-200 ${q.isActual ? 'bg-[#F3F4FF]' : 'bg-[#FFF9CC]'}`}
                            >
                              <div className="text-sm font-medium mb-2">{q.quarter}</div>
                              <div className="text-xl font-bold">{q.total.toLocaleString()}</div>
                              <div className="mt-2 text-xs text-gray-500">{q.isActual ? 'Actual' : 'Forecast'}</div>
                            </div>
                          )) : (
                            <p className="text-sm text-gray-500 col-span-4">No quarterly data available.</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Page Type Breakdown Tab Content */}
          {activeTab === 'pageTypeBreakdown' && (
            <div className="space-y-6">
              <Card className="shadow-none border-0">
                <CardHeader>
                  <CardTitle>Page Type Performance</CardTitle>
                  <CardDescription>Performance breakdown by page type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px] w-full">
                      {/* Traffic Share Pie Chart */}
                      <div className="bg-white h-full w-full rounded-lg border border-gray-200 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip />
                            <Pie
                              data={kpiData.pageTypeBreakdown.traffic}
                              dataKey="traffic"
                              nameKey="type"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {kpiData.pageTypeBreakdown.traffic.map((_: any, idx: number) => (
                                <Cell key={`cell-traffic-${idx}`} fill={PAGE_TYPE_COLORS[idx % PAGE_TYPE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.75rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      {/* Conversion Share Pie Chart */}
                      <div className="bg-white h-full w-full rounded-lg border border-gray-200 p-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip />
                            <Pie
                              data={kpiData.pageTypeBreakdown.traffic}
                              dataKey="clicks"
                              nameKey="type"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                            >
                              {kpiData.pageTypeBreakdown.traffic.map((_: any, idx: number) => (
                                <Cell key={`cell-conv-${idx}`} fill={PAGE_TYPE_COLORS[idx % PAGE_TYPE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.75rem' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">Page Type Performance Metrics</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 table-fixed bg-white">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200">
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[20%] rounded-bl-[12px]">Page Type</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Traffic</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Clicks</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Conversion Rate</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Avg. Position</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%] rounded-br-[12px]">MoM Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpiData.pageTypeBreakdown.traffic.map((item: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50 border-b">
                              <td className="px-4 py-4 text-base font-medium text-gray-900">{item.type}</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.traffic.toLocaleString()}</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.clicks.toLocaleString()}</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.conversionRate.toFixed(2)}%</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.avgPosition.toFixed(1)}</td>
                              <td className="px-4 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  item.momChange >= 0 ? 'bg-[#9EA8FB]/20 text-[#6A6AC9]' : 'bg-[#FFE4A6]/20 text-[#B58B2A]'
                                }`}>
                                  {item.momChange >= 0 ? '+' : ''}{item.momChange}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* High & Low Performers Section */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">High & Low Performers</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Traffic Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium mb-3 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#9EA8FB] mr-2"></span>
                          Traffic
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Top 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.traffic.high.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric.toLocaleString()}</span>
                                    <div className="flex items-center text-[#6A6AC9]">
                                      <ArrowUp className="h-3 w-3 mr-1" />
                                      {item.change}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Bottom 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.traffic.low.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric.toLocaleString()}</span>
                                    <div className="flex items-center text-[#B58B2A]">
                                      <ArrowDown className="h-3 w-3 mr-1" />
                                      {Math.abs(item.change)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Clicks Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium mb-3 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#FFE4A6] mr-2"></span>
                          Clicks
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Top 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.clicks.high.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric.toLocaleString()}</span>
                                    <div className="flex items-center text-[#6A6AC9]">
                                      <ArrowUp className="h-3 w-3 mr-1" />
                                      {item.change}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Bottom 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.clicks.low.map((item: any, index: number) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric.toLocaleString()}</span>
                                    <div className="flex items-center text-[#B58B2A]">
                                      <ArrowDown className="h-3 w-3 mr-1" />
                                      {Math.abs(item.change)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottleneck Insight Callout Box */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">Bottleneck Insights</h4>
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-amber-800">Where are we getting traffic but no conversions?</h3>
                          <p className="mt-1 text-sm text-gray-600">
                            Blog pages attract 35% of your traffic but only account for 25% of conversions.
                            The main bottleneck is in your resource section, which represents 12% of site content
                            but generates only 5% of conversions.
                          </p>
                          <div className="mt-3">
                            <Button variant="outline" size="sm" className="text-xs border-amber-200 text-amber-800 hover:bg-amber-100">
                              <RefreshCw className="h-3 w-3 mr-1" /> View Content Refresh Plan
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">Page Type Optimization Opportunities</h4>
                    <div className="space-y-4">
                      {(kpiData.pageTypeBreakdown.opportunities ?? []).map((item: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              item.priority === 'High'
                                ? 'bg-[#FFE4A6]/20 text-[#B58B2A]'
                                : item.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-[#9EA8FB]/20 text-[#6A6AC9]'
                            }`}>
                              {item.priority === 'High' ? '!' : item.priority === 'Medium' ? '•' : 'i'}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-1">{item.type} - {item.title}</h5>
                              <p className="text-xs text-gray-500">{item.description}</p>
                              <div className="mt-2 flex space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                                  item.priority === 'High'
                                    ? 'bg-[#FFE4A6]/20 text-[#B58B2A]'
                                    : item.priority === 'Medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-[#9EA8FB]/20 text-[#6A6AC9]'
                                }`}>
                                  {item.priority} Priority
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                                  {item.impact} Impact
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
}

export default KpiDashboard;