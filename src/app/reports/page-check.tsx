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

// Sample report content for demonstration
const sampleReportContent = {
  weekly: <div>Weekly report content</div>,
  monthly: <div>Monthly report content</div>,
  quarterly: <div>Quarterly report content</div>
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
