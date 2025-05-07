'use client';

import { useState } from 'react';
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
  ExternalLink
} from "lucide-react";

// Sample KPI data
const kpiData = {
  summary: {
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
  { value: 'yearly', label: 'Yearly View' }
];

// Comparison period options
const comparisonOptions = [
  { value: 'previous-period', label: 'Previous Period' },
  { value: 'previous-year', label: 'Previous Year' },
  { value: 'custom', label: 'Custom Period' }
];

function KpiDashboard() {
  const [selectedDateView, setSelectedDateView] = useState(dateFilterOptions[0]);
  const [selectedComparison, setSelectedComparison] = useState(comparisonOptions[0]);
  const [activeTab, setActiveTab] = useState('summary');

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

  return (
    <DashboardLayout topNavBarProps={topNavBarProps}>
      {/* Performance Summary Banner */}
      <div className="p-6 rounded-lg mb-6 border-4 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-dark text-lg mb-1 notification-text">You're currently hitting {currentProgress}% of your Q2 goal.</p>
            <p className="text-base text-mediumGray">Based on current output, you'll reach ~{projectedAnnual}% of the annual target.</p>
          </div>
        </div>
      </div>

      <PageContainer>
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'summary', label: 'KPI Summary' },
              { id: 'forecasting', label: 'Forecasting Model' },
              { id: 'pageTypeBreakdown', label: 'Breakdown by Page Type' },
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Revenue Impact</CardTitle>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>12%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#FFE4A6]">$125,500</div>
                        <div className="text-xs text-gray-500 mt-1">Target: $150,000</div>
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Organic Clicks</CardTitle>
                        <div className={`flex items-center text-sm font-medium ${kpiData.summary.organicTraffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.organicTraffic.change >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          )}
                          <span>{kpiData.summary.organicTraffic.change}%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData.summary.organicTraffic.current.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData.summary.organicTraffic.goal.toLocaleString()}</div>
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
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>0.3%</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">2.8%</div>
                        <div className="text-xs text-gray-500 mt-1">Target: 3.5%</div>
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
                      <div className={`flex items-center text-sm font-medium ${kpiData.summary.organicConversions.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {kpiData.summary.organicConversions.change >= 0 ? (
                          <ArrowUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDown className="h-4 w-4 mr-1" />
                        )}
                        <span>{kpiData.summary.organicConversions.change}%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#FFE4A6]">{kpiData.summary.organicConversions.current.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">Target: {kpiData.summary.organicConversions.goal.toLocaleString()}</div>
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
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>18%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">385</div>
                        <div className="text-xs text-gray-500 mt-1">Target: 450</div>
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
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        <ArrowUp className="h-4 w-4 mr-1" />
                        <span>5.2%</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div>
                        <div className="text-3xl font-bold text-[#9EA8FB]">16.8%</div>
                        <div className="text-xs text-gray-500 mt-1">Target: 20%</div>
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
                  <Button variant="outline" size="sm" className="ml-auto">
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Card 1 - Forecast Based on Current Resources */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>Forecast Based on Current Resources</CardTitle>
                    <CardDescription>What you're projected to achieve with current deliverables and timeline</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 1. Projected Outcomes */}
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-medium text-gray-600">Projected Outcomes</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Total Forecasted Traffic by {getTimePeriodText()}</span>
                          <span className="text-sm font-medium">{kpiData.forecasting.trafficForecast[8]?.forecast?.toLocaleString() || '60,500'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Forecasted Leads</span>
                          <span className="text-sm font-medium">{kpiData.forecasting.conversionForecast[8]?.forecast?.toLocaleString() || '1,750'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">% of Original KPI Target</span>
                          <span className="text-sm font-medium text-amber-600">65%</span>
                        </div>
                      </div>
                      <div className="text-sm text-amber-600 mt-1">
                        Expected to reach 65% of {getPacingText()} traffic goal at current pacing
                      </div>
                    </div>

                    {/* 2. Deliverable Breakdown */}
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-medium text-gray-600">Deliverable Breakdown</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Content Briefs/Month</span>
                          <span className="text-sm font-medium">8</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Backlinks/Month</span>
                          <span className="text-sm font-medium">12</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tech SEO Fixes Completed</span>
                          <span className="text-sm font-medium">15</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Visual Pacing Bar */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">Progress Towards Target</h3>
                      <div className="w-full h-4 bg-gray-100 rounded-full relative">
                        <div className="h-4 bg-[#9EA8FB] rounded-full" style={{ width: '65%' }}></div>
                        <div className="absolute top-6 left-[65%] transform -translate-x-1/2 text-xs text-[#9EA8FB]">
                          Current Forecast
                        </div>
                        <div className="absolute top-6 right-0 transform translate-x-0 text-xs text-gray-600">
                          Target
                        </div>
                      </div>
                      <div className="flex justify-between mt-6">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">At Risk</Badge>
                      </div>
                    </div>

                    {/* 4. Timeline Estimate */}
                    <div className="pt-2">
                      <p className="text-sm text-gray-700">
                        {getProjectedOutcomeText()}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2 - Forecast Based on Agreed KPI Targets */}
                <Card className="border border-gray-200">
                  <CardHeader>
                    <CardTitle>To Reach Agreed KPIs</CardTitle>
                    <CardDescription>What would need to change to stay aligned with your campaign goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 1. Target KPI Summary */}
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-medium text-gray-600">Target KPI Summary</h3>
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
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-medium text-gray-600">Gap Analysis</h3>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">% of Gap to Close</span>
                          <div className="flex items-center text-rose-600">
                            <ArrowUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">35%</span>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Estimated Shortfall</span>
                          <span className="text-sm font-medium text-rose-600">~31,500 visits below {getPacingText()} target</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Required Adjustments */}
                    <div className="space-y-2 border-b border-gray-100 pb-4">
                      <h3 className="text-sm font-medium text-gray-600">Required Adjustments</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Deliverables</span>
                          <span className="text-sm font-medium">+4 briefs / month</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Timeline</span>
                          <span className="text-sm font-medium">+2 months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Conversion Rate</span>
                          <span className="text-sm font-medium">↑ from 1.7% → 2.1%</span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Visual Comparison Chart */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">Trajectory Comparison</h3>
                      <div className="h-[150px] w-full bg-gray-50 rounded-lg border border-gray-200 p-2">
                        <div className="flex items-end h-full w-full">
                          {/* Simplified chart visualization */}
                          <div className="flex-1 flex flex-col items-center">
                            <div className="h-[60%] w-4 bg-[#9EA8FB] rounded-t-sm"></div>
                            <div className="text-xs text-gray-500 mt-1">Current</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="h-[100%] w-4 bg-green-500 rounded-t-sm"></div>
                            <div className="text-xs text-gray-500 mt-1">Target</div>
                          </div>
                          <div className="flex-1 flex flex-col items-center">
                            <div className="h-[85%] w-4 bg-amber-500 rounded-t-sm"></div>
                            <div className="text-xs text-gray-500 mt-1">Required</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Current: 60,500</span>
                        <span>Required: 78,200</span>
                        <span>Target: 92,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                      {/* Chart for Traffic Share with Figma-matched colors */}
                      <div className="bg-white h-full w-full rounded-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center w-full">
                          <div className="relative h-56 w-56 flex items-center justify-center">
                            {/* Overlapping rectangles */}
                            <div className="absolute left-10 top-8 w-24 h-24 bg-[#9EA8FB] rounded-lg transform -rotate-6"></div>
                            <div className="absolute right-6 top-10 w-22 h-22 bg-[#FFE4A6] rounded-lg transform rotate-6"></div>
                            <div className="absolute right-12 bottom-8 w-20 h-20 bg-[#B1E3FF] rounded-lg transform rotate-3"></div>
                            <div className="absolute left-12 bottom-12 w-20 h-18 bg-[#A5D7A7] rounded-lg transform -rotate-3"></div>
                            <div className="absolute left-6 top-24 w-14 h-14 bg-[#F8BBD0] rounded-lg transform rotate-12"></div>
                            
                            {/* Central text bubble */}
                            <div className="bg-white rounded-lg shadow-sm z-10 p-3 flex flex-col items-center justify-center">
                              <span className="text-xs text-gray-700 font-medium">Traffic</span>
                              <span className="text-xs text-gray-700 font-medium">Share</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-8">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#9EA8FB]"></div>
                              <span className="text-xs text-gray-500">Blog (35%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#FFE4A6]"></div>
                              <span className="text-xs text-gray-500">Product (25%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#B1E3FF]"></div>
                              <span className="text-xs text-gray-500">Category (20%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#A5D7A7]"></div>
                              <span className="text-xs text-gray-500">Landing (15%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#F8BBD0]"></div>
                              <span className="text-xs text-gray-500">Resource (5%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      {/* Chart for Conversion Share with Figma-matched colors */}
                      <div className="bg-white h-full w-full rounded-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center w-full">
                          <div className="relative h-56 w-56 flex items-center justify-center">
                            {/* Overlapping rectangles */}
                            <div className="absolute left-12 top-8 w-20 h-20 bg-[#9EA8FB] rounded-lg transform -rotate-6"></div>
                            <div className="absolute right-6 top-8 w-28 h-28 bg-[#FFE4A6] rounded-lg transform rotate-6"></div>
                            <div className="absolute right-12 bottom-8 w-18 h-18 bg-[#B1E3FF] rounded-lg transform rotate-3"></div>
                            <div className="absolute left-10 bottom-10 w-20 h-20 bg-[#A5D7A7] rounded-lg transform -rotate-3"></div>
                            <div className="absolute left-6 top-28 w-10 h-10 bg-[#F8BBD0] rounded-lg transform rotate-12"></div>
                            
                            {/* Central text bubble */}
                            <div className="bg-white rounded-lg shadow-sm z-10 p-3 flex flex-col items-center justify-center">
                              <span className="text-xs text-gray-700 font-medium">Conversion</span>
                              <span className="text-xs text-gray-700 font-medium">Share</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-x-6 gap-y-2 mt-8">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#9EA8FB]"></div>
                              <span className="text-xs text-gray-500">Blog (25%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#FFE4A6]"></div>
                              <span className="text-xs text-gray-500">Product (40%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#B1E3FF]"></div>
                              <span className="text-xs text-gray-500">Category (15%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#A5D7A7]"></div>
                              <span className="text-xs text-gray-500">Landing (18%)</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-[#F8BBD0]"></div>
                              <span className="text-xs text-gray-500">Resource (2%)</span>
                            </div>
                          </div>
                        </div>
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
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Conversions</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Conversion Rate</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%]">Avg. Position</th>
                            <th className="px-4 py-4 text-left text-base font-bold text-black uppercase tracking-wider w-[16%] rounded-br-[12px]">MoM Change</th>
                          </tr>
                        </thead>
                        <tbody>
                          {kpiData.pageTypeBreakdown.traffic.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 border-b">
                              <td className="px-4 py-4 text-base font-medium text-gray-900">{item.type}</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.traffic.toLocaleString()}</td>
                              <td className="px-4 py-4 text-base text-gray-700">{item.conversions.toLocaleString()}</td>
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
                              {kpiData.pageTypeBreakdown.highLowPerformers.traffic.high.map((item, index) => (
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
                              {kpiData.pageTypeBreakdown.highLowPerformers.traffic.low.map((item, index) => (
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

                      {/* Conversions Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium mb-3 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#FFE4A6] mr-2"></span>
                          Conversions
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Top 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.conversions.high.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric}</span>
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
                              {kpiData.pageTypeBreakdown.highLowPerformers.conversions.low.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric}</span>
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

                      {/* Time on Page Section */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h5 className="text-sm font-medium mb-3 flex items-center">
                          <span className="w-2 h-2 rounded-full bg-[#B1E3FF] mr-2"></span>
                          Time on Page
                        </h5>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-xs text-gray-500 mb-2">Top 3</h6>
                            <div className="space-y-2">
                              {kpiData.pageTypeBreakdown.highLowPerformers.timeOnPage.high.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric}</span>
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
                              {kpiData.pageTypeBreakdown.highLowPerformers.timeOnPage.low.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-xs">
                                  <div className="truncate w-36">
                                    {item.url}
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-2">{item.metric}</span>
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
                      {kpiData.pageTypeBreakdown.opportunities.map((item, index) => (
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