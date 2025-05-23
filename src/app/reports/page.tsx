"use client";

import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  ChevronDown,
  Calendar,
  ExternalLink,
  MessageSquare,
  Filter,
  ArrowUp,
  BarChart2,
  FolderOpen,
  Link2,
  ChartColumn,
  TrendingUp,
  Edit,
  AlertTriangle,
  ArrowRight,
  Info,
  ArrowUpRight,
  Video,
  Users,
  ThumbsUp,
  LineChart as LineChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import TabNavigation from "@/components/ui/navigation/TabNavigation";
import PageContainer, {
  PageContainerBody,
  PageContainerTabs,
} from "@/components/ui/layout/PageContainer";
import { fetchBriefs, fetchArticles, fetchBacklinks } from "@/lib/client-api";
import { Brief, Article, Backlink } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BiMessageRoundedDetail,
  BiLinkExternal,
  BiDownload,
  BiFilter,
  BiErrorCircle,
  BiCheckCircle,
  BiVideo,
} from "react-icons/bi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

// Date filter options - removed as not needed

// Month filter options
const monthFilterOptions = [
  { value: "all", label: "All Months" },
  { value: "2025-04", label: "April 2025" },
  { value: "2025-03", label: "March 2025" },
  { value: "2025-02", label: "February 2025" },
  { value: "2025-01", label: "January 2025" },
  { value: "2024-12", label: "December 2024" },
  { value: "2024-11", label: "November 2024" },
];

// Colors for charts
const COLORS = ['#9ea8fb', '#fcdc94', '#eadcff', '#ff9d7d', '#e5e7eb'];

// Custom label function for pie charts
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.65;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <>
      {/* Semi-transparent background for better readability */}
      <circle cx={x} cy={y} r={14} fill="rgba(255,255,255,0.7)" />
      {/* Larger, bolder text */}
      <text 
        x={x} 
        y={y} 
        fill="#333333" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontWeight="600"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </>
  );
};

// Sample report data
const reports = {
  weekly: [
    {
      id: 1,
      title: "Weekly Report - Apr 29-May 5, 2025",
      date: "2025-05-05",
      type: "weekly",
      month: "2025-05",
    },
    {
      id: 2,
      title: "Weekly Report - Apr 22-28, 2025",
      date: "2025-04-28",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 3,
      title: "Weekly Report - Apr 15-21, 2025",
      date: "2025-04-21",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 4,
      title: "Weekly Report - Apr 8-14, 2025",
      date: "2025-04-14",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 10,
      title: "Weekly Report - Apr 1-7, 2025",
      date: "2025-04-07",
      type: "weekly",
      month: "2025-04",
    },
    {
      id: 11,
      title: "Weekly Report - Mar 25-31, 2025",
      date: "2025-03-31",
      type: "weekly",
      month: "2025-03",
    },
    {
      id: 12,
      title: "Weekly Report - Mar 18-24, 2025",
      date: "2025-03-24",
      type: "weekly",
      month: "2025-03",
    },
  ],
  monthly: [
    {
      id: 5,
      title: "April 2025 Performance Report",
      date: "2025-05-01",
      type: "monthly",
      month: "2025-04",
    },
    {
      id: 6,
      title: "March 2025 Performance Report",
      date: "2025-04-01",
      type: "monthly",
      month: "2025-03",
    },
    {
      id: 7,
      title: "February 2025 Performance Report",
      date: "2025-03-01",
      type: "monthly",
      month: "2025-02",
    },
    {
      id: 12,
      title: "January 2025 Performance Report",
      date: "2025-02-01",
      type: "monthly",
      month: "2025-01",
    },
    {
      id: 13,
      title: "December 2024 Performance Report",
      date: "2025-01-01",
      type: "monthly",
      month: "2024-12",
    },
  ],
  quarterly: [
    {
      id: 8,
      title: "Q1 2025 Strategy & Performance Review",
      date: "2025-04-01",
      type: "quarterly",
      quarter: "Q1-2025",
    },
    {
      id: 9,
      title: "Q4 2024 Strategy & Performance Review",
      date: "2025-01-01",
      type: "quarterly",
      quarter: "Q4-2024",
    },
    {
      id: 14,
      title: "Q3 2024 Strategy & Performance Review",
      date: "2024-10-01",
      type: "quarterly",
      quarter: "Q3-2024",
    },
  ],
};

// Sample briefs, articles, and backlinks data
const sampleBriefs = [
  {
    id: 1,
    title: "Top 10 SEO Strategies for 2025",
    status: "Sent",
    date: "2025-04-25",
    url: "https://docs.google.com/document/d/123",
  },
  {
    id: 2,
    title: "Technical SEO Audit Checklist",
    status: "In Progress",
    date: "2025-04-26",
    url: "https://docs.google.com/document/d/456",
  },
  {
    id: 3,
    title: "Content Marketing ROI Guide",
    status: "Sent",
    date: "2025-04-24",
    url: "https://docs.google.com/document/d/789",
  },
];

const sampleArticles = [
  {
    id: 1,
    title: "How to Improve Your Website Core Web Vitals",
    status: "Published",
    date: "2025-04-23",
    url: "https://example.com/blog/core-web-vitals",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Local SEO",
    status: "Published",
    date: "2025-04-22",
    url: "https://example.com/blog/local-seo-guide",
  },
];

const sampleBacklinks = [
  {
    id: 1,
    source: "industry-blog.com",
    targetUrl: "/blog/seo-guide",
    status: "Live",
    date: "2025-04-27",
    dr: 68,
  },
  {
    id: 2,
    source: "marketing-news.com",
    targetUrl: "/services/content",
    status: "Live",
    date: "2025-04-25",
    dr: 72,
  },
];

// Sample monthly performance data
const monthlyPerformanceData = [
  {
    month: "Jan",
    clicks: 12000,
    impressions: 250000,
    leads: 280,
    revenue: 18000,
  },
  {
    month: "Feb",
    clicks: 13500,
    impressions: 275000,
    leads: 310,
    revenue: 21000,
  },
  {
    month: "Mar",
    clicks: 15000,
    impressions: 310000,
    leads: 350,
    revenue: 24500,
  },
  {
    month: "Apr",
    clicks: 17000,
    impressions: 340000,
    leads: 410,
    revenue: 28000,
  },
];

// Sample quarterly performance data
const quarterlyPerformanceData = [
  { quarter: "Q2 2024", traffic: 38000, leads: 850, revenue: 65000 },
  { quarter: "Q3 2024", traffic: 45000, leads: 980, revenue: 78000 },
  { quarter: "Q4 2024", traffic: 52000, leads: 1150, revenue: 92000 },
  { quarter: "Q1 2025", traffic: 61000, leads: 1350, revenue: 108000 },
];

// Sample top performing pages
const topPerformingPages = [
  { url: "/blog/seo-guide-2025", traffic: 4500, conversions: 135, delta: 12 },
  { url: "/services/technical-seo", traffic: 3200, conversions: 96, delta: 8 },
  { url: "/case-studies/ecommerce", traffic: 2800, conversions: 84, delta: 15 },
];

// Sample competitor data
const competitorData = [
  {
    name: "Competitor A",
    keywordFocus: "Technical SEO",
    rankChange: 5,
    activity: "Launched new service pages",
  },
  {
    name: "Competitor B",
    keywordFocus: "Local SEO",
    rankChange: -2,
    activity: "Increased backlink acquisition",
  },
  {
    name: "Competitor C",
    keywordFocus: "Content Marketing",
    rankChange: 3,
    activity: "Redesigned blog section",
  },
];

// Sample lead source data
const leadSourceData = [
  { name: 'Organic Search', value: 65 },
  { name: 'Direct', value: 15 },
  { name: 'Referral', value: 10 },
  { name: 'Social', value: 8 },
  { name: 'Other', value: 2 },
];

// Sample lead conversion data
const leadConversionData = [
  { name: 'Lead', value: 126 },
  { name: 'Qualified Lead', value: 186 },
  { name: 'Conversion', value: 24 },
];

// Sample top movers
const topMovers = [
  { url: "/blog/seo-guide-2025", position: 1, change: 1, traffic: 4500, conversionRate: 28, revenue: 1260 },
  { url: "/services/technical-seo", position: 2, change: 0, traffic: 3200, conversionRate: 24, revenue: 768 },
  { url: "/case-studies/ecommerce", position: 3, change: -1, traffic: 2800, conversionRate: 20, revenue: 560 },
];

// Sample report content for demonstration
const sampleReportContent = {
  weekly: (
    <div className="space-y-6">
      {/* Quick Links - moved to top */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Quick Links</span>
          </div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ChartColumn className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">GSC Dashboard</span>
          </a>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Content Folder</span>
          </a>
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Backlink Sheet</span>
          </a>
        </div>
      </div>

      {/* What We Did - with icon */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>What We Did</span>
          </div>
        </h4>
        <div className="mt-2 space-y-2">
          <ul className="list-disc pl-5 space-y-2 text-base text-mediumGray">
            <li>Fixed schema markup on 3 product templates to fix Google warnings</li>
            <li>Implemented internal link improvements to 7 high-priority pages</li>
            <li>Created 5 new content briefs for upcoming articles</li>
            <li>Restructured header to improve mobile navigation</li>
            <li>Added conversion tracking to 2 landing page forms</li>
          </ul>
        </div>
      </div>

      {/* Analytics Snapshot - with icon */}
      <div className="card bg-white p-6 border-t-4 border-[#FCDC94] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <BarChart2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Analytics Snapshot</span>
          </div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 bg-[#F3F4FF] rounded-lg text-center">
            <p className="text-sm text-mediumGray mb-1">Organic Traffic</p>
            <div className="text-lg font-medium text-dark">5,250</div>
            <div className="text-xs text-green-600 font-medium">+12% WoW</div>
          </div>
          <div className="p-4 bg-[#F3F4FF] rounded-lg text-center">
            <p className="text-sm text-mediumGray mb-1">Conversions</p>
            <div className="text-lg font-medium text-dark">126</div>
            <div className="text-xs text-green-600 font-medium">+8% WoW</div>
          </div>
          <div className="p-4 bg-[#F3F4FF] rounded-lg text-center">
            <p className="text-sm text-mediumGray mb-1">Revenue Impact</p>
            <div className="text-lg font-medium text-dark">$4,200</div>
            <div className="text-xs text-green-600 font-medium">+8% WoW</div>
          </div>
        </div>
      </div>

      {/* Weekly Highlights - with icon */}
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
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5 mr-3">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Product comparison article now ranking on page 1</h6>
                <p className="text-sm text-mediumGray mt-1">
                  Our article "Best Widgets Comparison" moved from position #13 to #8, now driving significant traffic
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-0.5 mr-3">
                <Info className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Schema markup fixes improving CTR</h6>
                <p className="text-sm text-mediumGray mt-1">
                  After fixing product schema, CTR increased by 15% on key product pages
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps - with icon */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ArrowRight className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Next Steps</span>
          </div>
        </h4>
        <div className="mt-2 space-y-2">
          <ul className="list-disc pl-5 space-y-2 text-base text-mediumGray">
            <li>Continue optimizing product page meta descriptions for improved CTR</li>
            <li>Prepare content briefs for Q2 2025 editorial calendar</li>
            <li>Launch A/B test on homepage hero section</li>
            <li>Implement new backlink strategy focused on industry publications</li>
          </ul>
        </div>
      </div>
    </div>
  ),
  monthly: (
    <div className="space-y-6">
      {/* Quick Links - moved to top */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Quick Links</span>
          </div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ChartColumn className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">GSC Dashboard</span>
          </a>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Content Folder</span>
          </a>
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Backlink Sheet</span>
          </a>
        </div>
      </div>

      {/* Timeframe Covered */}

      {/* Executive Summary */}
      <div className="bg-lightGray p-5 rounded-lg">
        <div className="flex items-center mb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
            <MessageSquare className="h-5 w-5 text-[#9EA8FB]" />
          </div>
          <h4 className="text-lg font-medium text-dark">Executive Summary</h4>
        </div>
        <div className="mt-2 space-y-2">
          <p className="text-base text-mediumGray">
            Monthly comprehensive analysis of your SEO campaign performance,
            achievements, and strategic recommendations.
          </p>
        </div>
      </div>

      {/* Monthly Walkthrough Section - Add Loom video support */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#9EA8FB] shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
            <Video className="h-5 w-5 text-[#9EA8FB]" />
          </div>
          <h4 className="text-lg font-bold text-dark">Monthly Walkthrough</h4>
        </div>
        
        <div className="bg-gray-50 p-5 rounded-lg mb-4">
          <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center">
            <BiVideo size={48} className="text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-3 text-center">Embed a Loom video walkthrough of this month's performance</p>
            <Button variant="outline" size="sm">
              <BiVideo size={14} className="mr-1" />
              Embed Loom Video
            </Button>
          </div>
        </div>
        
        <div className="text-base text-mediumGray">
          <p className="mb-3">Key points covered in the video walkthrough:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Detailed analysis of traffic growth across key pages</li>
            <li>Breakdown of conversion rate improvements</li>
            <li>Deep dive into keyword movement and content performance</li>
            <li>Explanation of our strategy for next month</li>
          </ul>
        </div>
      </div>

      {/* Lead Tracking - New section */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#FCDC94] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Users className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <h4 className="text-lg font-bold text-dark">Lead Tracking</h4>
          </div>
          <div className="text-xs text-gray-500">
            <div className="flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>Data Source: Google Analytics + CRM</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">Lead Source Breakdown</h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSourceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">Lead Conversion Funnel</h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadConversionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#9ea8fb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-0.5 mr-3">
              <Info className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Improved Lead Tracking:</span> We've connected Google Analytics 4 with your CRM to provide more accurate lead attribution. This data is updated daily.
            </p>
          </div>
        </div>
      </div>

      {/* Channel Performance - Restored with modifications */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#9EA8FB] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <BarChart2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <h4 className="text-lg font-bold text-dark">Channel Performance</h4>
          </div>
          <div className="text-xs text-gray-500">
            <div className="flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>Data Source: Google Analytics</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-base font-medium text-dark mb-2">
              Organic Traffic
            </h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
            <h5 className="text-base font-medium text-dark mb-2">
              Leads & Revenue
            </h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyPerformanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="leads"
                    stroke="#9ea8fb"
                    name="Leads"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#fcdc94"
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-0.5 mr-3">
              <Info className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Note:</span> Leads and Revenue values are calculated estimates based on Average Revenue Per Visitor (ARPV) × Organic Traffic. These are projections and may vary from actual performance.
            </p>
          </div>
        </div>
        
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organic Traffic
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leads
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MoM Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyPerformanceData.map((month, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {month.month} 2025
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {month.clicks.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {month.leads.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${month.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {index > 0 ? (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        month.clicks > monthlyPerformanceData[index-1].clicks ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {month.clicks > monthlyPerformanceData[index-1].clicks ? '+' : ''}
                        {(((month.clicks - monthlyPerformanceData[index-1].clicks) / monthlyPerformanceData[index-1].clicks) * 100).toFixed(1)}%
                      </span>
                    ) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Projection - Restored with modifications */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#EADCFF] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <TrendingUp className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <h4 className="text-lg font-bold text-dark">Campaign Projection</h4>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Progress vs. Goals</h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">Traffic Goal</span>
                  <span className="text-sm font-medium text-dark">65%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#9EA8FB] h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">Revenue</span>
                  <span className="text-sm font-medium text-dark">42%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-[#EADCFF] h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">Time to Goal</h5>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-dark mb-1">Rank Improvements</div>
                <div className="text-xl font-bold text-dark">~3 weeks</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-dark mb-1">Traffic Goals</div>
                <div className="text-xl font-bold text-dark">~7 weeks</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-dark mb-1">Revenue Target</div>
                <div className="text-xl font-bold text-dark">~9 weeks</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-dark mb-1">ROI</div>
                <div className="text-xl font-bold text-green-600">257%</div>
              </div>
            </div>
            
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-0.5 mr-3">
                  <Info className="h-3 w-3 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700">
                  <span className="font-medium">Note:</span> Time to goal calculations are based on current trajectory and historical data. These are estimates and may vary based on market conditions and implementation speed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Wins & Cautions into separate sections */}
      {/* Wins Section */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-green-500 shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 mr-3">
            <ThumbsUp className="h-5 w-5 text-green-600" />
          </div>
          <h4 className="text-lg font-bold text-dark">Wins</h4>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5 mr-3">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Significant traffic growth to key product pages</h6>
                <p className="text-sm text-gray-600 mt-1">
                  +32% MoM increase in traffic to product category pages, driving 24% more conversions
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5 mr-3">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Technical SEO improvements paying off</h6>
                <p className="text-sm text-gray-600 mt-1">
                  Core Web Vitals improvements have led to 15% better engagement metrics and reduced bounce rate
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 mt-0.5 mr-3">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">New backlink strategy showing results</h6>
                <p className="text-sm text-gray-600 mt-1">
                  Secured 12 high-quality backlinks (avg. DR 55+) helping boost authority for competitive terms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cautions Section */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-amber-500 shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 mr-3">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <h4 className="text-lg font-bold text-dark">Cautions & Areas to Watch</h4>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 mt-0.5 mr-3">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Competitor activity increasing in primary market</h6>
                <p className="text-sm text-gray-600 mt-1">
                  Competitor A has launched an aggressive content campaign targeting our top keywords
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 mt-0.5 mr-3">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
              </div>
              <div>
                <h6 className="text-base font-medium text-dark">Mobile conversion rate lagging</h6>
                <p className="text-sm text-gray-600 mt-1">
                  While mobile traffic is up 24%, mobile conversion rate is only up 7% - opportunity for optimization
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Movers - Updated with new fields */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#EADCFF] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <TrendingUp className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <h4 className="text-lg font-bold text-dark">Content Movers</h4>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Pos.
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Traffic
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conv. %
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topMovers.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.url}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.change > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {page.change > 0 ? '+' : ''}{page.change}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.traffic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.conversionRate}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${page.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">
              Key Takeaways
            </h5>
            <p className="text-base text-mediumGray leading-relaxed">
              Opportunity to outrank Competitor B on Local SEO keywords where
              they've lost positions. Competitor A is gaining ground in Technical
              SEO - we should accelerate our content production in this area to
              maintain our advantage.
            </p>
          </div>
          
          {/* New screenshot upload section */}
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">
              SERP Screenshots
            </h5>
            <div className="bg-white border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <BiDownload size={32} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-3 text-center">Upload screenshots from Ahrefs, SEMrush, or other competitor analysis tools</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <BiDownload size={14} className="mr-1" />
                  Upload Screenshot
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Quarter Roadmap */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#9EA8FB] shadow-sm mt-6">
        <div className="flex items-center mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
            <MessageSquare className="h-5 w-5 text-[#9EA8FB]" />
          </div>
          <h4 className="text-lg font-bold text-dark">Next Quarter Roadmap</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">
              Where We Are Now
            </h5>
            <p className="text-base text-mediumGray mb-4 leading-relaxed">
              Strong foundation with improved technical performance, growing
              organic visibility, and established content production pipeline.
              Key conversion points optimized with clear user journeys.
            </p>
          </div>

          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">
              Where We're Heading Next
            </h5>
            <ul className="list-disc pl-6 text-base text-mediumGray space-y-2">
              <li>Expand content clusters around highest-converting topics</li>
              <li>Implement advanced schema markup across all key templates</li>
              <li>Launch targeted link building campaign for product pages</li>
              <li>Develop mobile-first conversion optimization strategy</li>
              <li>Implement automated reporting dashboard integration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE SECTION - Risks and Tradeoffs */}
      <div className="bg-white p-6 rounded-lg border-t-4 border-[#FCDC94] shadow-sm mt-6">
        <div className="flex items-center justify-between mb-4 cursor-pointer">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <BiErrorCircle className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <h4 className="text-lg font-bold text-dark">Risks and Tradeoffs</h4>
          </div>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
        <ul className="list-disc pl-6 text-base text-mediumGray space-y-3">
          <li>
            <span className="font-medium text-dark">Resource allocation:</span>{" "}
            Focusing on mobile optimization may slow content production
            temporarily
          </li>
          <li>
            <span className="font-medium text-dark">Competitive pressure:</span>{" "}
            Competitor A's aggressive content strategy requires us to maintain
            quality over quantity
          </li>
          <li>
            <span className="font-medium text-dark">Algorithm updates:</span>{" "}
            Recent Google updates suggest prioritizing user experience metrics
            over pure keyword targeting
          </li>
          <li>
            <span className="font-medium text-dark">Technical debt:</span>{" "}
            Legacy URL structure still impacts some sections - full migration
            recommended in Q3
          </li>
        </ul>
      </div>

      {/* TLDR */}
      <div className="bg-gray-50 p-6 rounded-lg mt-6">
        <div className="flex items-center mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
            <MessageSquare className="h-5 w-5 text-[#9EA8FB]" />
          </div>
          <h4 className="text-base font-medium text-dark">TL;DR</h4>
        </div>
        <p className="text-base text-mediumGray leading-relaxed">
          Q1 2025 delivered strong results across all KPIs with traffic up 42%
          YoY and leads up 38% YoY. Technical improvements and content quality
          drove performance gains. For Q2, we'll focus on mobile optimization,
          expanding high-converting content clusters, and targeted link building
          for product pages. Main risks include competitive pressure and
          potential algorithm updates favoring UX metrics.
        </p>
      </div>
    </div>
  ),
  quarterly: (
    <div className="space-y-6">
      {/* Quick Links - moved to top */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Quick Links</span>
          </div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ChartColumn className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">GSC Dashboard</span>
          </a>
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <FolderOpen className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Content Folder</span>
          </a>
          <a
            href="https://docs.google.com/spreadsheets"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <Link2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span className="text-base text-dark">Quarterly Strategy</span>
          </a>
        </div>
      </div>

      {/* Quarterly Performance Overview */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <BarChart2 className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Quarterly Performance Overview</span>
          </div>
        </h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={quarterlyPerformanceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="quarter" />
              <YAxis yAxisId="left" orientation="left" stroke="#9ea8fb" />
              <YAxis yAxisId="right" orientation="right" stroke="#fcdc94" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="traffic" name="Organic Traffic" fill="#9ea8fb" />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#fcdc94" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategic Initiatives */}
      <div className="card bg-white p-6 border-t-4 border-[#FCDC94] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <TrendingUp className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Strategic Initiatives</span>
          </div>
        </h4>
        <div className="mt-2 space-y-4">
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <h5 className="text-base font-medium text-dark mb-2">Content Cluster Development</h5>
            <p className="text-sm text-mediumGray">
              Developed 3 comprehensive content clusters around core service offerings, with 15 new supporting articles published this quarter.
            </p>
          </div>
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <h5 className="text-base font-medium text-dark mb-2">Technical SEO Infrastructure</h5>
            <p className="text-sm text-mediumGray">
              Completed site-wide technical audit and implemented Core Web Vitals optimizations, resulting in 32% improvement in page speed metrics.
            </p>
          </div>
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <h5 className="text-base font-medium text-dark mb-2">Backlink Acquisition Campaign</h5>
            <p className="text-sm text-mediumGray">
              Secured 28 high-quality backlinks (avg. DR 62) through strategic outreach and content partnerships.
            </p>
          </div>
        </div>
      </div>

      {/* ROI Analysis */}
      <div className="card bg-white p-6 border-t-4 border-[#EADCFF] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <LineChartIcon className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>ROI Analysis</span>
          </div>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">Investment Breakdown</h5>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Content Creation', value: 40 },
                      { name: 'Technical SEO', value: 25 },
                      { name: 'Link Building', value: 20 },
                      { name: 'Analytics & Reporting', value: 15 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {leadSourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-gray-50 p-5 rounded-lg">
            <h5 className="text-base font-medium text-dark mb-3">ROI Metrics</h5>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">Total Investment</span>
                  <span className="text-sm font-medium text-dark">$42,000</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">Attributed Revenue</span>
                  <span className="text-sm font-medium text-dark">$108,000</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">ROI</span>
                  <span className="text-sm font-medium text-green-600">257%</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-dark">Cost Per Acquisition</span>
                  <span className="text-sm font-medium text-dark">$124</span>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 mt-0.5 mr-3">
                    <Info className="h-3 w-3 text-blue-600" />
                  </div>
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">ROI Calculation:</span> Based on first-touch attribution model with 90-day lookback window. Revenue includes projected LTV for new customers acquired this quarter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Quarter Strategy */}
      <div className="card bg-white p-6 border-t-4 border-[#9EA8FB] rounded-lg shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F3F4FF] mr-3">
              <ArrowRight className="h-5 w-5 text-[#9EA8FB]" />
            </div>
            <span>Next Quarter Strategy</span>
          </div>
        </h4>
        <div className="mt-2 space-y-2">
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <h5 className="text-base font-medium text-dark mb-2">Focus Areas</h5>
            <ul className="list-disc pl-5 space-y-2 text-base text-mediumGray">
              <li>Expand content clusters with 6 new pillar pages targeting high-value keywords</li>
              <li>Implement structured data enhancements across all product categories</li>
              <li>Launch targeted link building campaign for key service pages</li>
              <li>Develop conversion rate optimization strategy for mobile users</li>
              <li>Implement automated reporting dashboard for real-time performance tracking</li>
            </ul>
          </div>
          <div className="p-4 bg-[#F5F5F9] rounded-lg">
            <h5 className="text-base font-medium text-dark mb-2">Key Performance Targets</h5>
            <ul className="list-disc pl-5 space-y-2 text-base text-mediumGray">
              <li>Increase organic traffic by 25% quarter-over-quarter</li>
              <li>Improve conversion rate from organic traffic by 15%</li>
              <li>Secure 30+ high-quality backlinks (DR 60+)</li>
              <li>Achieve first-page rankings for 10 additional target keywords</li>
              <li>Reduce mobile bounce rate by 20%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  ),
};

// Slack Share Modal Component
// ... rest of the file remains unchanged ...

export default function Reports() {
  const [activeTab, setActiveTab] = useState("weekly");
  const [selectedReport, setSelectedReport] = useState<number | null>(1);
  const [reportContent, setReportContent] = useState<React.ReactNode | null>(
    null
  );
  const [selectedMonth, setSelectedMonth] = useState(monthFilterOptions[0]);
  const [filteredReports, setFilteredReports] = useState({
    weekly: reports.weekly,
    monthly: reports.monthly,
    quarterly: reports.quarterly,
  });
  const [isSlackModalOpen, setIsSlackModalOpen] = useState(false);

  // Reference for sticky header
  const headerRef = useRef<HTMLDivElement>(null);

  // Set initial report content and apply filters
  useEffect(() => {
    // Filter reports based on selected month
    if (selectedMonth.value !== "all") {
      setFilteredReports({
        weekly: reports.weekly.filter(
          (report) => report.month === selectedMonth.value
        ),
        monthly: reports.monthly.filter(
          (report) => report.month === selectedMonth.value
        ),
        quarterly: reports.quarterly, // Quarterly reports aren't filtered by month
      });
    } else {
      setFilteredReports({
        weekly: reports.weekly,
        monthly: reports.monthly,
        quarterly: reports.quarterly,
      });
    }
  }, [selectedMonth]);

  // Set initial report content
  useEffect(() => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];

    if (currentReports.length > 0) {
      setSelectedReport(currentReports[0].id);

      if (activeTab === "weekly") {
        setReportContent(sampleReportContent.weekly);
      } else if (activeTab === "monthly") {
        setReportContent(sampleReportContent.monthly);
      } else if (activeTab === "quarterly") {
        setReportContent(sampleReportContent.quarterly);
      }
    } else {
      setSelectedReport(null);
      setReportContent(null);
    }
  }, [activeTab, filteredReports]);

  // Handle report selection
  const handleReportSelect = (reportId: number, type: string) => {
    setSelectedReport(reportId);

    // Set sample content based on report type
    if (type === "weekly") {
      setReportContent(sampleReportContent.weekly);
    } else if (type === "monthly") {
      setReportContent(sampleReportContent.monthly);
    } else if (type === "quarterly") {
      setReportContent(sampleReportContent.quarterly);
    }
  };

  // Handle month filter change
  const handleMonthChange = (value: string) => {
    // Extract month and year from the format "Month Year" (e.g., "January 2025")
    if (value.includes(" ")) {
      const [month, year] = value.split(" ");
      // Convert to the format used in monthFilterOptions (e.g., "2025-01")
      const monthNumber = {
        January: "01",
        February: "02",
        March: "03",
        April: "04",
        May: "05",
        June: "06",
        July: "07",
        August: "08",
        September: "09",
        October: "10",
        November: "11",
        December: "12",
      }[month];

      if (monthNumber && year) {
        const optionValue = `${year}-${monthNumber}`;
        const selected = monthFilterOptions.find(
          (option) => option.value === optionValue
        );
        if (selected) {
          setSelectedMonth(selected);
        } else {
          // Fallback to "all" if we can't find a matching option
          setSelectedMonth(monthFilterOptions[0]);
        }
      }
    } else {
      // Handle the old format for backward compatibility
      const selected = monthFilterOptions.find(
        (option) => option.value === value
      );
      if (selected) {
        setSelectedMonth(selected);
      }
    }
  };

  // Handle Slack share
  const handleSlackShare = () => {
    setIsSlackModalOpen(true);
  };

  // Navigate to previous report
  const navigateToPreviousReport = () => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    if (!selectedReport || currentReports.length <= 1) return;

    const currentIndex = currentReports.findIndex(
      (report) => report.id === selectedReport
    );
    if (currentIndex > 0) {
      const previousReport = currentReports[currentIndex - 1];
      handleReportSelect(previousReport.id, activeTab);
    }
  };

  // Navigate to next report
  const navigateToNextReport = () => {
    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    if (!selectedReport || currentReports.length <= 1) return;

    const currentIndex = currentReports.findIndex(
      (report) => report.id === selectedReport
    );
    if (currentIndex < currentReports.length - 1) {
      const nextReport = currentReports[currentIndex + 1];
      handleReportSelect(nextReport.id, activeTab);
    }
  };

  // Get current report title
  const getCurrentReportTitle = () => {
    if (!selectedReport) return "";

    const currentReports =
      filteredReports[activeTab as keyof typeof filteredReports];
    const report = currentReports.find((r) => r.id === selectedReport);
    return report?.title || "";
  };

  return (
    <DashboardLayout
      topNavBarProps={{
        selectedMonth: selectedMonth.label,
        onMonthChange: handleMonthChange,
      }}
    >
      <PageContainer className="w-full">
        <div ref={headerRef} className="sticky top-0 z-20 bg-white">
          <PageContainerTabs>
            <div className="tab-navigation">
              <div className="flex justify-between items-center w-full">
                <div className="flex overflow-x-auto">
                  <TabNavigation
                    tabs={[
                      { id: "weekly", label: "Weekly", icon: <Calendar size={18} /> },
                      { id: "monthly", label: "Monthly", icon: <Calendar size={18} /> },
                      { id: "quarterly", label: "Quarterly", icon: <Calendar size={18} /> },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          </PageContainerTabs>
        </div>

        <PageContainerBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Report List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-dark">
                    {activeTab === "weekly" && "Weekly Reports"}
                    {activeTab === "monthly" && "Monthly Reports"}
                    {activeTab === "quarterly" && "Quarterly Reports"}
                  </h2>
                </div>

                <div className="space-y-4">
                  {activeTab === "weekly" && filteredReports.weekly.length > 0
                    ? filteredReports.weekly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "weekly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "weekly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No weekly reports found for the selected filters.
                        </p>
                      </div>
                    )}

                  {activeTab === "monthly" && filteredReports.monthly.length > 0
                    ? filteredReports.monthly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "monthly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "monthly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No monthly reports found for the selected filters.
                        </p>
                      </div>
                    )}

                  {activeTab === "quarterly" &&
                    filteredReports.quarterly.length > 0
                    ? filteredReports.quarterly.map((report) => (
                      <div
                        key={report.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${selectedReport === report.id
                            ? "bg-white border-4 border-[#9EA8FB]"
                            : "bg-white border-4 border-[#F5F5F9] hover:border-[#9EA8FB]/50"
                          }`}
                        onClick={() =>
                          handleReportSelect(report.id, "quarterly")
                        }
                      >
                        <p
                          className={`text-base ${selectedReport === report.id
                              ? "font-medium text-primary"
                              : "text-dark"
                            }`}
                        >
                          {report.title}
                        </p>
                        <div className="flex items-center mt-2">
                          <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                          <p className="text-sm text-mediumGray">
                            {report.date}
                          </p>
                        </div>
                      </div>
                    ))
                    : activeTab === "quarterly" && (
                      <div className="p-4 bg-white rounded-lg border-4 border-[#F5F5F9] shadow-sm text-center">
                        <p className="text-mediumGray">
                          No quarterly reports found for the selected filters.
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 z-10">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      className={`mr-3 ${!selectedReport ||
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].findIndex((r) => r.id === selectedReport) <= 0
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#9EA8FB]/10"
                        }`}
                      onClick={navigateToPreviousReport}
                      disabled={
                        !selectedReport ||
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].findIndex((r) => r.id === selectedReport) <= 0
                      }
                    >
                      <ChevronDown className="h-5 w-5 transform -rotate-90" />
                    </Button>
                    <h2 className="text-lg md:text-xl font-medium text-dark">
                      {activeTab === "weekly" &&
                        selectedReport &&
                        filteredReports.weekly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                      {activeTab === "monthly" &&
                        selectedReport &&
                        filteredReports.monthly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                      {activeTab === "quarterly" &&
                        selectedReport &&
                        filteredReports.quarterly.find(
                          (r) => r.id === selectedReport
                        )?.title}
                    </h2>
                    <Button
                      variant="ghost"
                      className={`ml-3 ${!selectedReport ||
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].findIndex((r) => r.id === selectedReport) >=
                          filteredReports[
                            activeTab as keyof typeof filteredReports
                          ].length -
                          1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#9EA8FB]/10"
                        }`}
                      onClick={navigateToNextReport}
                      disabled={
                        !selectedReport ||
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].findIndex((r) => r.id === selectedReport) >=
                        filteredReports[
                          activeTab as keyof typeof filteredReports
                        ].length -
                        1
                      }
                    >
                      <ChevronDown className="h-5 w-5 transform rotate-90" />
                    </Button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="mt-6">{reportContent}</div>
              </div>
            </div>
          </div>
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
}
