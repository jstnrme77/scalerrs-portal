'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import {
  fetchTasks,
  fetchBriefs,
  fetchArticles,
  fetchBacklinks,
  fetchKPIMetrics,
  fetchKeywordPerformance
} from '@/lib/client-api';
import { Task, Brief, Article, Backlink, KPIMetric, URLPerformance, KeywordPerformance } from '@/types';

export default function AirtableIntegrationDemo() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [kpiMetrics, setKPIMetrics] = useState<KPIMetric[]>([]);
  const [urlPerformance, setURLPerformance] = useState<URLPerformance[]>([]);
  const [keywordPerformance, setKeywordPerformance] = useState<KeywordPerformance[]>([]);

  const [activeTab, setActiveTab] = useState('tasks');

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tasks
        const tasksData = await fetchTasks();
        setTasks(tasksData);

        // Fetch briefs
        const briefsData = await fetchBriefs();
        setBriefs(briefsData);

        // Fetch articles
        const articlesData = await fetchArticles();
        setArticles(articlesData);

        // Fetch backlinks
        const backlinksData = await fetchBacklinks();
        setBacklinks(backlinksData);

        // Fetch KPI metrics
        const kpiMetricsData = await fetchKPIMetrics();
        setKPIMetrics(kpiMetricsData);

        // URL Performance functionality has been removed
        console.log('URL Performance functionality has been removed');
        setURLPerformance([]);

        // Fetch keyword performance
        const keywordPerformanceData = await fetchKeywordPerformance();
        setKeywordPerformance(keywordPerformanceData);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(`An error occurred while fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Render data based on active tab
  const renderData = () => {
    if (loading) {
      return <div className="p-4">Loading data...</div>;
    }

    if (error) {
      return <div className="p-4 text-red-500">{error}</div>;
    }

    switch (activeTab) {
      case 'tasks':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Tasks ({tasks.length})</h2>
            <div className="grid gap-4">
              {tasks.map(task => (
                <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{task.Title}</h3>
                  <p className="text-gray-600">{task.Description}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      {task.Status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'briefs':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Briefs ({briefs.length})</h2>
            <div className="grid gap-4">
              {briefs.map(brief => (
                <div key={brief.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{brief.Title}</h3>
                  <p className="text-gray-600">SEO Strategist: {brief.SEOStrategist}</p>
                  <p className="text-gray-600">Due Date: {brief.DueDate}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      {brief.Status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'articles':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Articles ({articles.length})</h2>
            <div className="grid gap-4">
              {articles.map(article => (
                <div key={article.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{article.Title}</h3>
                  <p className="text-gray-600">Word Count: {article.WordCount}</p>
                  <p className="text-gray-600">Due Date: {article.DueDate}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      {article.Status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'backlinks':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Backlinks ({backlinks.length})</h2>
            <div className="grid gap-4">
              {backlinks.map(backlink => (
                <div key={backlink.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{backlink.Domain}</h3>
                  <p className="text-gray-600">DR: {backlink.DomainRating}</p>
                  <p className="text-gray-600">Target Page: {backlink.TargetPage}</p>
                  <div className="mt-2">
                    <span className="inline-block px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded">
                      {backlink.Status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'kpi-metrics':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">KPI Metrics ({kpiMetrics.length})</h2>
            <div className="grid gap-4">
              {kpiMetrics.map(metric => (
                <div key={metric.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{metric.MetricName}</h3>
                  <p className="text-gray-600">Current Value: {metric.CurrentValue}</p>
                  <p className="text-gray-600">Previous Value: {metric.PreviousValue}</p>
                  <p className="text-gray-600">Change: {metric.ChangePercentage}%</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'url-performance':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">URL Performance ({urlPerformance.length})</h2>
            <div className="grid gap-4">
              {urlPerformance.map(url => (
                <div key={url.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{url.URLPath}</h3>
                  <p className="text-gray-600">Page Title: {url.PageTitle}</p>
                  <p className="text-gray-600">Clicks: {url.Clicks}</p>
                  <p className="text-gray-600">Impressions: {url.Impressions}</p>
                  <p className="text-gray-600">CTR: {url.CTR}%</p>
                  <p className="text-gray-600">Avg Position: {url.AveragePosition}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'keyword-performance':
        return (
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Keyword Performance ({keywordPerformance.length})</h2>
            <div className="grid gap-4">
              {keywordPerformance.map(keyword => (
                <div key={keyword.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-semibold">{keyword.Keyword}</h3>
                  <p className="text-gray-600">Volume: {keyword.Volume}</p>
                  <p className="text-gray-600">Difficulty: {keyword.Difficulty}</p>
                  <p className="text-gray-600">Current Position: {keyword.CurrentPosition}</p>
                  <p className="text-gray-600">Previous Position: {keyword.PreviousPosition}</p>
                  <p className="text-gray-600">Change: {keyword.PositionChange}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div className="p-4">Select a tab to view data</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Airtable Integration Demo</h1>

        {/* Tabs */}
        <div className="flex border-b mb-6">
          <button
            className={`px-4 py-2 ${activeTab === 'tasks' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'briefs' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('briefs')}
          >
            Briefs
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'articles' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            Articles
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'backlinks' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('backlinks')}
          >
            Backlinks
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'kpi-metrics' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('kpi-metrics')}
          >
            KPI Metrics
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'url-performance' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('url-performance')}
          >
            URL Performance
          </button>
          <button
            className={`px-4 py-2 ${activeTab === 'keyword-performance' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
            onClick={() => setActiveTab('keyword-performance')}
          >
            Keyword Performance
          </button>
        </div>

        {/* Data display */}
        {renderData()}
      </div>
    </DashboardLayout>
  );
}
