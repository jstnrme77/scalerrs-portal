'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample SEO data for URLs
const urlData = [
  {
    id: 1,
    url: '/blog/seo-strategy-2024',
    title: 'SEO Strategy Guide for 2024',
    currentRank: 8,
    targetRank: 3,
    traffic: 1250,
    conversion: '2.4%',
    status: 'Optimizing'
  },
  {
    id: 2,
    url: '/services/technical-seo',
    title: 'Technical SEO Services',
    currentRank: 12,
    targetRank: 5,
    traffic: 850,
    conversion: '3.1%',
    status: 'Monitoring'
  },
  {
    id: 3,
    url: '/case-studies/ecommerce-seo',
    title: 'E-commerce SEO Case Study',
    currentRank: 6,
    targetRank: 1,
    traffic: 1450,
    conversion: '4.2%',
    status: 'Optimizing'
  },
  {
    id: 4,
    url: '/blog/local-seo-guide',
    title: 'Complete Local SEO Guide',
    currentRank: 15,
    targetRank: 7,
    traffic: 720,
    conversion: '1.8%',
    status: 'Planned'
  },
  {
    id: 5,
    url: '/services/content-marketing',
    title: 'Content Marketing Services',
    currentRank: 9,
    targetRank: 3,
    traffic: 980,
    conversion: '2.9%',
    status: 'Optimizing'
  },
];

// Sample keyword data
const keywordData = [
  {
    id: 1,
    keyword: 'seo strategy guide',
    volume: 2400,
    difficulty: 68,
    currentRank: 8,
    targetRank: 3,
    targetPage: '/blog/seo-strategy-2024',
    status: 'Improving'
  },
  {
    id: 2,
    keyword: 'technical seo services',
    volume: 1800,
    difficulty: 72,
    currentRank: 12,
    targetRank: 5,
    targetPage: '/services/technical-seo',
    status: 'Stable'
  },
  {
    id: 3,
    keyword: 'ecommerce seo case study',
    volume: 720,
    difficulty: 45,
    currentRank: 6,
    targetRank: 1,
    targetPage: '/case-studies/ecommerce-seo',
    status: 'Improving'
  },
  {
    id: 4,
    keyword: 'local seo guide',
    volume: 3600,
    difficulty: 65,
    currentRank: 15,
    targetRank: 7,
    targetPage: '/blog/local-seo-guide',
    status: 'New Target'
  },
  {
    id: 5,
    keyword: 'content marketing services',
    volume: 2900,
    difficulty: 74,
    currentRank: 9,
    targetRank: 3,
    targetPage: '/services/content-marketing',
    status: 'Improving'
  },
];

// Sample uplift potential data
const upliftData = [
  {
    id: 1,
    url: '/blog/seo-strategy-2024',
    currentTraffic: 1250,
    potentialTraffic: 3800,
    upliftPercentage: 204,
    primaryKeyword: 'seo strategy guide',
    secondaryKeywords: 4,
    priority: 'High'
  },
  {
    id: 2,
    url: '/services/technical-seo',
    currentTraffic: 850,
    potentialTraffic: 2100,
    upliftPercentage: 147,
    primaryKeyword: 'technical seo services',
    secondaryKeywords: 6,
    priority: 'Medium'
  },
  {
    id: 3,
    url: '/case-studies/ecommerce-seo',
    currentTraffic: 1450,
    potentialTraffic: 2800,
    upliftPercentage: 93,
    primaryKeyword: 'ecommerce seo case study',
    secondaryKeywords: 3,
    priority: 'High'
  },
  {
    id: 4,
    url: '/blog/local-seo-guide',
    currentTraffic: 720,
    potentialTraffic: 4500,
    upliftPercentage: 525,
    primaryKeyword: 'local seo guide',
    secondaryKeywords: 8,
    priority: 'Critical'
  },
  {
    id: 5,
    url: '/services/content-marketing',
    currentTraffic: 980,
    potentialTraffic: 1850,
    upliftPercentage: 89,
    primaryKeyword: 'content marketing services',
    secondaryKeywords: 5,
    priority: 'Medium'
  },
];

// Sample backlink data
const backlinkData = [
  {
    id: 1,
    targetUrl: '/blog/seo-strategy-2024',
    sourceDomain: 'searchenginejournal.com',
    domainRating: 86,
    linkType: 'Guest Post',
    status: 'Live',
    dateAcquired: '2024-03-15'
  },
  {
    id: 2,
    targetUrl: '/services/technical-seo',
    sourceDomain: 'moz.com',
    domainRating: 92,
    linkType: 'Resource Link',
    status: 'Pending',
    dateAcquired: 'Scheduled for April'
  },
  {
    id: 3,
    targetUrl: '/case-studies/ecommerce-seo',
    sourceDomain: 'semrush.com',
    domainRating: 89,
    linkType: 'Mention',
    status: 'Live',
    dateAcquired: '2024-02-28'
  },
  {
    id: 4,
    targetUrl: '/blog/local-seo-guide',
    sourceDomain: 'ahrefs.com',
    domainRating: 90,
    linkType: 'Resource Link',
    status: 'Live',
    dateAcquired: '2024-03-10'
  },
  {
    id: 5,
    targetUrl: '/services/content-marketing',
    sourceDomain: 'contentmarketinginstitute.com',
    domainRating: 82,
    linkType: 'Guest Post',
    status: 'Pending',
    dateAcquired: 'Scheduled for April'
  },
];

// Sample monthly planning data
const planningData = [
  {
    id: 1,
    month: 'April 2024',
    focusKeywords: ['seo strategy guide', 'technical seo services'],
    contentPieces: 3,
    backlinksPlanned: 5,
    technicalFixes: 8,
    expectedTrafficIncrease: '15%'
  },
  {
    id: 2,
    month: 'May 2024',
    focusKeywords: ['local seo guide', 'ecommerce seo case study'],
    contentPieces: 4,
    backlinksPlanned: 6,
    technicalFixes: 5,
    expectedTrafficIncrease: '18%'
  },
  {
    id: 3,
    month: 'June 2024',
    focusKeywords: ['content marketing services', 'seo roi calculation'],
    contentPieces: 3,
    backlinksPlanned: 7,
    technicalFixes: 4,
    expectedTrafficIncrease: '12%'
  },
];

export default function SEOLayoutsPage() {
  const [activeTab, setActiveTab] = useState('urls');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">SEO Layouts</h1>
        <p className="text-mediumGray">View your SEO campaign data in customizable table formats</p>
      </div>

      <PageContainer>
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'urls', label: 'URLs' },
              { id: 'keywords', label: 'Keywords' },
              { id: 'uplift', label: 'Uplift Potential' },
              { id: 'backlinks', label: 'Backlinks' },
              { id: 'planning', label: 'Monthly Planning' },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="primary"
          />
        </PageContainerTabs>
        <PageContainerBody>
          {/* URLs Tab */}
          {activeTab === 'urls' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-dark">URL Performance</h2>
                <div className="flex items-center space-x-2">
                  <select className="border border-lightGray rounded-md px-3 py-1 text-sm">
                    <option>All URLs</option>
                    <option>Blog Posts</option>
                    <option>Service Pages</option>
                    <option>Case Studies</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          URL
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Title
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Current Rank
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Target Rank
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Traffic
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Conversion
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {urlData.map((url) => (
                      <TableRow key={url.id}>
                        <TableCell className="font-medium">{url.url}</TableCell>
                        <TableCell>{url.title}</TableCell>
                        <TableCell>{url.currentRank}</TableCell>
                        <TableCell>{url.targetRank}</TableCell>
                        <TableCell>{url.traffic.toLocaleString()}</TableCell>
                        <TableCell>{url.conversion}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            url.status === 'Optimizing'
                              ? 'bg-blue-100 text-blue-800'
                              : url.status === 'Monitoring'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}>
                            {url.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Keywords Tab */}
          {activeTab === 'keywords' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-dark">Keyword Performance</h2>
                <div className="flex items-center space-x-2">
                  <select className="border border-lightGray rounded-md px-3 py-1 text-sm">
                    <option>All Keywords</option>
                    <option>High Volume</option>
                    <option>Low Difficulty</option>
                    <option>Improving</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Keyword
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Volume
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Difficulty
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Current Rank
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Target Rank
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Target Page
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywordData.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell className="font-medium">{keyword.keyword}</TableCell>
                        <TableCell>{keyword.volume.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{keyword.difficulty}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  keyword.difficulty > 70 ? 'bg-red-500' :
                                  keyword.difficulty > 50 ? 'bg-amber-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${keyword.difficulty}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{keyword.currentRank}</TableCell>
                        <TableCell>{keyword.targetRank}</TableCell>
                        <TableCell>{keyword.targetPage}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            keyword.status === 'Improving'
                              ? 'bg-green-100 text-green-800'
                              : keyword.status === 'Stable'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                          }`}>
                            {keyword.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Uplift Potential Tab */}
          {activeTab === 'uplift' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-dark">Uplift Potential Analysis</h2>
                <div className="flex items-center space-x-2">
                  <select className="border border-lightGray rounded-md px-3 py-1 text-sm">
                    <option>All Pages</option>
                    <option>High Priority</option>
                    <option>Medium Priority</option>
                    <option>Low Priority</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          URL
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Current Traffic
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Potential Traffic
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Uplift %
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Primary Keyword
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Secondary Keywords
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Priority
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upliftData.map((page) => (
                      <TableRow key={page.id}>
                        <TableCell className="font-medium">{page.url}</TableCell>
                        <TableCell>{page.currentTraffic.toLocaleString()}</TableCell>
                        <TableCell>{page.potentialTraffic.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            page.upliftPercentage > 200 ? 'text-green-600' :
                            page.upliftPercentage > 100 ? 'text-blue-600' : 'text-amber-600'
                          }`}>
                            +{page.upliftPercentage}%
                          </span>
                        </TableCell>
                        <TableCell>{page.primaryKeyword}</TableCell>
                        <TableCell>{page.secondaryKeywords}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            page.priority === 'Critical'
                              ? 'bg-red-100 text-red-800'
                              : page.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {page.priority}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Backlinks Tab */}
          {activeTab === 'backlinks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-dark">Backlink Analysis</h2>
                <div className="flex items-center space-x-2">
                  <select className="border border-lightGray rounded-md px-3 py-1 text-sm">
                    <option>All Backlinks</option>
                    <option>Live</option>
                    <option>Pending</option>
                    <option>High DR</option>
                  </select>
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Target URL
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Source Domain
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Domain Rating
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Link Type
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Date Acquired
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backlinkData.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">{link.targetUrl}</TableCell>
                        <TableCell>{link.sourceDomain}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className="mr-2">{link.domainRating}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  link.domainRating > 80 ? 'bg-green-500' :
                                  link.domainRating > 60 ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${link.domainRating}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{link.linkType}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            link.status === 'Live'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {link.status}
                          </span>
                        </TableCell>
                        <TableCell>{link.dateAcquired}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Monthly Planning Tab */}
          {activeTab === 'planning' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-dark">Monthly SEO Planning</h2>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                </div>
              </div>

              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Month
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Focus Keywords
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Content Pieces
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Backlinks Planned
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Technical Fixes
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        <div className="flex items-center">
                          Expected Traffic Increase
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {planningData.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell className="font-medium">{plan.month}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {plan.focusKeywords.map((keyword, index) => (
                              <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{plan.contentPieces}</TableCell>
                        <TableCell>{plan.backlinksPlanned}</TableCell>
                        <TableCell>{plan.technicalFixes}</TableCell>
                        <TableCell className="text-green-600 font-medium">
                          {plan.expectedTrafficIncrease}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </PageContainerBody>
      </PageContainer>
    </DashboardLayout>
  );
}
