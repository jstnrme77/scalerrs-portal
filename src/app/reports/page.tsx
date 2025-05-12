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
  BiCheckCircle,
  BiErrorCircle,
  BiMessageRoundedDetail,
  BiCalendarCheck,
  BiDownload,
  BiLinkExternal,
  BiFilter,
  BiChevronLeft,
  BiChevronRight,
  BiChevronDown,
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

// Sample report content for demonstration
const sampleReportContent = {
  weekly: (
    <div className="space-y-6">
      {/* Timeframe Covered */}

      {/* What We Did */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-medium text-dark mb-4">What We Did</h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Content</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Published 3 new blog posts targeting high-intent keywords</li>
              <li>
                Updated 2 existing pages with fresh content and improved CTAs
              </li>
              <li>Created 5 new content briefs for upcoming articles</li>
            </ul>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">SEO</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Fixed 12 broken internal links</li>
              <li>Improved page load speed on 5 key landing pages</li>
              <li>Implemented schema markup on product pages</li>
            </ul>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">Links</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Secured 4 new backlinks from DA 40+ websites</li>
              <li>Initiated outreach to 15 potential link partners</li>
              <li>Completed 3 guest post drafts for submission</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deliverable Progress */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-medium text-dark mb-4">
          Deliverable Progress
        </h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">
              Content Briefs Sent
            </h5>
            <div className="space-y-3">
              {sampleBriefs.map((brief) => (
                <div
                  key={brief.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-base font-medium text-dark">
                      {brief.title}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge
                      variant={brief.status === "Sent" ? "success" : "warning"}
                      className="text-sm px-3 py-1"
                    >
                      {brief.status}
                    </Badge>
                    <a
                      href={brief.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <BiLinkExternal size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">
              Articles Published
            </h5>
            <div className="space-y-3">
              {sampleArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-base font-medium text-dark">
                      {article.title}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success" className="text-sm px-3 py-1">
                      {article.status}
                    </Badge>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80"
                    >
                      <BiLinkExternal size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">
              Backlinks Live
            </h5>
            <div className="space-y-3">
              {sampleBacklinks.map((backlink) => (
                <div
                  key={backlink.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded"
                >
                  <div>
                    <p className="text-base font-medium text-dark">
                      {backlink.source}
                    </p>
                    <p className="text-sm text-mediumGray">
                      Target: {backlink.targetUrl}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="info" className="text-sm px-3 py-1">
                      DR {backlink.dr}
                    </Badge>
                    <Badge variant="success" className="text-sm px-3 py-1">
                      {backlink.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps & Requests */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-medium text-dark mb-4">
          Next Steps & Requests
        </h4>

        <div className="space-y-3">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">
              Tasks for Next Week
            </h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Complete technical SEO audit for the new product section</li>
              <li>Publish 2 new case studies targeting competitive keywords</li>
              <li>Finalize content calendar for Q2 2025</li>
            </ul>
          </div>

          <div className="p-6 rounded-lg border-4 border-[#9EA8FB] bg-[#9EA8FB]/10 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-dark text-lg mb-1 notification-text">Action Required</p>
                <ul className="list-disc pl-6 text-base text-mediumGray">
                  <li className="font-medium">
                    Review "Top 10 SEO Strategies for 2025" brief by May 2nd
                  </li>
                  <li className="font-medium">
                    Provide feedback on the new homepage design mockup
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-4">Quick Links</h4>

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
    </div>
  ),
  monthly: (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-lightGray p-5 rounded-lg">
        <div className="mt-2 space-y-2">
          <p className="text-base text-mediumGray">
            Monthly comprehensive analysis of your SEO campaign performance,
            achievements, and strategic recommendations.
          </p>
        </div>
      </div>

      {/* Loom Section */}
      <div className="bg-white p-4 rounded-3x">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
            <BiMessageRoundedDetail size={16} className="text-gray-500" />
          </div>
          <h4 className="font-medium text-dark">Monthly Walkthrough</h4>
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-mediumGray">Loom video walkthrough</p>
            <Button variant="outline" size="sm" className="mt-2">
              <BiLinkExternal size={14} className="mr-1" />
              Watch Video
            </Button>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white p-4">
        <h4 className="text-lg font-bold text-dark mb-3">
          Channel Performance
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">
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
                  <Bar
                    dataKey="impressions"
                    fill="#fcdc94"
                    name="Impressions"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">
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
      </div>

      {/* Average Keyword Position */}
      <div className="bg-white p-4">
        <h4 className="text-lg font-bold text-dark mb-3">
          Average Keyword Position
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-5 rounded-lg flex flex-col items-center justify-center">
            <h5 className="text-base font-medium text-dark mb-2">
              Current Visibility
            </h5>
            <div className="text-4xl font-bold text-dark">42.3</div>
            <div className="text-sm text-[#9EA8FB] font-medium">+4.1</div>
          </div>
          <div className="bg-gray-50 p-5 rounded-lg flex flex-col items-center justify-center">
            <h5 className="text-base font-medium text-dark mb-2">
              vs. Competition
            </h5>
            <div className="text-4xl font-bold text-dark">38.7</div>
            <div className="text-sm text-[#9EA8FB] font-medium">+9%</div>
          </div>
        </div>
      </div>

      {/* Deliverables Recap */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h4
          style={{
            fontWeight: 600,
            marginBottom: "16px",
            fontSize: "16px",
            color: "#111827",
          }}
        >
          Deliverables Recap
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "16px",
          }}
        >
          {/* Briefs Delivered */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Briefs Delivered
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              12
            </div>
            <div
              style={{
                width: "100%",
                backgroundColor: "#e5e7eb",
                borderRadius: "9999px",
                height: "6px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "80%",
                  backgroundColor: "#9ea8fb",
                  borderRadius: "9999px",
                  left: 0,
                  top: 0,
                }}
              ></div>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4b5563",
                marginTop: "8px",
              }}
            >
              80% of monthly target
            </div>
          </div>

          {/* Blogs Published */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Blogs Published
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              8
            </div>
            <div
              style={{
                width: "100%",
                backgroundColor: "#e5e7eb",
                borderRadius: "9999px",
                height: "6px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "100%",
                  backgroundColor: "#fcdc94",
                  borderRadius: "9999px",
                  left: 0,
                  top: 0,
                }}
              ></div>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4b5563",
                marginTop: "8px",
              }}
            >
              100% of monthly target
            </div>
          </div>

          {/* Backlinks Live */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Backlinks Live
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              15
            </div>
            <div
              style={{
                width: "100%",
                backgroundColor: "#e5e7eb",
                borderRadius: "9999px",
                height: "6px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  height: "100%",
                  width: "125%", // Showing 125% completion
                  backgroundImage:
                    "linear-gradient(to right, #eadcff 80%, #d4bfff 80%)", // Gradient effect to show overflow
                  borderRadius: "9999px",
                  left: 0,
                  top: 0,
                }}
              ></div>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4b5563",
                marginTop: "8px",
              }}
            >
              125% of monthly target
            </div>
          </div>
        </div>
      </div>

      {/* Content Movers */}
      <div className="bg-white p-4">
        <h4 className="text-lg font-bold text-dark mb-3">Content Movers</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  Traffic
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  Leads
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                >
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformingPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                    {page.url}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-black">
                    {page.traffic}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-black">
                    {page.conversions}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium ${page.delta > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {page.delta > 0 ? "+" : ""}
                      {page.delta}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyword & SERP Trends */}
      <div className="bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-4">
          Keyword & SERP Trends
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Keyword Position Movement - Left Column */}
          <div className="bg-white p-5 rounded-lg">
            <h5 className="font-medium text-dark mb-4">Keywords</h5>

            <div className="space-y-4">
              {/* Position 1-3 */}
              <div className="flex items-center">
                <div className="w-24 text-sm mr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-lg"
                      style={{ backgroundColor: "#9ea8fb" }}
                    ></div>
                    <span>
                      Position
                      <br />
                      1-3
                    </span>
                  </div>
                </div>
                <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "25%", backgroundColor: "#9ea8fb" }}
                  ></div>
                </div>
                <div className="text-right ml-4">
                  <span className="font-medium">42 keywords</span>
                  <span className="ml-1 text-[#9ea8fb]">+8 (+23%)</span>
                </div>
              </div>

              {/* Position 4-10 */}
              <div className="flex items-center">
                <div className="w-24 text-sm mr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#fcdc94" }}
                    ></div>
                    <span>
                      Position
                      <br />
                      4-10
                    </span>
                  </div>
                </div>
                <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "45%", backgroundColor: "#fcdc94" }}
                  ></div>
                </div>
                <div className="text-right ml-4">
                  <span className="font-medium">78 keywords</span>
                  <span className="ml-1 text-[#9ea8fb]">+12 (+18%)</span>
                </div>
              </div>

              {/* Position 11-20 */}
              <div className="flex items-center">
                <div className="w-24 text-sm mr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#eadcff" }}
                    ></div>
                    <span>
                      Position
                      <br />
                      11-20
                    </span>
                  </div>
                </div>
                <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "70%", backgroundColor: "#eadcff" }}
                  ></div>
                </div>
                <div className="text-right ml-4">
                  <span className="font-medium">124 keywords</span>
                  <span className="ml-1 text-[#9ea8fb]">(+14%)</span>
                </div>
              </div>

              {/* Position 21-50 */}
              <div className="flex items-center">
                <div className="w-24 text-sm mr-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: "#ff9d7d" }}
                    ></div>
                    <span>
                      Position
                      <br />
                      21-50
                    </span>
                  </div>
                </div>
                <div className="flex-grow h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: "55%", backgroundColor: "#ff9d7d" }}
                  ></div>
                </div>
                <div className="text-right ml-4">
                  <span className="font-medium">96 keywords</span>
                  <span className="ml-1 text-red-500">-7 (-7%)</span>
                </div>
              </div>

              {/* Total Tracked Keywords */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between">
                  <span className="font-medium">Total Tracked Keywords</span>
                  <div>
                    <span className="font-bold text-dark text-lg">340</span>
                    <span className="text-[#9ea8fb] ml-2 text-sm">
                      +18 this month
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Average Keyword Position - Right Column */}
          <div className="bg-white p-5 rounded-lg">
            <h5 className="font-medium text-dark mb-4">
              Average Keyword Position
            </h5>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { week: "Week 1", visibility: 32, competitor: 30 },
                    { week: "Week 2", visibility: 35, competitor: 31 },
                    { week: "Week 3", visibility: 38, competitor: 32 },
                    { week: "Week 4", visibility: 41, competitor: 34 },
                    { week: "Week 5", visibility: 42, competitor: 35 },
                  ]}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f5f5f5"
                  />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} />
                  <YAxis
                    domain={[25, 45]}
                    axisLine={false}
                    tickLine={false}
                    orientation="right"
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="visibility"
                    stroke="#9ea8fb"
                    name="Your visibility"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "#9ea8fb",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                  {/* Add separate line for competitor */}
                  <Line
                    type="monotone"
                    dataKey="competitor"
                    stroke="#eadcff"
                    name="Competitor avg."
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{
                      r: 4,
                      fill: "#eadcff",
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion & ROI Metrics */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h4
          style={{
            fontWeight: 700,
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Conversion & ROI Metrics
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {/* Lead Generation */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Lead Generation
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "4px",
                color: "#111827",
              }}
            >
              320
            </div>
            <div className="metric-positive">+15.2% vs. March</div>
          </div>

          {/* Assisted Conversions */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Assisted Conversions
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "4px",
                color: "#111827",
              }}
            >
              86
            </div>
            <div className="metric-positive">+9.8% vs. March</div>
          </div>

          {/* CPC Equivalence */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              CPC Equivalence
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "4px",
                color: "#111827",
              }}
            >
              $24,800
            </div>
            <div className="metric-positive">+12.5% vs. March</div>
          </div>

          {/* Bounce Rate - for bounce rate, increase ("+") is bad, decrease ("-") is good */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              Bounce Rate
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                marginBottom: "4px",
                color: "#111827",
              }}
            >
              48.2%
            </div>
            <div className="metric-negative">+2.1% vs. March</div>
          </div>
        </div>
      </div>

      {/* Campaign Projection */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h4
          style={{
            fontWeight: 700,
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Campaign Projection
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div>
            <h5
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Progress vs. Goals
            </h5>

            <div style={{ marginBottom: "24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#9ea8fb",
                      marginRight: "8px",
                    }}
                  ></div>
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    Traffic Goal
                  </span>
                </div>
                <div
                  style={{
                    flex: "1",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "9999px",
                    height: "6px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "65%",
                      backgroundColor: "#9ea8fb",
                      borderRadius: "9999px",
                      left: 0,
                      top: 0,
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    width: "40px",
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#374151",
                    marginLeft: "8px",
                  }}
                >
                  65%
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "8px",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#fcdc94",
                      marginRight: "8px",
                    }}
                  ></div>
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    Lead Goal
                  </span>
                </div>
                <div
                  style={{
                    flex: "1",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "9999px",
                    height: "6px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "78%",
                      backgroundColor: "#fcdc94",
                      borderRadius: "9999px",
                      left: 0,
                      top: 0,
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    width: "40px",
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#374151",
                    marginLeft: "8px",
                  }}
                >
                  78%
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "100px",
                    display: "flex",
                    alignItems: "center",
                    marginRight: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "#eadcff",
                      marginRight: "8px",
                    }}
                  ></div>
                  <span style={{ fontSize: "14px", color: "#374151" }}>
                    Revenue
                  </span>
                </div>
                <div
                  style={{
                    flex: "1",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "9999px",
                    height: "6px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "42%",
                      backgroundColor: "#eadcff",
                      borderRadius: "9999px",
                      left: 0,
                      top: 0,
                    }}
                  ></div>
                </div>
                <div
                  style={{
                    width: "40px",
                    textAlign: "right",
                    fontSize: "14px",
                    color: "#374151",
                    marginLeft: "8px",
                  }}
                >
                  42%
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Time to Goal
            </h5>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Rank Improvements
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ~3 weeks
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Traffic Goals
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ~7 weeks
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Lead Growth
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ~4 weeks
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "16px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    marginBottom: "8px",
                    color: "#374151",
                  }}
                >
                  Revenue Target
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: 700,
                    color: "#111827",
                  }}
                >
                  ~9 weeks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wins & Cautions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "24px" }}>
          {/* Wins Card */}
          <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", color: "#111827", fontSize: "18px" }}>
              <span style={{ width: "24px", height: "24px", backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}>
                <BiCheckCircle style={{ color: "#111827" }} size={18} />
              </span>
              Wins
            </h4>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px", color: "#111827" }}>
              <li style={{ marginBottom: "4px" }}>4 new keywords entered top 3 positions</li>
              <li style={{ marginBottom: "4px" }}>15% increase in lead generation MoM</li>
              <li style={{ marginBottom: "4px" }}>Page speed improvements reduced bounce rate by 12%</li>
              <li>New content cluster outperforming expectations by 25%</li>
            </ul>
          </div>

          {/* Cautions Card */}
          <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "12px", display: "flex", alignItems: "center", color: "#111827", fontSize: "18px" }}>
              <span style={{ width: "24px", height: "24px", backgroundColor: "rgba(0, 0, 0, 0.1)", borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "8px" }}>
                <BiErrorCircle style={{ color: "#111827" }} size={18} />
              </span>
              Cautions
            </h4>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px", color: "#111827" }}>
              <li style={{ marginBottom: "4px" }}>3 core product pages lost rankings (-5 positions)</li>
              <li style={{ marginBottom: "4px" }}>Home page load time increased by 0.8s</li>
              <li style={{ marginBottom: "4px" }}>Competitor launched new content hub in our space</li>
              <li>Mobile conversion rate dropped 2.3% MoM</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations + Next Steps */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <h4
          style={{
            fontWeight: 700,
            marginBottom: "16px",
            fontSize: "18px",
            color: "#111827",
          }}
        >
          Recommendations + Next Steps
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px",
          }}
        >
          <div>
            <h5
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Priority Actions
            </h5>
            <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
              <ol style={{ listStyleType: "decimal", paddingLeft: "20px", color: "#111827" }}>
                <li style={{ marginBottom: "8px" }}>Implement mobile UX improvements to increase conversion rate</li>
                <li style={{ marginBottom: "8px" }}>Accelerate content production to catch up on brief schedule</li>
                <li>Focus link building efforts on 3 keywords that lost positions</li>
              </ol>
            </div>
          </div>

          <div>
            <h5
              style={{
                fontSize: "14px",
                fontWeight: 500,
                marginBottom: "16px",
                color: "#374151",
              }}
            >
              Strategic Adjustments
            </h5>
            <div style={{ backgroundColor: "#f9fafb", padding: "16px", borderRadius: "8px" }}>
              <p style={{ color: "#111827", fontSize: "16px" }}>
                Based on current trajectory, we recommend shifting 20% of content resources to focus on mobile optimization and conversion rate improvements to ensure we meet Q2 goals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  quarterly: (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="p-6g">
        {/* 3 Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-600">
              Traffic Growth
            </h4>
            <div className="mt-2">
              <div className="text-4xl font-bold text-[#9EA8FB]">61,000</div>
              <div className="text-xs text-gray-500 mt-1">Target: 65,000</div>
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>42% YoY</span>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium ml-3">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>17% QoQ</span>
              </div>
            </div>
            {/* Micro-visual: Sparkline */}
            <div className="mt-3 h-8">
              <div className="flex items-end space-x-1 h-full">
                {[35, 45, 55, 65, 75, 80, 90, 95].map((value, i) => (
                  <div
                    key={i}
                    className="w-full bg-[#9EA8FB]/50 rounded-sm"
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-600">
              Leads Generated
            </h4>
            <div className="mt-2">
              <div className="text-4xl font-bold text-[#FFE4A6]">1,350</div>
              <div className="text-xs text-gray-500 mt-1">Target: 1,500</div>
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>38% YoY</span>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium ml-3">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>17% QoQ</span>
              </div>
            </div>
            {/* Micro-visual: Sparkline */}
            <div className="mt-3 h-8">
              <div className="flex items-end space-x-1 h-full">
                {[40, 50, 60, 70, 75, 85, 90, 95].map((value, i) => (
                  <div
                    key={i}
                    className="w-full bg-[#FFE4A6]/50 rounded-sm"
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-600">
              Revenue Impact
            </h4>
            <div className="mt-2">
              <div className="text-4xl font-bold text-[#EADCFF]">$108,000</div>
              <div className="text-xs text-gray-500 mt-1">Target: $120,000</div>
            </div>
            <div className="flex items-center mt-3">
              <div className="flex items-center text-green-600 text-sm font-medium">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>39% YoY</span>
              </div>
              <div className="flex items-center text-green-600 text-sm font-medium ml-3">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>17% QoQ</span>
              </div>
            </div>
            {/* Micro-visual: Sparkline */}
            <div className="mt-3 h-8">
              <div className="flex items-end space-x-1 h-full">
                {[45, 55, 65, 70, 75, 80, 85, 90].map((value, i) => (
                  <div
                    key={i}
                    className="w-full bg-[#EADCFF]/50 rounded-sm"
                    style={{ height: `${value}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Text Summary - Moved TLDR below KPIs */}
        <div className="bg-white p-6 ">
          <h4 className="text-lg font-bold text-dark mb-3">
            Executive Summary
          </h4>
          <p className="text-base text-mediumGray leading-relaxed">
            Q1 2025 has shown strong performance across all key metrics with
            significant year-over-year growth. Our focus on content quality and
            technical improvements has yielded substantial increases in organic
            traffic, while conversion rate optimizations have successfully
            translated this traffic into leads and revenue.
          </p>
        </div>

        {/* Trendline Chart */}
        <div className="bg-white p-5  mt-6">
          <h4 className="text-lg font-bold text-dark mb-4">
            Performance Trends (Last 4 Quarters)
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={quarterlyPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="quarter" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="traffic"
                  stroke="#9ea8fb"
                  name="Traffic"
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="leads"
                  stroke="#fcdc94"
                  name="Leads"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#eadcff"
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Traffic & Revenue */}
      <div className="bg-white p-6 ">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-bold text-dark">Traffic & Revenue</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Metric
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    Q1 2025
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  Q4 2024
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    QoQ Change
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider"
                >
                  Q1 2024
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center">
                    YoY Change
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                  Organic Traffic
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  61,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  52,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +17.3%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  43,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +41.9%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                  Leads Generated
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  1,350
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  1,150
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +17.4%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  980
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +37.8%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                  Conversion Rate
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  2.2%
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  2.1%
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +4.8%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  1.9%
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +15.8%
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                  Revenue Impact
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  $108,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  $92,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +17.4%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                  $78,000
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-green-100 text-green-800">
                    +38.5%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deliverables Roll Up */}
      <div className="bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-5">
          Deliverables Roll Up
        </h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <FolderOpen size={16} className="text-dark" />
            </div>
            <div>
              <p className="text-base font-medium text-dark">
                36 briefs delivered
              </p>
              <p className="text-sm text-mediumGray">
                100% of quarterly target
              </p>
            </div>
            <div className="ml-auto">
              <a
                href="/deliverables?tab=briefs"
                className="text-primary hover:underline text-sm flex items-center"
              >
                <span>View All</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center mr-3">
              <BiMessageRoundedDetail size={16} className="text-dark" />
            </div>
            <div>
              <p className="text-base font-medium text-dark">
                24 articles published
              </p>
              <p className="text-sm text-mediumGray">
                Average word count: 1,850
              </p>
            </div>
            <div className="ml-auto">
              <a
                href="/deliverables?tab=articles"
                className="text-primary hover:underline text-sm flex items-center"
              >
                <span>View All</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center mr-3">
              <Link2 size={16} className="text-dark" />
            </div>
            <div>
              <p className="text-base font-medium text-dark">
                45 backlinks secured
              </p>
              <p className="text-sm text-mediumGray">Average DR: 58</p>
            </div>
            <div className="ml-auto">
              <a
                href="/deliverables?tab=backlinks"
                className="text-primary hover:underline text-sm flex items-center"
              >
                <span>View All</span>
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Pages */}
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-bold text-dark">Top Performing Pages</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider"
                >
                  URL
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider cursor-pointer hover:bg-[#9EA8FB]/20"
                >
                  <div className="flex items-center">
                    Traffic
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider cursor-pointer hover:bg-[#9EA8FB]/20"
                >
                  <div className="flex items-center">
                    Conversions
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider cursor-pointer hover:bg-[#9EA8FB]/20"
                >
                  <div className="flex items-center">
                    Change
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformingPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                    {page.url}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-black">
                    {page.traffic}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-black">
                    {page.conversions}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-sm font-medium ${page.delta > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {page.delta > 0 ? "+" : ""}
                      {page.delta}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experiments */}
      <div className="bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-5">Experiments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4FF] mb-4">
                <ChartColumn className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <p className="text-base font-medium text-dark text-center">Title Tag Tests</p>
              <p className="text-sm text-mediumGray mt-2 text-center">
                CTR +1.7 percentage points
              </p>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4FF] mb-4">
                <MessageSquare className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <p className="text-base font-medium text-dark text-center">
                Mobile CTA Placement
              </p>
              <p className="text-sm text-mediumGray mt-2 text-center">
                Conversion +0.8 percentage points
              </p>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4FF] mb-4">
                <Link2 className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <p className="text-base font-medium text-dark text-center">Core Web Vitals</p>
              <p className="text-sm text-mediumGray mt-2 text-center">
                Bounce rate -15% on key pages
              </p>
            </div>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg">
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#F3F4FF] mb-4">
                <FolderOpen className="h-6 w-6 text-[#9EA8FB]" />
              </div>
              <p className="text-base font-medium text-dark text-center">
                Content Length Test
              </p>
              <p className="text-sm text-mediumGray mt-2 text-center">
                Long-form +32% more conversions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Next Quarter Roadmap */}
      <div className="bg-white p-6">
        <h4 className="text-lg font-bold text-dark mb-5">
          Next Quarter Roadmap
        </h4>
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
              Where We&apos;re Heading Next
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

      {/* Competitor Intel */}
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-5">
          <h4 className="text-lg font-bold text-dark">Competitor Intel</h4>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="text-xs">
              <Filter className="h-3 w-3 mr-1" />
              Sort by Rank Change
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider"
                >
                  Competitor
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider"
                >
                  Keyword Focus
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center">
                    Rank Change (QoQ)
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-4 text-left text-sm font-medium text-dark uppercase tracking-wider"
                >
                  Notable Activity
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitorData.map((competitor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">
                    {competitor.name}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                    {competitor.keywordFocus}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-medium ${competitor.rankChange > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                        }`}
                    >
                      {competitor.rankChange > 0 ? "+" : ""}
                      {competitor.rankChange}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">
                    {competitor.activity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </div>

      {/* Risk and Tradeoffs */}
      <div className="bg-white p-6 mb-6">
        <h4 className="text-lg font-bold text-dark mb-4">
          Risks and Tradeoffs
        </h4>
        <ul className="list-disc pl-6 text-base text-mediumGray space-y-3">
          <li>
            <span className="font-medium text-dark">Resource allocation:</span>{" "}
            Focusing on mobile optimization may slow content production
            temporarily
          </li>
          <li>
            <span className="font-medium text-dark">Competitive pressure:</span>{" "}
            Competitor A&apos;s aggressive content strategy requires us to maintain
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

      {/* TL;DR */}
      <div className="bg-gray-50 p-6">
        <h4 className="text-base font-medium text-dark mb-2">TL;DR</h4>
        <p className="text-base text-mediumGray leading-relaxed">
          Q1 2025 delivered strong results across all KPIs with traffic up 42%
          YoY and leads up 38% YoY. Technical improvements and content quality
          drove performance gains. For Q2, we&apos;ll focus on mobile optimization,
          expanding high-converting content clusters, and targeted link building
          for product pages. Main risks include competitive pressure and
          potential algorithm updates favoring UX metrics.
        </p>
      </div>
    </div>
  ),
};

// Slack Share Modal Component
const SlackShareModal = ({
  isOpen,
  onClose,
  reportTitle,
  reportType,
}: {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  reportType: string;
}) => {
  const [channel, setChannel] = useState("#seo-updates");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Generate default message based on report type and title
  useEffect(() => {
    let defaultMessage = "";
    if (reportType === "weekly") {
      defaultMessage = `Here's the latest weekly SEO report: ${reportTitle}\n\nKey highlights:\n- Organic traffic up 15% week-over-week\n- 4 new keywords entered top 10 positions\n- 3 new backlinks secured`;
    } else if (reportType === "monthly") {
      defaultMessage = `Monthly SEO performance report: ${reportTitle}\n\nKey highlights:\n- Organic traffic up 22% month-over-month\n- Lead generation increased by 18%\n- 12 new content pieces published`;
    } else if (reportType === "quarterly") {
      defaultMessage = `Quarterly SEO strategy & performance review: ${reportTitle}\n\nKey highlights:\n- 42% YoY traffic growth\n- 38% YoY lead growth\n- $108K revenue impact`;
    }
    setMessage(defaultMessage);
  }, [reportTitle, reportType]);

  const handleSend = () => {
    setIsSending(true);
    // Simulate sending to Slack
    setTimeout(() => {
      setIsSending(false);
      onClose();
      // Show success message
      alert("Report summary shared to Slack!");
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share to Slack</DialogTitle>
          <DialogDescription>
            Share a summary of this report to Slack. Customize the message
            below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="channel" className="text-right text-sm font-medium">
              Channel
            </label>
            <Input
              id="channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="message" className="text-right text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="bg-[#4A154B] hover:bg-[#3a1039] text-white"
            disabled={isSending}
          >
            {isSending ? "Sending..." : "Send to Slack"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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

  // Date range filter removed as not needed

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
      {/* Slack Share Modal */}
      <SlackShareModal
        isOpen={isSlackModalOpen}
        onClose={() => setIsSlackModalOpen(false)}
        reportTitle={getCurrentReportTitle()}
        reportType={activeTab}
      />

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
                          <BiCalendarCheck className="h-4 w-4 text-mediumGray mr-2" />
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
                          <BiCalendarCheck className="h-4 w-4 text-mediumGray mr-2" />
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
                          <BiCalendarCheck className="h-4 w-4 text-mediumGray mr-2" />
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
                      <BiChevronLeft className="h-5 w-5" />
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
                      <BiChevronRight className="h-5 w-5" />
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
