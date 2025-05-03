'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronDown, Calendar, Download, ExternalLink, MessageSquare, Filter, ChevronLeft, ChevronRight, Slack } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { fetchBriefs, fetchArticles, fetchBacklinks } from '@/lib/client-api';
import { Brief, Article, Backlink } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Sample report data
const reports = {
  weekly: [
    { id: 1, title: 'Weekly Report - Apr 22-28, 2025', date: '2025-04-28', type: 'weekly' },
    { id: 2, title: 'Weekly Report - Apr 15-21, 2025', date: '2025-04-21', type: 'weekly' },
    { id: 3, title: 'Weekly Report - Apr 8-14, 2025', date: '2025-04-14', type: 'weekly' },
    { id: 4, title: 'Weekly Report - Apr 1-7, 2025', date: '2025-04-07', type: 'weekly' },
  ],
  monthly: [
    { id: 5, title: 'April 2025 Performance Report', date: '2025-05-01', type: 'monthly' },
    { id: 6, title: 'March 2025 Performance Report', date: '2025-04-01', type: 'monthly' },
    { id: 7, title: 'February 2025 Performance Report', date: '2025-03-01', type: 'monthly' },
  ],
  quarterly: [
    { id: 8, title: 'Q1 2025 Strategy & Performance Review', date: '2025-04-01', type: 'quarterly' },
    { id: 9, title: 'Q4 2024 Strategy & Performance Review', date: '2025-01-01', type: 'quarterly' },
  ]
};

// Sample briefs, articles, and backlinks data
const sampleBriefs = [
  { id: 1, title: 'Top 10 SEO Strategies for 2025', status: 'Sent', date: '2025-04-25', url: 'https://docs.google.com/document/d/123' },
  { id: 2, title: 'Technical SEO Audit Checklist', status: 'In Progress', date: '2025-04-26', url: 'https://docs.google.com/document/d/456' },
  { id: 3, title: 'Content Marketing ROI Guide', status: 'Sent', date: '2025-04-24', url: 'https://docs.google.com/document/d/789' },
];

const sampleArticles = [
  { id: 1, title: 'How to Improve Your Website Core Web Vitals', status: 'Published', date: '2025-04-23', url: 'https://example.com/blog/core-web-vitals' },
  { id: 2, title: 'The Ultimate Guide to Local SEO', status: 'Published', date: '2025-04-22', url: 'https://example.com/blog/local-seo-guide' },
];

const sampleBacklinks = [
  { id: 1, source: 'industry-blog.com', targetUrl: '/blog/seo-guide', status: 'Live', date: '2025-04-27', dr: 68 },
  { id: 2, source: 'marketing-news.com', targetUrl: '/services/content', status: 'Live', date: '2025-04-25', dr: 72 },
];

// Sample monthly performance data
const monthlyPerformanceData = [
  { month: 'Jan', clicks: 12000, impressions: 250000, leads: 280, revenue: 18000 },
  { month: 'Feb', clicks: 13500, impressions: 275000, leads: 310, revenue: 21000 },
  { month: 'Mar', clicks: 15000, impressions: 310000, leads: 350, revenue: 24500 },
  { month: 'Apr', clicks: 17000, impressions: 340000, leads: 410, revenue: 28000 },
];

// Sample quarterly performance data
const quarterlyPerformanceData = [
  { quarter: 'Q2 2024', traffic: 38000, leads: 850, revenue: 65000 },
  { quarter: 'Q3 2024', traffic: 45000, leads: 980, revenue: 78000 },
  { quarter: 'Q4 2024', traffic: 52000, leads: 1150, revenue: 92000 },
  { quarter: 'Q1 2025', traffic: 61000, leads: 1350, revenue: 108000 },
];

// Sample top performing pages
const topPerformingPages = [
  { url: '/blog/seo-guide-2025', traffic: 4500, conversions: 135, delta: 12 },
  { url: '/services/technical-seo', traffic: 3200, conversions: 96, delta: 8 },
  { url: '/case-studies/ecommerce', traffic: 2800, conversions: 84, delta: 15 },
];

// Sample competitor data
const competitorData = [
  { name: 'Competitor A', keywordFocus: 'Technical SEO', rankChange: 5, activity: 'Launched new service pages' },
  { name: 'Competitor B', keywordFocus: 'Local SEO', rankChange: -2, activity: 'Increased backlink acquisition' },
  { name: 'Competitor C', keywordFocus: 'Content Marketing', rankChange: 3, activity: 'Redesigned blog section' },
];

// Sample report content for demonstration
const sampleReportContent = {
  weekly: (
    <div className="space-y-6">
      {/* Timeframe Covered */}
      <div className="bg-primary/10 p-4 rounded-lg">
        <h3 className="text-xl font-medium text-dark">April 22-28, 2025</h3>
      </div>

      {/* What We Did */}
      <div className="card bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">What We Did</h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Content</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Published 3 new blog posts targeting high-intent keywords</li>
              <li>Updated 2 existing pages with fresh content and improved CTAs</li>
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
      <div className="card bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">Deliverable Progress</h4>

        <div className="space-y-4">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Content Briefs Sent</h5>
            <div className="space-y-3">
              {sampleBriefs.map(brief => (
                <div key={brief.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="text-base font-medium text-dark">{brief.title}</p>
                    <p className="text-sm text-mediumGray">{brief.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={brief.status === 'Sent' ? 'success' : 'warning'} className="text-sm px-3 py-1">
                      {brief.status}
                    </Badge>
                    <a href={brief.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">Articles Published</h5>
            <div className="space-y-3">
              {sampleArticles.map(article => (
                <div key={article.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="text-base font-medium text-dark">{article.title}</p>
                    <p className="text-sm text-mediumGray">{article.date}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="success" className="text-sm px-3 py-1">{article.status}</Badge>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">Backlinks Live</h5>
            <div className="space-y-3">
              {sampleBacklinks.map(backlink => (
                <div key={backlink.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div>
                    <p className="text-base font-medium text-dark">{backlink.source}</p>
                    <p className="text-sm text-mediumGray">Target: {backlink.targetUrl}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant="info" className="text-sm px-3 py-1">DR {backlink.dr}</Badge>
                    <Badge variant="success" className="text-sm px-3 py-1">{backlink.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Next Steps & Requests */}
      <div className="card bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">Next Steps & Requests</h4>

        <div className="space-y-3">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Tasks for Next Week</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li>Complete technical SEO audit for the new product section</li>
              <li>Publish 2 new case studies targeting competitive keywords</li>
              <li>Finalize content calendar for Q2 2025</li>
            </ul>
          </div>

          <div className="p-4 bg-amber-100 rounded-lg">
            <h5 className="text-base font-medium text-amber-800 mb-3">Action Required</h5>
            <ul className="list-disc pl-6 text-base text-mediumGray">
              <li className="font-medium">Review "Top 10 SEO Strategies for 2025" brief by May 2nd</li>
              <li className="font-medium">Provide feedback on the new homepage design mockup</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="card bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">Quick Links</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <a href="#" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <span className="mr-3 text-lg">📈</span>
            <span className="text-base text-dark">GSC Dashboard</span>
          </a>
          <a href="#" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <span className="mr-3 text-lg">🗂️</span>
            <span className="text-base text-dark">Content Folder</span>
          </a>
          <a href="#" className="flex items-center p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <span className="mr-3 text-lg">🔗</span>
            <span className="text-base text-dark">Backlink Sheet</span>
          </a>
        </div>
      </div>

      {/* Slack Share Button */}
      <div className="flex justify-end">
        <Button className="flex items-center space-x-3 bg-[#4A154B] hover:bg-[#3a1039] text-white px-5 py-6 text-base">
          <Slack size={20} />
          <span>Share to Slack</span>
        </Button>
      </div>
    </div>
  ),
  monthly: (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-lightGray p-5 rounded-lg">
        <h3 className="text-xl font-medium text-dark mb-3">April 2025 Performance Report</h3>
        <div className="mt-2 space-y-2">
          <div className="flex flex-wrap gap-3">
            <Badge variant="success" className="text-sm px-3 py-1">Wins: 4 new top 10 rankings</Badge>
            <Badge variant="warning" className="text-sm px-3 py-1">Risks: Mobile conversion rate</Badge>
          </div>
          <p className="text-base text-mediumGray">Monthly comprehensive analysis of your SEO campaign performance, achievements, and strategic recommendations.</p>
        </div>
      </div>

      {/* Loom Section */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-2">
            <MessageSquare size={16} className="text-red-500" />
          </div>
          <h4 className="font-medium text-dark">Monthly Walkthrough</h4>
        </div>
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-mediumGray">Loom video walkthrough</p>
            <Button variant="outline" size="sm" className="mt-2">
              <ExternalLink size={14} className="mr-1" />
              Watch Video
            </Button>
          </div>
        </div>
      </div>

      {/* Channel Performance */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Channel Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Organic Traffic</h5>
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
                  <Bar dataKey="clicks" fill="#8884d8" name="Clicks" />
                  <Bar dataKey="impressions" fill="#82ca9d" name="Impressions" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Leads & Revenue</h5>
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
                  <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#8884d8" name="Leads" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue ($)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Deliverables Recap */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Deliverables Recap</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-primary/5 p-3 rounded-lg">
            <h5 className="text-sm font-medium text-dark mb-2">Briefs Delivered</h5>
            <p className="text-2xl font-bold text-primary">12</p>
            <div className="w-full bg-lightGray rounded-full h-2 mt-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '80%' }}></div>
            </div>
            <p className="text-xs text-mediumGray mt-1">80% of monthly target</p>
          </div>
          <div className="bg-gold/5 p-3 rounded-lg">
            <h5 className="text-sm font-medium text-dark mb-2">Blogs Published</h5>
            <p className="text-2xl font-bold text-gold">8</p>
            <div className="w-full bg-lightGray rounded-full h-2 mt-2">
              <div className="bg-gold h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-xs text-mediumGray mt-1">100% of monthly target</p>
          </div>
          <div className="bg-lavender/5 p-3 rounded-lg">
            <h5 className="text-sm font-medium text-dark mb-2">Backlinks Live</h5>
            <p className="text-2xl font-bold text-lavender">15</p>
            <div className="w-full bg-lightGray rounded-full h-2 mt-2">
              <div className="bg-lavender h-2 rounded-full" style={{ width: '125%' }}></div>
            </div>
            <p className="text-xs text-mediumGray mt-1">125% of monthly target</p>
          </div>
        </div>
      </div>

      {/* Content Movers */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Content Movers</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformingPages.map((page, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{page.url}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.traffic}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{page.conversions}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${page.delta > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {page.delta > 0 ? '+' : ''}{page.delta}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyword & SERP Trends */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Keyword & SERP Trends</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Rank Movement</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Position 1-3</span>
                  <span className="text-sm font-medium text-dark">42 keywords <span className="text-green-500">+8</span></span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Position 4-10</span>
                  <span className="text-sm font-medium text-dark">78 keywords <span className="text-green-500">+12</span></span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Position 11-20</span>
                  <span className="text-sm font-medium text-dark">124 keywords <span className="text-green-500">+5</span></span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-1.5">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Visibility Trend</h5>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { date: 'Week 1', visibility: 32 },
                    { date: 'Week 2', visibility: 35 },
                    { date: 'Week 3', visibility: 38 },
                    { date: 'Week 4', visibility: 42 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visibility" stroke="#8884d8" name="Visibility Score" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Conversion & ROI Metrics */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Conversion & ROI Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-lightGray">
            <h5 className="text-sm font-medium text-dark mb-1">Lead Generation</h5>
            <p className="text-2xl font-bold text-primary">320</p>
            <p className="text-xs text-green-600">+15.2% vs. March</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-lightGray">
            <h5 className="text-sm font-medium text-dark mb-1">Assisted Conversions</h5>
            <p className="text-2xl font-bold text-gold">86</p>
            <p className="text-xs text-green-600">+9.8% vs. March</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-lightGray">
            <h5 className="text-sm font-medium text-dark mb-1">CPC Equivalence</h5>
            <p className="text-2xl font-bold text-lavender">$24,800</p>
            <p className="text-xs text-green-600">+12.5% vs. March</p>
          </div>
        </div>
      </div>

      {/* Campaign Projection */}
      <div className="bg-white p-4 rounded-lg border border-lightGray">
        <h4 className="font-medium text-dark mb-3">Campaign Projection</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Progress vs. Goals</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Traffic Goal</span>
                  <span className="text-sm font-medium text-dark">45.5K / 60K</span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Lead Goal</span>
                  <span className="text-sm font-medium text-dark">320 / 450</span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-2">
                  <div className="bg-gold h-2 rounded-full" style={{ width: '71%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-mediumGray">Revenue Goal</span>
                  <span className="text-sm font-medium text-dark">$24.8K / $35K</span>
                </div>
                <div className="w-full bg-lightGray rounded-full h-2">
                  <div className="bg-lavender h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h5 className="text-sm font-medium text-dark mb-2">Trajectory Forecast</h5>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { month: 'Jan', actual: 25000, target: 25000 },
                    { month: 'Feb', actual: 32000, target: 35000 },
                    { month: 'Mar', actual: 38000, target: 45000 },
                    { month: 'Apr', actual: 45500, target: 55000 },
                    { month: 'May', actual: null, target: 65000, forecast: 53000 },
                    { month: 'Jun', actual: null, target: 75000, forecast: 62000 }
                  ]}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#82ca9d" name="Target" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="forecast" stroke="#ffc658" name="Forecast" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Wins & Cautions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h4 className="font-medium text-dark mb-3 flex items-center">
            <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">✓</span>
            Wins
          </h4>
          <ul className="list-disc pl-5 text-mediumGray space-y-1">
            <li>4 new keywords entered top 3 positions</li>
            <li>15% increase in lead generation MoM</li>
            <li>Page speed improvements reduced bounce rate by 12%</li>
            <li>Exceeded backlink target by 25%</li>
          </ul>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <h4 className="font-medium text-dark mb-3 flex items-center">
            <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-2">!</span>
            Cautions
          </h4>
          <ul className="list-disc pl-5 text-mediumGray space-y-1">
            <li>Mobile conversion rate still lags desktop by 1.2%</li>
            <li>3 target keywords lost positions due to competitor activity</li>
            <li>Content production is 2 briefs behind schedule</li>
          </ul>
        </div>
      </div>

      {/* Recommendations + Next Steps */}
      <div className="bg-primary/10 p-4 rounded-lg">
        <h4 className="font-medium text-dark mb-3">Recommendations + Next Steps</h4>
        <div className="space-y-3">
          <div className="p-3 bg-white rounded-lg">
            <h5 className="text-sm font-medium text-dark mb-1">Priority Actions</h5>
            <ol className="list-decimal pl-5 text-mediumGray space-y-1">
              <li>Implement mobile UX improvements to increase conversion rate</li>
              <li>Accelerate content production to catch up on brief schedule</li>
              <li>Focus link building efforts on 3 keywords that lost positions</li>
            </ol>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <h5 className="text-sm font-medium text-dark mb-1">Strategic Adjustments</h5>
            <p className="text-sm text-mediumGray">Based on current trajectory, we recommend shifting 20% of content resources to focus on mobile optimization and conversion rate improvements to ensure we meet Q2 goals.</p>
          </div>
        </div>
      </div>
    </div>
  ),
  quarterly: (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-primary/20 p-6 rounded-lg">
        <h3 className="text-2xl font-bold text-dark mb-5">Q1 2025 Strategy & Performance Review</h3>

        {/* 3 Summary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="text-base text-mediumGray">Traffic Growth</h4>
            <p className="text-3xl font-bold text-primary">+42%</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600 font-medium">+12% QoQ</span>
              <span className="text-sm text-mediumGray ml-3">+42% YoY</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="text-base text-mediumGray">Lead Growth</h4>
            <p className="text-3xl font-bold text-gold">+38%</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600 font-medium">+15% QoQ</span>
              <span className="text-sm text-mediumGray ml-3">+38% YoY</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h4 className="text-base text-mediumGray">Revenue Impact</h4>
            <p className="text-3xl font-bold text-lavender">$108K</p>
            <div className="flex items-center mt-2">
              <span className="text-sm text-green-600 font-medium">+17% QoQ</span>
            </div>
          </div>
        </div>

        {/* Trendline Chart */}
        <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
          <h4 className="text-base font-medium text-dark mb-4">Performance Trends (Last 4 Quarters)</h4>
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
                <Line yAxisId="left" type="monotone" dataKey="traffic" stroke="#8884d8" name="Traffic" />
                <Line yAxisId="left" type="monotone" dataKey="leads" stroke="#82ca9d" name="Leads" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ffc658" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Text Summary */}
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h4 className="text-lg font-medium text-dark mb-3">Executive Summary</h4>
          <p className="text-base text-mediumGray leading-relaxed">
            Q1 2025 has shown strong performance across all key metrics with significant year-over-year growth.
            Our focus on content quality and technical improvements has yielded substantial increases in organic traffic,
            while conversion rate optimizations have successfully translated this traffic into leads and revenue.
          </p>
        </div>
      </div>

      {/* Traffic & Revenue */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Traffic & Revenue</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Q1 2025</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Q4 2024</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">QoQ Change</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Q1 2024</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">YoY Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">Organic Traffic</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">61,000</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">52,000</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +17.3%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">43,000</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +41.9%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">Leads Generated</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">1,350</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">1,150</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +17.4%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">980</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +37.8%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">Conversion Rate</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">2.2%</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">2.1%</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +4.8%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">1.9%</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +15.8%
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">Revenue Impact</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">$108,000</td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">$92,000</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +17.4%
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">$78,000</td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    +38.5%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Deliverables Roll Up */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Deliverables Roll Up</h4>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <span className="text-primary">📝</span>
            </div>
            <div>
              <p className="text-base font-medium text-dark">36 briefs delivered</p>
              <p className="text-sm text-mediumGray">100% of quarterly target</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center mr-3">
              <span className="text-gold">📰</span>
            </div>
            <div>
              <p className="text-base font-medium text-dark">24 articles published</p>
              <p className="text-sm text-mediumGray">Average word count: 1,850</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-lavender/10 flex items-center justify-center mr-3">
              <span className="text-lavender">🔗</span>
            </div>
            <div>
              <p className="text-base font-medium text-dark">45 backlinks secured</p>
              <p className="text-sm text-mediumGray">Average DR: 58</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Pages */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Top Performing Pages</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">URL</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Traffic</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Change</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPerformingPages.map((page, index) => (
                <tr key={index}>
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-primary">
                    <a href="#" className="hover:underline">{page.url}</a>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{page.traffic}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{page.conversions}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${page.delta > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {page.delta > 0 ? '+' : ''}{page.delta}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Experiments */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Experiments</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 bg-gray-50 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-base font-medium text-dark">Title Tag Tests</p>
            <p className="text-sm text-mediumGray mt-2">CTR +1.7 percentage points</p>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto bg-gold/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <p className="text-base font-medium text-dark">Mobile CTA Placement</p>
            <p className="text-sm text-mediumGray mt-2">Conversion +0.8 percentage points</p>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto bg-lavender/10 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-base font-medium text-dark">Core Web Vitals</p>
            <p className="text-sm text-mediumGray mt-2">Bounce rate -15% on key pages</p>
          </div>

          <div className="p-5 bg-gray-50 rounded-lg text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-base font-medium text-dark">Content Length Test</p>
            <p className="text-sm text-mediumGray mt-2">Long-form +32% more conversions</p>
          </div>
        </div>
      </div>

      {/* Next Quarter Roadmap */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Next Quarter Roadmap</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-base font-medium text-dark mb-3">Where We Are Now</h5>
            <p className="text-base text-mediumGray mb-4 leading-relaxed">
              Strong foundation with improved technical performance, growing organic visibility, and
              established content production pipeline. Key conversion points optimized with clear user journeys.
            </p>
          </div>

          <div>
            <h5 className="text-base font-medium text-dark mb-3">Where We're Heading Next</h5>
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
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-5">Competitor Intel</h4>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Keyword Focus</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank Change (QoQ)</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Notable Activity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitorData.map((competitor, index) => (
                <tr key={index}>
                  <td className="px-6 py-5 whitespace-nowrap text-base font-medium text-dark">{competitor.name}</td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{competitor.keywordFocus}</td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${competitor.rankChange > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {competitor.rankChange > 0 ? '+' : ''}{competitor.rankChange}
                    </span>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-base text-gray-700">{competitor.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-blue-50 p-5 rounded-lg">
          <h5 className="text-base font-medium text-dark mb-3">Key Takeaways</h5>
          <p className="text-base text-mediumGray leading-relaxed">
            Opportunity to outrank Competitor B on Local SEO keywords where they've lost positions.
            Competitor A is gaining ground in Technical SEO - we should accelerate our content production
            in this area to maintain our advantage.
          </p>
        </div>
      </div>

      {/* Risk and Tradeoffs */}
      <div className="bg-white p-6 rounded-lg border border-lightGray shadow-sm">
        <h4 className="text-lg font-medium text-dark mb-4">Risks and Tradeoffs</h4>
        <ul className="list-disc pl-6 text-base text-mediumGray space-y-3">
          <li>
            <span className="font-medium text-dark">Resource allocation:</span> Focusing on mobile optimization may slow content production temporarily
          </li>
          <li>
            <span className="font-medium text-dark">Competitive pressure:</span> Competitor A's aggressive content strategy requires us to maintain quality over quantity
          </li>
          <li>
            <span className="font-medium text-dark">Algorithm updates:</span> Recent Google updates suggest prioritizing user experience metrics over pure keyword targeting
          </li>
          <li>
            <span className="font-medium text-dark">Technical debt:</span> Legacy URL structure still impacts some sections - full migration recommended in Q3
          </li>
        </ul>
      </div>

      {/* TL;DR */}
      <div className="bg-primary/10 p-6 rounded-lg">
        <h4 className="text-lg font-medium text-dark mb-4">TL;DR</h4>
        <p className="text-base text-mediumGray leading-relaxed">
          Q1 2025 delivered strong results across all KPIs with traffic up 42% YoY and leads up 38% YoY.
          Technical improvements and content quality drove performance gains. For Q2, we'll focus on mobile
          optimization, expanding high-converting content clusters, and targeted link building for product pages.
          Main risks include competitive pressure and potential algorithm updates favoring UX metrics.
        </p>
      </div>
    </div>
  )
};

export default function Reports() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedReport, setSelectedReport] = useState<number | null>(1);
  const [reportContent, setReportContent] = useState<React.ReactNode | null>(null);

  // Set initial report content
  useEffect(() => {
    if (activeTab === 'weekly' && reports.weekly.length > 0) {
      setSelectedReport(reports.weekly[0].id);
      setReportContent(sampleReportContent.weekly);
    } else if (activeTab === 'monthly' && reports.monthly.length > 0) {
      setSelectedReport(reports.monthly[0].id);
      setReportContent(sampleReportContent.monthly);
    } else if (activeTab === 'quarterly' && reports.quarterly.length > 0) {
      setSelectedReport(reports.quarterly[0].id);
      setReportContent(sampleReportContent.quarterly);
    }
  }, [activeTab]);

  // Handle report selection
  const handleReportSelect = (reportId: number, type: string) => {
    setSelectedReport(reportId);

    // Set sample content based on report type
    if (type === 'weekly') {
      setReportContent(sampleReportContent.weekly);
    } else if (type === 'monthly') {
      setReportContent(sampleReportContent.monthly);
    } else if (type === 'quarterly') {
      setReportContent(sampleReportContent.quarterly);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-dark">Reports</h1>
          <p className="text-base text-mediumGray">View weekly, monthly, and quarterly performance reports</p>
        </div>
      </div>

      <PageContainer className="w-full">
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'quarterly', label: 'Quarterly' }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="primary"
          />
        </PageContainerTabs>

        <PageContainerBody className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Report List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg border border-lightGray p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-dark">
                    {activeTab === 'weekly' && 'Weekly Reports'}
                    {activeTab === 'monthly' && 'Monthly Reports'}
                    {activeTab === 'quarterly' && 'Quarterly Reports'}
                  </h2>
                  <Button variant="outline" className="flex items-center text-sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="space-y-4">
                  {activeTab === 'weekly' && reports.weekly.map(report => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedReport === report.id ? 'bg-primary/10 border-l-2 border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => handleReportSelect(report.id, 'weekly')}
                    >
                      <p className={`text-base ${selectedReport === report.id ? 'font-medium text-primary' : 'text-dark'}`}>{report.title}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                        <p className="text-sm text-mediumGray">{report.date}</p>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'monthly' && reports.monthly.map(report => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedReport === report.id ? 'bg-primary/10 border-l-2 border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => handleReportSelect(report.id, 'monthly')}
                    >
                      <p className={`text-base ${selectedReport === report.id ? 'font-medium text-primary' : 'text-dark'}`}>{report.title}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                        <p className="text-sm text-mediumGray">{report.date}</p>
                      </div>
                    </div>
                  ))}

                  {activeTab === 'quarterly' && reports.quarterly.map(report => (
                    <div
                      key={report.id}
                      className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedReport === report.id ? 'bg-primary/10 border-l-2 border-primary' : 'bg-gray-50 hover:bg-gray-100'}`}
                      onClick={() => handleReportSelect(report.id, 'quarterly')}
                    >
                      <p className={`text-base ${selectedReport === report.id ? 'font-medium text-primary' : 'text-dark'}`}>{report.title}</p>
                      <div className="flex items-center mt-2">
                        <Calendar className="h-4 w-4 text-mediumGray mr-2" />
                        <p className="text-sm text-mediumGray">{report.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Report Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-lightGray p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Button variant="ghost" className="mr-3">
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg md:text-xl font-medium text-dark">
                      {activeTab === 'weekly' && selectedReport && reports.weekly.find(r => r.id === selectedReport)?.title}
                      {activeTab === 'monthly' && selectedReport && reports.monthly.find(r => r.id === selectedReport)?.title}
                      {activeTab === 'quarterly' && selectedReport && reports.quarterly.find(r => r.id === selectedReport)?.title}
                    </h2>
                    <Button variant="ghost" className="ml-3">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" className="flex items-center text-sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>

                {/* Report Content */}
                <div className="mt-6">
                  {reportContent}
                </div>
              </div>
            </div>
          </div>
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
}
