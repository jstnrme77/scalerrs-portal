'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronUp
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
      { type: 'Blog Posts', traffic: 15840, conversions: 312, conversionRate: 1.97, avgPosition: 4.8, momChange: 12.5 },
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

  // Determine growth pacing indicator
  const getGrowthPacingIcon = (percentage: number) => {
    if (percentage >= 80) return <TrendingUp className="h-5 w-5 text-green-600" />;
    if (percentage >= 50) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <AlertCircle className="h-5 w-5 text-rose-500" />;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-dark">KPI Dashboard</h1>
          <p className="text-mediumGray">Track your SEO performance metrics and forecasts</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={selectedDateView.value}
              onValueChange={(value) => {
                const selected = dateFilterOptions.find(option => option.value === value);
                if (selected) setSelectedDateView(selected);
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                {dateFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedComparison.value}
              onValueChange={(value) => {
                const selected = comparisonOptions.find(option => option.value === value);
                if (selected) setSelectedComparison(selected);
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select comparison" />
              </SelectTrigger>
              <SelectContent>
                {comparisonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Header Overview with Contextual Summary */}
      <div className="bg-white p-4 rounded-lg border border-[#9EA8FB] mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            {getGrowthPacingIcon(currentProgress)}
            <div>
              <p className="text-lg font-medium">You're currently hitting {currentProgress}% of your Q2 goal.</p>
              <p className="text-sm text-gray-600">Based on current output, you'll reach ~{projectedAnnual}% of the annual target.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-[#9EA8FB] hover:bg-[#9EA8FB]/90">
              {selectedDateView.label}
            </Badge>
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
              { id: 'funnelStage', label: 'Funnel Stage Performance' },
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
                <Card className="border border-[#FFE4A6]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Revenue Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#FFE4A6]">$125,500</div>
                          <div className="text-xs text-gray-500 mt-1">Target: $150,000</div>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>12%</span>
                        </div>
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
                <Card className="border border-[#9EA8FB]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Organic Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#9EA8FB]">{kpiData.summary.organicTraffic.current.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">Target: {kpiData.summary.organicTraffic.goal.toLocaleString()}</div>
                        </div>
                        <div className={`flex items-center text-sm font-medium ${kpiData.summary.organicTraffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.organicTraffic.change >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          )}
                          <span>{kpiData.summary.organicTraffic.change}%</span>
                        </div>
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
                <Card className="border border-[#9EA8FB]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#9EA8FB]">2.8%</div>
                          <div className="text-xs text-gray-500 mt-1">Target: 3.5%</div>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>0.3%</span>
                        </div>
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
                <Card className="border border-[#FFE4A6]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Leads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#FFE4A6]">{kpiData.summary.organicConversions.current.toLocaleString()}</div>
                          <div className="text-xs text-gray-500 mt-1">Target: {kpiData.summary.organicConversions.goal.toLocaleString()}</div>
                        </div>
                        <div className={`flex items-center text-sm font-medium ${kpiData.summary.organicConversions.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.organicConversions.change >= 0 ? (
                            <ArrowUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDown className="h-4 w-4 mr-1" />
                          )}
                          <span>{kpiData.summary.organicConversions.change}%</span>
                        </div>
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
                <Card className="border border-[#9EA8FB]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">SQLs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#9EA8FB]">385</div>
                          <div className="text-xs text-gray-500 mt-1">Target: 450</div>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>18%</span>
                        </div>
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
                <Card className="border border-[#9EA8FB]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">Traffic Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-3xl font-bold text-[#9EA8FB]">16.8%</div>
                          <div className="text-xs text-gray-500 mt-1">Target: 20%</div>
                        </div>
                        <div className="flex items-center text-green-600 text-sm font-medium">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span>5.2%</span>
                        </div>
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
              <Card>
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
              <Card>
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
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">URL</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Traffic</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Change</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conversions</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiData.topPages.map((page, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4 text-sm">{page.url}</td>
                            <td className="py-2 px-4 text-sm">{page.traffic.toLocaleString()}</td>
                            <td className="py-2 px-4 text-sm">
                              <div className={`flex items-center ${page.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {page.change >= 0 ? (
                                  <ArrowUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <ArrowDown className="h-3 w-3 mr-1" />
                                )}
                                {page.change}%
                              </div>
                            </td>
                            <td className="py-2 px-4 text-sm">{page.conversions}</td>
                            <td className="py-2 px-4 text-sm">{page.conversionRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* New Pages Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>New Pages Performance</CardTitle>
                  <CardDescription>Pages published in the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">URL</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Traffic</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conversions</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {kpiData.newPages.map((page, index) => (
                          <tr key={index} className="border-b">
                            <td className="py-2 px-4 text-sm">{page.url}</td>
                            <td className="py-2 px-4 text-sm">{page.traffic.toLocaleString()}</td>
                            <td className="py-2 px-4 text-sm">{page.conversions}</td>
                            <td className="py-2 px-4 text-sm">{page.conversionRate}%</td>
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
                <Card className="border border-[#9EA8FB]">
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
                          <span className="text-sm">Total Forecasted Traffic by Q3</span>
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
                        Expected to reach 65% of Q3 traffic goal at current pacing
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
                      <div className="text-xs text-gray-500 mt-1 flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-1 text-[10px]">i</span>
                        Assumes avg 500 visits/post, 1.7% CVR, DR 60 = +2 positions
                      </div>
                    </div>

                    {/* 3. Visual Pacing Bar */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">Progress Toward Target</h3>
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
                        At this pace, you're projected to reach these outcomes by <span className="font-medium">November 2024</span>.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Card 2 - Forecast Based on Agreed KPI Targets */}
                <Card className="border border-[#9EA8FB]">
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
                          <span className="text-sm font-medium">End of Q3</span>
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
                          <span className="text-sm font-medium text-rose-600">~31,500 visits below Q3 target</span>
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

                    {/* 5. Internal Tooltip */}
                    <div className="pt-2">
                      <div className="text-xs text-gray-500 flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 mr-1 text-[10px]">i</span>
                        This assumes content starts compounding 45 days post-publish
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
              <Card>
                <CardHeader>
                  <CardTitle>Page Type Performance</CardTitle>
                  <CardDescription>Performance breakdown by page type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[300px] w-full">
                      {/* Placeholder for chart - in a real app, you would use a charting library */}
                      <div className="bg-gray-50 h-full w-full rounded-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-48 rounded-full border-8 border-gray-200 relative">
                            {/* Blog Posts Segment - 35% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)',
                              backgroundColor: '#3b82f6'
                            }}></div>

                            {/* Product Pages Segment - 25% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 100% 50%, 100% 100%, 75% 100%)',
                              backgroundColor: '#10b981'
                            }}></div>

                            {/* Category Pages Segment - 20% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 75% 100%, 25% 100%)',
                              backgroundColor: '#f59e0b'
                            }}></div>

                            {/* Landing Pages Segment - 15% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 25% 100%, 0%, 100%, 0% 50%)',
                              backgroundColor: '#8b5cf6'
                            }}></div>

                            {/* Resource Pages Segment - 5% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 0% 50%, 0% 0%, 50% 0%)',
                              backgroundColor: '#ec4899'
                            }}></div>

                            {/* Center circle */}
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-xs text-gray-500">
                                Traffic Share
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-xs text-gray-500">Blog (35%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs text-gray-500">Product (25%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-500">Category (20%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span className="text-xs text-gray-500">Landing (15%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                              <span className="text-xs text-gray-500">Resource (5%)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      {/* Placeholder for chart - in a real app, you would use a charting library */}
                      <div className="bg-gray-50 h-full w-full rounded-lg border border-gray-200 p-4 flex items-center justify-center">
                        <div className="flex flex-col items-center">
                          <div className="w-48 h-48 rounded-full border-8 border-gray-200 relative">
                            {/* Blog Posts Segment - 25% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 50% 0%, 90% 0%, 100% 30%)',
                              backgroundColor: '#3b82f6'
                            }}></div>

                            {/* Product Pages Segment - 40% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 100% 30%, 100% 90%, 75% 100%)',
                              backgroundColor: '#10b981'
                            }}></div>

                            {/* Category Pages Segment - 15% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 75% 100%, 25% 100%)',
                              backgroundColor: '#f59e0b'
                            }}></div>

                            {/* Landing Pages Segment - 18% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 30% 100%, 0%, 90%, 0% 30%)',
                              backgroundColor: '#8b5cf6'
                            }}></div>

                            {/* Resource Pages Segment - 2% */}
                            <div className="absolute inset-0 w-full h-full" style={{
                              clipPath: 'polygon(50% 50%, 0% 30%, 0% 0%, 50% 0%)',
                              backgroundColor: '#ec4899'
                            }}></div>

                            {/* Center circle */}
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-xs text-gray-500">
                                Conversion Share
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mt-4">
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-xs text-gray-500">Blog (25%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs text-gray-500">Product (40%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-500">Category (15%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span className="text-xs text-gray-500">Landing (18%)</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-3 h-3 rounded-full bg-pink-500"></div>
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
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Page Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Traffic
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Conversions
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Conversion Rate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg. Position
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              MoM Change
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {kpiData.pageTypeBreakdown.traffic.map((item, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {item.type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.traffic.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.conversions.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.conversionRate.toFixed(2)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item.avgPosition.toFixed(1)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.momChange >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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

                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-4">Page Type Optimization Opportunities</h4>
                    <div className="space-y-4">
                      {kpiData.pageTypeBreakdown.opportunities.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                              item.priority === 'High'
                                ? 'bg-red-100 text-red-600'
                                : item.priority === 'Medium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-blue-100 text-blue-600'
                            }`}>
                              {item.priority === 'High' ? '!' : item.priority === 'Medium' ? '•' : 'i'}
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-1">{item.type} - {item.title}</h5>
                              <p className="text-xs text-gray-500">{item.description}</p>
                              <div className="mt-2 flex space-x-2">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  item.priority === 'High'
                                    ? 'bg-red-100 text-red-800'
                                    : item.priority === 'Medium'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {item.priority} Priority
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
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