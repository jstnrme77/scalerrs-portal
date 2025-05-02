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
import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Download, Filter, TrendingDown, TrendingUp } from "lucide-react";

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
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' },
  { value: 'last-6-months', label: 'Last 6 Months' },
  { value: 'last-12-months', label: 'Last 12 Months' },
  { value: 'year-to-date', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Range' }
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

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
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
                <SelectValue placeholder="Select date range" />
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

      <PageContainer>
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'summary', label: 'KPI Summary' },
              { id: 'forecasting', label: 'Forecasting' },
              { id: 'pageTypeBreakdown', label: 'Page Type Breakdown' },
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
              {/* Main KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Organic Traffic Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Organic Traffic</CardTitle>
                    <CardDescription>Last 30 days vs previous period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold">{kpiData.summary.organicTraffic.current.toLocaleString()}</span>
                        <div className={`flex items-center ${kpiData.summary.organicTraffic.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.organicTraffic.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="font-medium">{kpiData.summary.organicTraffic.change}%</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Goal: {kpiData.summary.organicTraffic.goal.toLocaleString()}
                      </div>
                      
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${kpiData.summary.organicTraffic.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-right">
                        {kpiData.summary.organicTraffic.progress}% of goal
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Organic Conversions Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Organic Conversions</CardTitle>
                    <CardDescription>Last 30 days vs previous period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold">{kpiData.summary.organicConversions.current.toLocaleString()}</span>
                        <div className={`flex items-center ${kpiData.summary.organicConversions.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.organicConversions.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="font-medium">{kpiData.summary.organicConversions.change}%</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Goal: {kpiData.summary.organicConversions.goal.toLocaleString()}
                      </div>
                      
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${kpiData.summary.organicConversions.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-right">
                        {kpiData.summary.organicConversions.progress}% of goal
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Average Position Card */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium">Average Position</CardTitle>
                    <CardDescription>Last 30 days vs previous period</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold">{kpiData.summary.averagePosition.current}</span>
                        <div className={`flex items-center ${kpiData.summary.averagePosition.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {kpiData.summary.averagePosition.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          <span className="font-medium">{kpiData.summary.averagePosition.change}%</span>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Goal: {kpiData.summary.averagePosition.goal}
                      </div>
                      
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2">
                        <div 
                          className="h-2 bg-primary rounded-full" 
                          style={{ width: `${kpiData.summary.averagePosition.progress}%` }}
                        ></div>
                      </div>
                      
                      <div className="text-xs text-gray-500 text-right">
                        {kpiData.summary.averagePosition.progress}% of goal
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

          {/* Forecasting Tab Content */}
          {activeTab === 'forecasting' && (
            <div className="space-y-6">
              <Tabs defaultValue="traffic" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="traffic">Traffic Forecast</TabsTrigger>
                  <TabsTrigger value="conversions">Conversion Forecast</TabsTrigger>
                  <TabsTrigger value="keywords">Keyword Forecast</TabsTrigger>
                </TabsList>
                
                {/* Traffic Forecast Tab */}
                <TabsContent value="traffic">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organic Traffic Forecast</CardTitle>
                      <CardDescription>Projected traffic growth for the next 8 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        {/* Placeholder for chart - in a real app, you would use a charting library */}
                        <div className="bg-gray-50 h-full w-full rounded-lg border border-gray-200 p-4 flex flex-col">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-xs text-gray-500">Actual</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs text-gray-500">Forecast</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-end">
                            {kpiData.forecasting.trafficForecast.map((item, index) => (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-gray-500 mb-2">{item.month}</div>
                                
                                {/* Actual bar */}
                                {item.actual !== null && (
                                  <div 
                                    className="w-4 bg-blue-500 rounded-t-sm" 
                                    style={{ 
                                      height: `${(item.actual / 75000) * 100}%`,
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                )}
                                
                                {/* Forecast bar */}
                                {item.actual === null && item.forecast !== null && (
                                  <div 
                                    className="w-4 bg-green-500 rounded-t-sm" 
                                    style={{ 
                                      height: item.forecast ? `${(item.forecast / 75000) * 100}%` : '0%',
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                )}
                                
                                {/* Value label */}
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.actual !== null 
                                    ? item.actual.toLocaleString() 
                                    : item.forecast ? item.forecast.toLocaleString() : '0'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Current Traffic</h4>
                          <div className="text-2xl font-bold">
                            {kpiData.summary.organicTraffic.current.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last 30 days
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Projected Traffic (EOY)</h4>
                          <div className="text-2xl font-bold text-green-600">
                            {kpiData.forecasting.trafficForecast[11]?.forecast?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            December 2025
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Growth Rate</h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round(((kpiData.forecasting.trafficForecast[11]?.forecast || 0) / kpiData.summary.organicTraffic.current - 1) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Projected annual growth
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Conversion Forecast Tab */}
                <TabsContent value="conversions">
                  <Card>
                    <CardHeader>
                      <CardTitle>Conversion Forecast</CardTitle>
                      <CardDescription>Projected lead generation for the next 8 months</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        {/* Placeholder for chart - in a real app, you would use a charting library */}
                        <div className="bg-gray-50 h-full w-full rounded-lg border border-gray-200 p-4 flex flex-col">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              <span className="text-xs text-gray-500">Actual</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-500">Forecast</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-end">
                            {kpiData.forecasting.conversionForecast.map((item, index) => (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-gray-500 mb-2">{item.month}</div>
                                
                                {/* Actual bar */}
                                {item.actual !== null && (
                                  <div 
                                    className="w-4 bg-purple-500 rounded-t-sm" 
                                    style={{ 
                                      height: `${(item.actual / 2050) * 100}%`,
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                )}
                                
                                {/* Forecast bar */}
                                {item.actual === null && item.forecast !== null && (
                                  <div 
                                    className="w-4 bg-amber-500 rounded-t-sm" 
                                    style={{ 
                                      height: item.forecast ? `${(item.forecast / 2050) * 100}%` : '0%',
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                )}
                                
                                {/* Value label */}
                                <div className="text-xs text-gray-500 mt-1">
                                  {item.actual !== null 
                                    ? item.actual.toLocaleString() 
                                    : item.forecast ? item.forecast.toLocaleString() : '0'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Current Conversions</h4>
                          <div className="text-2xl font-bold">
                            {kpiData.summary.organicConversions.current.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last 30 days
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Projected Conversions (EOY)</h4>
                          <div className="text-2xl font-bold text-amber-600">
                            {kpiData.forecasting.conversionForecast[11]?.forecast?.toLocaleString() || '0'}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            December 2025
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Growth Rate</h4>
                          <div className="text-2xl font-bold text-purple-600">
                            {Math.round(((kpiData.forecasting.conversionForecast[11]?.forecast || 0) / kpiData.summary.organicConversions.current - 1) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Projected annual growth
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Keyword Forecast Tab */}
                <TabsContent value="keywords">
                  <Card>
                    <CardHeader>
                      <CardTitle>Keyword Position Forecast</CardTitle>
                      <CardDescription>Projected keyword ranking improvements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[400px] w-full">
                        {/* Placeholder for chart - in a real app, you would use a charting library */}
                        <div className="bg-gray-50 h-full w-full rounded-lg border border-gray-200 p-4 flex flex-col">
                          <div className="flex justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                              <span className="text-xs text-gray-500">Top 3</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-xs text-gray-500">Top 10</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                              <span className="text-xs text-gray-500">Top 100</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 flex items-end">
                            {kpiData.forecasting.keywordForecast.map((item, index) => (
                              <div key={index} className="flex-1 flex flex-col items-center">
                                <div className="text-xs text-gray-500 mb-2">{item.month}</div>
                                
                                <div className="flex items-end space-x-1 h-full">
                                  {/* Top 3 */}
                                  <div 
                                    className="w-3 bg-blue-500 rounded-t-sm" 
                                    style={{ 
                                      height: `${(item.top3 / 75) * 100}%`,
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                  
                                  {/* Top 10 */}
                                  <div 
                                    className="w-3 bg-green-500 rounded-t-sm" 
                                    style={{ 
                                      height: `${(item.top10 / 340) * 100}%`,
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                  
                                  {/* Top 100 */}
                                  <div 
                                    className="w-3 bg-amber-500 rounded-t-sm" 
                                    style={{ 
                                      height: `${(item.top100 / 1850) * 100}%`,
                                      maxHeight: '100%'
                                    }}
                                  ></div>
                                </div>
                                
                                {/* Value label */}
                                <div className="text-xs text-gray-500 mt-1">
                                  {index === 0 || index === 3 || index === 11 ? item.top3 : ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Current Top 3 Keywords</h4>
                          <div className="text-2xl font-bold">
                            {kpiData.summary.keywordRankings.top3.current}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Last 30 days
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Projected Top 3 (EOY)</h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {kpiData.forecasting.keywordForecast[11]?.top3 || 0}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            December 2025
                          </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium mb-2">Growth Rate</h4>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round(((kpiData.forecasting.keywordForecast[11]?.top3 || 0) / kpiData.summary.keywordRankings.top3.current - 1) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Projected annual growth
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
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