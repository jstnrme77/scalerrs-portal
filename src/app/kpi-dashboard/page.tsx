'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import TabNavigation from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';
import { fetchKPIMetrics, fetchURLPerformance, fetchKeywordPerformance } from '@/lib/client-api';
import { mockKPIMetrics, mockURLPerformance, mockKeywordPerformance } from '@/lib/mock-data';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
        color: 'blue',
        tooltip: 'Total organic clicks from Google Search Console over the last 30 days'
      },
      {
        title: 'Conversion Rate',
        current: 3.2,
        target: 4.0,
        delta: 20,
        trend: 'up',
        color: 'green',
        unit: '%',
        tooltip: 'Percentage of visitors who complete a goal action (form submission, sign-up, etc.)'
      },
      {
        title: 'Estimated Leads',
        current: 401,
        target: 600,
        delta: 33.2,
        trend: 'up',
        color: 'purple',
        tooltip: 'Total leads generated from organic traffic based on current conversion rate'
      },
      {
        title: 'SQLs',
        current: 87,
        target: 120,
        delta: 27.5,
        trend: 'up',
        color: 'amber',
        tooltip: 'Sales Qualified Leads that have been vetted by the sales team'
      },
      {
        title: 'Revenue Impact',
        current: 24800,
        target: 30000,
        delta: 17.3,
        trend: 'up',
        color: 'green',
        unit: '$',
        tooltip: 'Estimated revenue from organic leads based on average deal size'
      },
      {
        title: 'Traffic Growth YoY',
        current: 42,
        target: 50,
        delta: 16,
        trend: 'up',
        color: 'blue',
        unit: '%',
        tooltip: 'Year-over-year percentage increase in organic traffic'
      },
      {
        title: 'MoM Performance',
        current: 8.5,
        target: 10,
        delta: 15,
        trend: 'up',
        color: 'blue',
        unit: '%',
        tooltip: 'Month-over-month percentage increase in organic traffic'
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
      'Feature pages have good engagement but are not generating enough clicks',
      'BoFU content is performing well but has limited traffic volume'
    ]
  }
};

// Date filter options
const dateOptions = [
  { value: 'monthly', label: 'Monthly View' },
  { value: 'quarterly', label: 'Quarterly View' },
  { value: 'yearly', label: 'Yearly View' },
];

// Year projection data for forecasting model
const yearlyProjectionData = [
  { month: 'Jan', current: 8000, target: 8000, required: 8000 },
  { month: 'Feb', current: 9000, target: 9500, required: 9200 },
  { month: 'Mar', current: 10000, target: 11000, required: 10500 },
  { month: 'Apr', current: 11000, target: 12500, required: 12000 },
  { month: 'May', current: 12000, target: 14000, required: 13500 },
  { month: 'Jun', current: 13000, target: 15500, required: 15000 },
  { month: 'Jul', current: 14000, target: 17000, required: 16500 },
  { month: 'Aug', current: 15000, target: 18500, required: 18000 },
  { month: 'Sep', current: 16000, target: 20000, required: 19500 },
  { month: 'Oct', current: 17000, target: 21500, required: 21000 },
  { month: 'Nov', current: 18000, target: 23000, required: 22500 },
  { month: 'Dec', current: 19000, target: 24500, required: 24000 },
];

function KpiDashboard() {
  const [activeKpiTab, setActiveKpiTab] = useState('summary'); // 'summary', 'forecasting', or 'breakdown'
  const [selectedDateView, setSelectedDateView] = useState(dateOptions[0]);
  const [showRequiredAdjustments, setShowRequiredAdjustments] = useState(true);
  const [timeFrameFilter, setTimeFrameFilter] = useState('6months'); // '3months', '6months', '12months'

  // State for Airtable data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpiMetricsData, setKpiMetricsData] = useState<any[]>([]);
  const [urlPerformanceData, setUrlPerformanceData] = useState<any[]>([]);
  const [keywordPerformanceData, setKeywordPerformanceData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState(kpiData); // Start with sample data, will be updated
  const [usingMockData, setUsingMockData] = useState(false); // Flag to indicate if we're using mock data

  // Fetch data from Airtable
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Starting to fetch KPI dashboard data...');

        // Fetch each data type separately to better handle errors
        let kpiMetrics = [];
        let urlPerformance = [];
        let keywordPerformance = [];
        let hasErrors = false;
        let errorMessages = [];

        try {
          console.log('Fetching KPI metrics...');
          kpiMetrics = await fetchKPIMetrics();
          console.log('KPI metrics fetched successfully:', kpiMetrics.length, 'records');

          // Check if we got mock data
          const isMockData = kpiMetrics.some((metric: any) => metric.id && metric.id.startsWith('kpi'));
          if (isMockData) {
            console.log('Received mock KPI metrics data');
            setUsingMockData(true);
          }

          setKpiMetricsData(kpiMetrics);
        } catch (kpiErr: any) {
          console.error('Error fetching KPI metrics:', kpiErr);
          errorMessages.push(`KPI metrics: ${kpiErr.message || 'Unknown error'}`);
          hasErrors = true;
          // Use mock data as fallback
          kpiMetrics = mockKPIMetrics;
          setUsingMockData(true);
        }

        try {
          console.log('Fetching URL performance...');
          urlPerformance = await fetchURLPerformance();
          console.log('URL performance fetched successfully:', urlPerformance.length, 'records');
          setUrlPerformanceData(urlPerformance);
        } catch (urlErr: any) {
          console.error('Error fetching URL performance:', urlErr);
          errorMessages.push(`URL performance: ${urlErr.message || 'Unknown error'}`);
          hasErrors = true;
          // Use mock data as fallback
          urlPerformance = mockURLPerformance;
        }

        try {
          console.log('Fetching keyword performance...');
          keywordPerformance = await fetchKeywordPerformance();
          console.log('Keyword performance fetched successfully:', keywordPerformance.length, 'records');
          setKeywordPerformanceData(keywordPerformance);
        } catch (kwErr: any) {
          console.error('Error fetching keyword performance:', kwErr);
          errorMessages.push(`Keyword performance: ${kwErr.message || 'Unknown error'}`);
          hasErrors = true;
          // Use mock data as fallback
          keywordPerformance = mockKeywordPerformance;
        }

        // Process the data to match our dashboard structure
        console.log('Processing data for dashboard...');
        const processedData = processAirtableData(kpiMetrics, urlPerformance, keywordPerformance);
        setProcessedData(processedData);

        // Set error message if any of the fetches failed
        if (hasErrors) {
          // Check if all errors are authorization errors
          const allAuthErrors = errorMessages.every(msg => msg.includes('authorized') || msg.includes('403'));

          if (allAuthErrors) {
            setError(`Authorization error: Your Airtable token doesn't have the necessary permissions. Using sample data as fallback.`);
            // Force using mock data
            setUsingMockData(true);
          } else {
            setError(`Some data could not be fetched: ${errorMessages.join('; ')}. Using sample data as fallback.`);
          }
        }
      } catch (err: any) {
        console.error('Error in KPI dashboard data fetching:', err);
        setError(`An error occurred while fetching KPI data: ${err.message || 'Unknown error'}`);

        // Keep using the sample data if there's an error
        setProcessedData(kpiData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Process Airtable data into the format needed for the dashboard
  const processAirtableData = (kpiMetrics: any[], urlPerformance: any[], keywordPerformance: any[]) => {
    // Create a deep copy of the sample data structure to maintain the same format
    const processedData = JSON.parse(JSON.stringify(kpiData));

    // Process KPI Metrics for the summary cards
    if (kpiMetrics.length > 0) {
      // Map KPI metrics to summary cards
      const kpiCards = processedData.summary.kpiCards;

      // Define the mapping between Airtable metric names and card titles
      const metricMapping: Record<string, string> = {
        // Original mappings
        'Organic Clicks': 'Organic Clicks',
        'Conversion Rate': 'Conversion Rate',
        'Estimated Leads': 'Estimated Leads',
        'SQLs': 'SQLs',
        'Revenue Impact': 'Revenue Impact',
        'Traffic Growth YoY': 'Traffic Growth YoY',
        'MoM Performance': 'MoM Performance',

        // Additional mappings from your Airtable schema
        'Organic Traffic': 'Organic Clicks',
        'Lead Generation': 'Estimated Leads',
        'Traffic': 'Organic Clicks',
        'Leads': 'Estimated Leads',
        'Conversion': 'Conversion Rate'
      };

      // Update each card with real data if available
      kpiMetrics.forEach((metric: any) => {
        // Log the metric to see what fields are available
        console.log('Processing metric:', metric);

        // Find the corresponding card title for this metric
        // Try different field names that might contain the metric name
        const metricName = metric.MetricName || metric['Metric Name'] || '';
        console.log('Metric name found:', metricName);

        const cardTitle = metricMapping[metricName];
        if (!cardTitle) {
          console.log(`No mapping found for metric: ${metricName}`);
          return; // Skip if no mapping found
        }

        const cardIndex = kpiCards.findIndex((card: any) =>
          card.title === cardTitle
        );

        if (cardIndex !== -1) {
          // Update the card with data from Airtable
          // Try different field names that might contain the values
          const currentValue = metric.CurrentValue || metric['Current Value'] || 0;
          const targetValue = metric.Goal || metric['Target Value'] || metric.TargetValue || 0;
          const previousValue = metric.PreviousValue || metric['Previous Value'] || 0;
          const changePercentage = metric.ChangePercentage || metric['Delta/Change'] || 0;
          const unit = metric.Unit || '';

          kpiCards[cardIndex].current = currentValue || kpiCards[cardIndex].current;
          kpiCards[cardIndex].target = targetValue || kpiCards[cardIndex].target;

          // Set the unit if available
          if (unit) {
            kpiCards[cardIndex].unit = unit;
          }

          // Use the change percentage from Airtable if available
          if (changePercentage) {
            kpiCards[cardIndex].delta = parseFloat(changePercentage.toString().replace('%', '')).toFixed(1);
            kpiCards[cardIndex].trend = parseFloat(changePercentage) >= 0 ? 'up' : 'down';
          }
          // Otherwise calculate delta if both current and previous values exist
          else if (currentValue && previousValue) {
            const delta = ((currentValue - previousValue) / previousValue) * 100;
            kpiCards[cardIndex].delta = parseFloat(delta.toFixed(1));
            kpiCards[cardIndex].trend = delta >= 0 ? 'up' : 'down';
          }

          console.log(`Updated KPI card for ${cardTitle}:`, kpiCards[cardIndex]);
        } else {
          console.log(`No matching card found for metric: ${metricName}`);
        }
      });

      // Calculate overall progress
      const totalCurrent = kpiCards.reduce((sum: number, card: any) => sum + (card.current / card.target), 0);
      const progressPercentage = Math.round((totalCurrent / kpiCards.length) * 100);

      processedData.summary.currentProgress = progressPercentage;
      processedData.summary.status = progressPercentage >= 80 ? 'success' : progressPercentage >= 60 ? 'warning' : 'danger';

      console.log('Processed KPI data:', processedData.summary);
    }

    // Process URL Performance data for the page type breakdown
    if (urlPerformance.length > 0) {
      // Group URLs by page type (if available in the data)
      const blogPages = urlPerformance.filter((url: any) => url.PageType === 'Blog' || url.URLPath?.includes('/blog'));
      const featurePages = urlPerformance.filter((url: any) => url.PageType === 'Feature' || url.URLPath?.includes('/features'));
      const solutionPages = urlPerformance.filter((url: any) => url.PageType === 'Solution' || url.URLPath?.includes('/solutions'));
      const highIntentPages = urlPerformance.filter((url: any) => url.PageType === 'High-Intent' || url.URLPath?.includes('/demo') || url.URLPath?.includes('/contact'));

      // Update page type overview with real data
      if (blogPages.length > 0) {
        const totalClicks = blogPages.reduce((sum: number, page: any) => sum + (page.Clicks || 0), 0);
        processedData.pageTypeBreakdown.overview.blog.clicks = totalClicks;
      }

      if (featurePages.length > 0) {
        const totalClicks = featurePages.reduce((sum: number, page: any) => sum + (page.Clicks || 0), 0);
        processedData.pageTypeBreakdown.overview.feature.clicks = totalClicks;
      }

      if (solutionPages.length > 0) {
        const totalTraffic = solutionPages.reduce((sum: number, page: any) => sum + (page.Impressions || 0), 0);
        processedData.pageTypeBreakdown.overview.solution.traffic = totalTraffic;
      }

      if (highIntentPages.length > 0) {
        const totalTraffic = highIntentPages.reduce((sum: number, page: any) => sum + (page.Impressions || 0), 0);
        processedData.pageTypeBreakdown.overview.highIntent.traffic = totalTraffic;
      }

      // Find top and bottom performers
      const sortedByClicks = [...urlPerformance].sort((a, b) => (b.Clicks || 0) - (a.Clicks || 0));
      const sortedByPosition = [...urlPerformance].sort((a, b) => (a.AveragePosition || 100) - (b.AveragePosition || 100));

      if (sortedByClicks.length > 0) {
        // Update top performers
        if (sortedByClicks[0]) {
          processedData.pageTypeBreakdown.performers.top[0] = {
            url: sortedByClicks[0].URLPath || '/unknown',
            metric: 'Traffic',
            value: sortedByClicks[0].Clicks || 0,
            change: 15, // Placeholder as we don't have historical data
            tag: 'Top Performer'
          };
        }

        // Update bottom performers
        if (sortedByClicks[sortedByClicks.length - 1]) {
          processedData.pageTypeBreakdown.performers.bottom[0] = {
            url: sortedByClicks[sortedByClicks.length - 1].URLPath || '/unknown',
            metric: 'Traffic',
            value: sortedByClicks[sortedByClicks.length - 1].Clicks || 0,
            change: -12, // Placeholder
            tag: 'Needs Refresh'
          };
        }
      }
    }

    // Process Keyword Performance data for forecasting
    if (keywordPerformance.length > 0) {
      // Calculate average position improvement
      const positionChanges = keywordPerformance
        .filter((kw: any) => kw.PositionChange)
        .map((kw: any) => kw.PositionChange);

      if (positionChanges.length > 0) {
        const avgPositionChange = positionChanges.reduce((sum: number, change: number) => sum + change, 0) / positionChanges.length;

        // Use this to adjust the forecasting model
        const yearlyData = processedData.forecasting.currentResources;
        if (avgPositionChange > 0) {
          // If positions are improving, slightly increase the projected traffic
          yearlyData.projectedTraffic = Math.round(yearlyData.projectedTraffic * (1 + (avgPositionChange / 100)));
        }
      }
    }

    return processedData;
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-dark">KPI Dashboard</h1>
        <p className="text-mediumGray">Visualise performance against strategic targets and identify potential shortfalls early</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-3 text-mediumGray">Loading KPI data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
          <div className="flex items-start">
            <div className="mr-2">
              <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <strong className="font-bold">Data Connection Issue: </strong>
              <span className="block sm:inline">{error}</span>
              <p className="mt-2 text-sm">
                The dashboard is currently displaying sample data. To fix this issue:
              </p>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>Check that your Airtable base has the required tables (KPI Metrics, URL Performance, Keyword Performance)</li>
                <li>Verify that your Airtable personal access token has the correct scopes: data.records:read, data.records:write, schema.bases:read</li>
                <li>Ensure that the tables have the correct field names as specified in the documentation</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-sm font-medium text-yellow-800">
                  Note: You can continue using the dashboard with sample data. All functionality will work, but the data will not reflect your actual metrics.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Mock Data Banner */}
          {usingMockData && !error && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative mb-6" role="alert">
              <div className="flex items-start">
                <div className="mr-2">
                  <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <strong className="font-bold">Using Sample Data: </strong>
                  <span className="block sm:inline">The dashboard is currently displaying sample data instead of your actual Airtable data.</span>
                  <p className="mt-2 text-sm">
                    To connect your real data, please create the following tables in your Airtable base:
                  </p>
                  <ul className="list-disc list-inside mt-1 text-sm">
                    <li>KPI Metrics - for tracking key performance indicators</li>
                    <li>URL Performance - for tracking page performance</li>
                    <li>Keyword Performance - for tracking keyword rankings</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    See the documentation in <code>docs/airtable-schema.md</code> for the required fields.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Overview */}
          <div className={`p-6 rounded-lg mb-6 ${processedData.summary.status === 'success' ? 'bg-green-100' : processedData.summary.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'}`}>
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                {processedData.summary.status === 'success' ? (
                  <span className="text-2xl">📈</span>
                ) : processedData.summary.status === 'warning' ? (
                  <span className="text-2xl">⚠️</span>
                ) : (
                  <span className="text-2xl">🔻</span>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-dark mb-2">Performance Overview</h3>
                <p className="text-mediumGray mb-1">You're currently hitting {processedData.summary.currentProgress}% of your Q2 goal.</p>
                <p className="text-mediumGray">Based on current output, you'll reach ~{processedData.summary.annualProjection}% of the annual target.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {!loading && (
        <>
          {/* Date Filter */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-dark">Time Frame:</span>
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  onClick={() => setTimeFrameFilter('3months')}
                  className={`px-4 py-2 text-sm font-medium ${timeFrameFilter === '3months' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-l-md border border-gray-300`}
                >
                  3 Months
                </button>
                <button
                  onClick={() => setTimeFrameFilter('6months')}
                  className={`px-4 py-2 text-sm font-medium ${timeFrameFilter === '6months' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} border-t border-b border-gray-300`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setTimeFrameFilter('12months')}
                  className={`px-4 py-2 text-sm font-medium ${timeFrameFilter === '12months' ? 'bg-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} rounded-r-md border border-gray-300`}
                >
                  Full Year
                </button>
              </div>
            </div>
            <div className="inline-flex rounded-md shadow-sm">
              {dateOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDateView(option)}
                  className={`px-4 py-2 text-sm font-medium ${selectedDateView.value === option.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                    } ${option.value === 'monthly' ? 'rounded-l-md' : ''} ${option.value === 'yearly' ? 'rounded-r-md' : ''} border border-gray-300`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Dashboard Tabs */}
          <PageContainer>
            <PageContainerTabs>
              <TabNavigation
                tabs={[
                  { id: 'summary', label: 'KPI Summary' },
                  { id: 'forecasting', label: 'Forecasting Model' },
                  { id: 'breakdown', label: 'Breakdown by Page Type', disabled: !processedData.pageTypeBreakdown.enabled }
                ]}
                activeTab={activeKpiTab}
                onTabChange={setActiveKpiTab}
                variant="primary"
              />
            </PageContainerTabs>
            <PageContainerBody>
          {/* KPI Summary Tab */}
          {activeKpiTab === 'summary' && (
            <div className="space-y-6">
              {/* Progress Bar at the top - more prominent */}
              <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                <h4 className="font-medium text-dark mb-3">Overall KPI Progress</h4>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary bg-blue-100">
                        {processedData.summary.status === 'success' ? 'On Track' : processedData.summary.status === 'warning' ? 'At Risk' : 'Off Track'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold inline-block text-primary">
                        {processedData.summary.currentProgress}% of Q2 Goal
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-blue-100">
                    <div
                      style={{ width: `${processedData.summary.currentProgress}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center rounded-full ${processedData.summary.status === 'success' ? 'bg-green-500' : processedData.summary.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-mediumGray">
                    <span>Current Progress</span>
                    <span>Annual Projection: {processedData.summary.annualProjection}%</span>
                  </div>
                </div>
              </div>

              {/* Stacked KPI Cards */}
              <div className="grid grid-cols-1 gap-6">
                {processedData.summary.kpiCards.map((card, index) => (
                  <div key={index} className="bg-white p-5 rounded-lg border border-lightGray shadow-sm relative group">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <h4 className="text-base font-medium text-dark">{card.title}</h4>
                        <div className="relative ml-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-mediumGray cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="absolute left-0 bottom-full mb-2 w-48 bg-dark text-white text-xs rounded p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                            {card.tooltip}
                          </div>
                        </div>
                      </div>
                      <div className={`flex items-center text-sm ${card.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {card.trend === 'up' ? (
                          <span>↑ {card.delta}%</span>
                        ) : (
                          <span>↓ {card.delta}%</span>
                        )}
                      </div>
                    </div>

                    {/* Current and Projected Metrics Side by Side */}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-mediumGray mb-1">Current</div>
                        <div className="text-2xl font-bold text-dark">
                          {card.unit === '$' && '$'}{card.current.toLocaleString()}{card.unit === '%' && '%'}
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-mediumGray mb-1">Target</div>
                        <div className="text-2xl font-bold text-dark">
                          {card.unit === '$' && '$'}{card.target.toLocaleString()}{card.unit === '%' && '%'}
                        </div>
                      </div>
                    </div>

                    {/* Gap Analysis */}
                    <div className="bg-amber-50 p-3 rounded-lg mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-mediumGray">Gap to close:</span>
                        <span className="font-medium text-dark">{Math.round((card.target - card.current) / card.target * 100)}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-lightGray rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${card.color === 'blue' ? 'bg-blue-500' : card.color === 'green' ? 'bg-green-500' : card.color === 'purple' ? 'bg-purple-500' : 'bg-amber-500'}`}
                        style={{ width: `${(card.current / card.target) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecasting Model Tab */}
          {activeKpiTab === 'forecasting' && (
            <div className="space-y-6">
              {/* Main Visualization Chart - Full Year Projection */}
              <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-dark">Traffic Projection Visualization</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-mediumGray mr-3">Current</span>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-xs text-mediumGray mr-3">Target</span>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-xs text-mediumGray">Required</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeFrameFilter === '3months'
                        ? yearlyProjectionData.slice(0, 3)
                        : timeFrameFilter === '6months'
                          ? yearlyProjectionData.slice(0, 6)
                          : yearlyProjectionData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                      <Legend />
                      <Line type="monotone" dataKey="current" name="Current Trajectory" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="target" name="KPI Goal" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="required" name="Required Output" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-xs text-mediumGray flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Projections based on current growth rate and historical performance</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Card 1 - Forecast Based on Current Resources */}
                <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                  <h4 className="font-medium text-dark mb-3">Current Forecast</h4>
                  <div className="space-y-4">
                    {/* Projected Outcomes */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-dark mb-2">Projected Outcomes</h5>
                      <ul className="space-y-2 text-sm text-mediumGray">
                        <li className="flex justify-between">
                          <span>Total Forecasted Traffic:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.currentResources.projectedTraffic.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Forecasted Leads:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.currentResources.projectedLeads}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>% of Target:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.currentResources.targetPercentage}%</span>
                        </li>
                      </ul>
                    </div>

                    {/* Deliverable Breakdown */}
                    <div>
                      <h5 className="font-medium text-dark mb-2">Current Monthly Deliverables</h5>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <div className="text-lg font-bold text-dark">{processedData.forecasting.currentResources.deliverables.briefs}</div>
                          <div className="text-xs text-mediumGray">Briefs</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <div className="text-lg font-bold text-dark">{processedData.forecasting.currentResources.deliverables.backlinks}</div>
                          <div className="text-xs text-mediumGray">Backlinks</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg text-center">
                          <div className="text-lg font-bold text-dark">{processedData.forecasting.currentResources.deliverables.techFixes}</div>
                          <div className="text-xs text-mediumGray">Tech fixes</div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Estimate */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-mediumGray">At this pace, you're projected to reach these outcomes by <span className="font-medium text-dark">{processedData.forecasting.currentResources.timeline}</span>.</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Target KPIs and Gap Analysis */}
                <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                  <h4 className="font-medium text-dark mb-3">Target KPIs</h4>
                  <div className="space-y-4">
                    {/* Target KPI Summary */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-dark mb-2">Agreed Targets</h5>
                      <ul className="space-y-2 text-sm text-mediumGray">
                        <li className="flex justify-between">
                          <span>Target Traffic:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.agreedTargets.targetTraffic.toLocaleString()}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Target Leads:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.agreedTargets.targetLeads}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>End Date:</span>
                          <span className="font-medium text-dark">{processedData.forecasting.agreedTargets.endDate}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Gap Analysis */}
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <h5 className="font-medium text-dark mb-2">Gap Analysis</h5>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-mediumGray">Gap to close:</span>
                        <span className="font-medium text-dark">{processedData.forecasting.agreedTargets.gap.percentage}%</span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-mediumGray">Estimated shortfall:</span>
                        <span className="font-medium text-dark">~{processedData.forecasting.agreedTargets.gap.shortfall.toLocaleString()} visits</span>
                      </div>
                    </div>

                    {/* Toggle for Required Adjustments */}
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-dark">Required Adjustments</h5>
                      <button
                        onClick={() => setShowRequiredAdjustments(!showRequiredAdjustments)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-mediumGray"
                      >
                        {showRequiredAdjustments ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    {/* Required Adjustments - Collapsible */}
                    {showRequiredAdjustments && (
                      <div className="space-y-2">
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-mediumGray">Deliverables:</span>
                          <span className="font-medium text-dark">+{processedData.forecasting.agreedTargets.requiredAdjustments.content} briefs / month</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-mediumGray">Timeline:</span>
                          <span className="font-medium text-dark">+{processedData.forecasting.agreedTargets.requiredAdjustments.timeline} months</span>
                        </div>
                        <div className="flex justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-mediumGray">Conversion Rate:</span>
                          <span className="font-medium text-dark">↑ from {processedData.forecasting.agreedTargets.requiredAdjustments.conversionRate.current}% → {processedData.forecasting.agreedTargets.requiredAdjustments.conversionRate.required}%</span>
                        </div>
                        <div className="mt-2 text-xs text-mediumGray">
                          <p className="italic">Note: These adjustments are manually entered and can be updated based on strategic discussions.</p>
                        </div>
                      </div>
                    )}
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
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.blog.clicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Conversion Rate:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.blog.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Leads Captured:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.blog.leads}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                  <h4 className="text-sm font-medium text-dark mb-2">Feature Pages</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Clicks:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.feature.clicks.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Engagement Rate:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.feature.engagementRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Assisted Conversions:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.feature.assistedConversions}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                  <h4 className="text-sm font-medium text-dark mb-2">Solution Pages</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Traffic Volume:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.solution.traffic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Conversion Rate:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.solution.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Avg Time on Page:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.solution.timeOnPage}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-lightGray shadow-sm">
                  <h4 className="text-sm font-medium text-dark mb-2">High-Intent Pages</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Traffic Volume:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.highIntent.traffic.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Conversion Rate:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.highIntent.conversionRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-mediumGray">Leads:</span>
                      <span className="text-sm font-medium text-dark">{processedData.pageTypeBreakdown.overview.highIntent.leads}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Funnel Stage Breakdown */}
              <div className="bg-white p-5 rounded-lg border border-lightGray shadow-sm">
                <h4 className="font-medium text-dark mb-3">Funnel Stage Breakdown</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  <div className="col-span-1 md:col-span-2">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={processedData.pageTypeBreakdown.funnelStages}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="stage" />
                          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="traffic" name="Traffic" fill="#8884d8" />
                          <Bar yAxisId="right" dataKey="leads" name="Leads" fill="#82ca9d" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={processedData.pageTypeBreakdown.funnelStages}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="pages"
                            nameKey="stage"
                          >
                            {processedData.pageTypeBreakdown.funnelStages.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} pages`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
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
                      {processedData.pageTypeBreakdown.funnelStages.map((stage, index) => (
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
                    {processedData.pageTypeBreakdown.performers.top.map((performer, index) => (
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
                    {processedData.pageTypeBreakdown.performers.bottom.map((performer, index) => (
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
                  {processedData.pageTypeBreakdown.bottlenecks.map((bottleneck, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2">•</span>
                      <span className="text-sm text-mediumGray">{bottleneck}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
            </PageContainerBody>
          </PageContainer>
        </>
      )}
    </DashboardLayout>
  );
}

export default KpiDashboard;