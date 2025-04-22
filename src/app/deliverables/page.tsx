'use client';

import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DashboardLayout from '@/components/DashboardLayout';
import { ChevronDown } from 'lucide-react';
import BriefColumn from '@/components/kanban/BriefColumn';
import ArticleColumn from '@/components/kanban/ArticleColumn';
import { Brief, BriefStatus, Article, ArticleStatus, BacklinkStatus, Month, ContentTab, MainTab, Backlink } from '@/types';
import TabNavigation, { TabContent } from '@/components/ui/navigation/TabNavigation';
import PageContainer, { PageContainerBody, PageContainerTabs } from '@/components/ui/layout/PageContainer';

// Sample data for briefs
const briefs: Brief[] = [
  {
    id: 1,
    title: 'The Future of Remote Work',
    seoStrategist: 'Alex Romero',
    dueDate: 'Apr 10',
    docLink: 'https://docs.google.com/document/d/1',
    month: 'April',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'SEO Best Practices',
    seoStrategist: 'Taylor Green',
    dueDate: 'Apr 14',
    docLink: 'https://docs.google.com/document/d/2',
    month: 'April',
    status: 'Needs Input'
  },
  {
    id: 3,
    title: 'Content Marketing Guide',
    seoStrategist: 'Alex Romero',
    dueDate: 'Apr 7',
    docLink: 'https://docs.google.com/document/d/3',
    month: 'April',
    status: 'Review Brief'
  },
  {
    id: 4,
    title: 'Email Marketing Tips',
    seoStrategist: 'Brooke Turner',
    dueDate: 'Apr 5',
    docLink: 'https://docs.google.com/document/d/4',
    month: 'April',
    status: 'Brief Approved'
  },
  {
    id: 5,
    title: 'Social Media Strategies',
    seoStrategist: 'Schorn Force',
    dueDate: 'Apr 20',
    docLink: 'https://docs.google.com/document/d/5',
    month: 'April',
    status: 'Brief Approved'
  },
  {
    id: 6,
    title: 'E-Commerce Trends',
    seoStrategist: 'Ryan Harris',
    dueDate: 'Apr 22',
    docLink: 'https://docs.google.com/document/d/6',
    month: 'April',
    status: 'Brief Approved'
  },
];

// Sample data for articles
const articles: Article[] = [
  {
    id: 1,
    title: 'The Future of Remote Work',
    writer: 'Alex Romero',
    wordCount: 1500,
    dueDate: 'Apr 10',
    docLink: 'https://docs.google.com/document/d/1',
    month: 'April',
    status: 'In Production'
  },
  {
    id: 2,
    title: 'SEO Best Practices',
    writer: 'Taylor Green',
    wordCount: 1200,
    dueDate: 'Apr 14',
    docLink: 'https://docs.google.com/document/d/2',
    month: 'April',
    status: 'In Production'
  },
  {
    id: 3,
    title: 'Social Media Strategies',
    writer: 'Schorn Force',
    wordCount: 1800,
    dueDate: 'Apr 20',
    docLink: 'https://docs.google.com/document/d/3',
    month: 'April',
    status: 'Review Draft'
  },
  {
    id: 4,
    title: 'E-Commerce Trends',
    writer: 'Ryan Harris',
    wordCount: 1600,
    dueDate: 'Apr 22',
    docLink: 'https://docs.google.com/document/d/4',
    month: 'April',
    status: 'Review Draft'
  },
  {
    id: 5,
    title: 'Email Marketing Tips',
    writer: 'Brooke Turner',
    wordCount: 1400,
    dueDate: 'Apr 5',
    docLink: 'https://docs.google.com/document/d/5',
    articleUrl: 'https://example.com/email-marketing-tips',
    month: 'April',
    status: 'Live'
  },
  {
    id: 6,
    title: 'Content Marketing Guide',
    writer: 'Alex Romero',
    wordCount: 1700,
    dueDate: 'Apr 7',
    docLink: 'https://docs.google.com/document/d/6',
    articleUrl: 'https://example.com/content-marketing-guide',
    month: 'April',
    status: 'Live'
  },
];

// Sample data for backlinks
const backlinks: Backlink[] = [
  {
    id: 1,
    domain: 'example.com',
    dr: 54,
    linkType: 'Guest Post',
    targetPage: '/',
    status: 'Live',
    wentLiveOn: 'Apr 12',
    month: 'April',
  },
  {
    id: 2,
    domain: 'website.org',
    dr: 51,
    linkType: 'Directory',
    targetPage: '/resources',
    status: 'Scheduled',
    wentLiveOn: 'Apr 6',
    month: 'April',
  },
  {
    id: 3,
    domain: 'sample.net',
    dr: 62,
    linkType: 'Guest Post',
    targetPage: '/blog-post',
    status: 'Live',
    wentLiveOn: 'Apr 17',
    month: 'April',
  },
  {
    id: 4,
    domain: 'article.com',
    dr: 63,
    linkType: 'Niche Edit',
    targetPage: '/guides',
    status: 'Live',
    wentLiveOn: 'Mar 25',
    month: 'March',
  },
  {
    id: 5,
    domain: 'blog-site.io',
    dr: 54,
    linkType: 'Guest Post',
    targetPage: '/news',
    status: 'Scheduled',
    wentLiveOn: 'Mar 19',
    month: 'March',
  },
  {
    id: 6,
    domain: 'content-hub.co',
    dr: 62,
    linkType: 'Directory',
    targetPage: '/blog-pending',
    status: 'Live',
    wentLiveOn: 'Apr 12',
    month: 'April',
  },
  {
    id: 7,
    domain: 'content-hub.co',
    dr: 72,
    linkType: 'Niche Edit',
    targetPage: '/article-post',
    status: 'Live',
    wentLiveOn: 'Apr 12',
    month: 'April',
  },
];

// Month selector component
function MonthSelector({ selectedMonth, onChange }: { selectedMonth: string; onChange: (month: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="card flex items-center justify-between w-40 px-4 py-2 text-sm font-medium bg-white border border-lightGray rounded-lg hover:bg-lightGray" style={{ color: '#353233' }}
      >
        {selectedMonth}
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {isOpen && (
        <div className="card absolute right-0 mt-2 w-40 bg-white border border-lightGray rounded-lg shadow-lg z-10" style={{ color: '#353233' }}>
          {months.map((month) => (
            <button
              key={month}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-lightGray" style={{ color: '#353233' }}
              onClick={() => {
                onChange(month);
                setIsOpen(false);
              }}
            >
              {month}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Deliverables() {
  // State for tabs and month selection
  const [selectedMonth, setSelectedMonth] = useState<string>('April');
  const [mainTab, setMainTab] = useState<MainTab>('content');
  const [contentTab, setContentTab] = useState<ContentTab>('briefs');

  // State for data with drag-and-drop functionality
  const [briefsData, setBriefsData] = useState<Brief[]>(briefs);
  const [articlesData, setArticlesData] = useState<Article[]>(articles);

  // Filter data by selected month
  const filteredBriefs = briefsData.filter(brief => brief.month === selectedMonth);
  const filteredArticles = articlesData.filter(article => article.month === selectedMonth);
  const filteredBacklinks = backlinks.filter(backlink => backlink.month === selectedMonth);

  // Handle brief status change (for drag and drop)
  const handleBriefStatusChange = (id: number, newStatus: BriefStatus) => {
    setBriefsData(prevBriefs =>
      prevBriefs.map(brief =>
        brief.id === id ? { ...brief, status: newStatus } : brief
      )
    );
  };

  // Handle article status change (for drag and drop)
  const handleArticleStatusChange = (id: number, newStatus: ArticleStatus) => {
    setArticlesData(prevArticles =>
      prevArticles.map(article =>
        article.id === id ? { ...article, status: newStatus } : article
      )
    );
  };

  // Calculate progress percentages
  const briefsApproved = filteredBriefs.filter(brief => brief.status === 'Brief Approved').length;
  const briefsProgress = Math.round((briefsApproved / filteredBriefs.length) * 100);

  const articlesLive = filteredArticles.filter(article => article.status === 'Live').length;
  const articlesProgress = Math.round((articlesLive / filteredArticles.length) * 100);

  const backlinksLive = filteredBacklinks.filter(backlink => backlink.status === 'Live').length;
  const backlinksProgress = Math.round((backlinksLive / filteredBacklinks.length) * 100);

  return (
    <DndProvider backend={HTML5Backend}>
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dark">Deliverables</h1>
        <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} />
      </div>

      {/* Main Tab Navigation */}
      <PageContainer className="mb-6">
        <PageContainerTabs>
          <TabNavigation
            tabs={[
              { id: 'content', label: 'Content' },
              { id: 'backlinks', label: 'Backlinks' }
            ]}
            activeTab={mainTab}
            onChange={(tabId) => setMainTab(tabId as MainTab)}
            variant="primary"
          />
        </PageContainerTabs>

        {/* Content Tab */}
        {mainTab === 'content' && (
          <div>
            {/* Content Sub-tabs */}
            <PageContainerTabs className="border-t-0">
              <div className="flex justify-between items-center w-full">
                <TabNavigation
                  tabs={[
                    { id: 'briefs', label: 'Briefs' },
                    { id: 'articles', label: 'Articles' }
                  ]}
                  activeTab={contentTab}
                  onChange={(tabId) => setContentTab(tabId as ContentTab)}
                  variant="secondary"
                />
                <div className="flex items-center">
                  <button className="flex items-center text-sm text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4V4z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 10h16M10 4v16" />
                    </svg>
                    Board
                  </button>
                  <button className="flex items-center text-sm text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Inbox
                  </button>
                </div>
              </div>
            </PageContainerTabs>

            <PageContainerBody>
              {/* Briefs View */}
              {contentTab === 'briefs' && (
                <div>
                  {/* Status Summary */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center bg-purple-100 p-2 rounded-md mb-2">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#6B21A8">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium">2 drafts need your decision</p>
                      </div>
                      <button className="flex items-center text-sm text-gray-600 bg-white border border-gray-200 rounded-md px-3 py-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Show only my tasks
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <p className="text-sm text-gray-600 mb-1">
                        {selectedMonth}: {briefsApproved} of {filteredBriefs.length} briefs approved ({briefsProgress}%)
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${briefsProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Kanban Board */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Needs Your Review Column */}
                    <BriefColumn
                      title="Needs Your Review"
                      status="Review Brief"
                      briefs={filteredBriefs.filter(brief => brief.status === 'Review Brief')}
                      selectedMonth={selectedMonth}
                      bgColor="bg-[#f9f0ff]"
                      onStatusChange={handleBriefStatusChange}
                      count={2}
                    />

                    {/* In Progress Column */}
                    <BriefColumn
                      title="In Progress"
                      status="In Progress"
                      briefs={filteredBriefs.filter(brief => brief.status === 'In Progress')}
                      selectedMonth={selectedMonth}
                      bgColor="bg-[#f0f4ff]"
                      onStatusChange={handleBriefStatusChange}
                      count={1}
                    />

                    {/* Needs Input Column */}
                    <BriefColumn
                      title="Needs Input"
                      status="Needs Input"
                      briefs={filteredBriefs.filter(brief => brief.status === 'Needs Input')}
                      selectedMonth={selectedMonth}
                      bgColor="bg-white"
                      onStatusChange={handleBriefStatusChange}
                      count={0}
                    />

                    {/* Brief Approved Column */}
                    <BriefColumn
                      title="Brief Approved"
                      status="Brief Approved"
                      briefs={filteredBriefs.filter(brief => brief.status === 'Brief Approved')}
                      selectedMonth={selectedMonth}
                      bgColor="bg-[#f0fff4]"
                      onStatusChange={handleBriefStatusChange}
                      count={3}
                    />
                  </div>
                </div>
              )}

              {/* Articles Kanban View */}
              {contentTab === 'articles' && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
                  {/* In Production Column */}
                  <ArticleColumn
                    title="In Production"
                    status="In Production"
                    articles={filteredArticles.filter(article => article.status === 'In Production')}
                    bgColor="bg-[#f8f9fa]"
                    onStatusChange={handleArticleStatusChange}
                  />

                  {/* Review Draft Column */}
                  <ArticleColumn
                    title="Review Draft"
                    status="Review Draft"
                    articles={filteredArticles.filter(article => article.status === 'Review Draft')}
                    bgColor="bg-[#fff3cd]"
                    onStatusChange={handleArticleStatusChange}
                  />

                  {/* Draft Approved Column */}
                  <ArticleColumn
                    title="Draft Approved"
                    status="Draft Approved"
                    articles={filteredArticles.filter(article => article.status === 'Draft Approved')}
                    bgColor="bg-[#cfe2ff]"
                    onStatusChange={handleArticleStatusChange}
                  />

                  {/* To Be Published Column */}
                  <ArticleColumn
                    title="To Be Published"
                    status="To Be Published"
                    articles={filteredArticles.filter(article => article.status === 'To Be Published')}
                    bgColor="bg-[#e2e3e5]"
                    onStatusChange={handleArticleStatusChange}
                  />

                  {/* Live Column */}
                  <ArticleColumn
                    title="Live"
                    status="Live"
                    articles={filteredArticles.filter(article => article.status === 'Live')}
                    bgColor="bg-[#d1e7dd]"
                    onStatusChange={handleArticleStatusChange}
                  />
                </div>
              )}
            </PageContainerBody>
          </div>
        )}

        {/* Backlinks Tab */}
        {mainTab === 'backlinks' && (
          <PageContainerBody>
            {/* Progress Bar for Backlinks */}
            <div className="mb-6">
              <p className="text-sm font-medium text-dark mb-2">
                {selectedMonth}: {backlinksLive} links live ({backlinksProgress}%)
              </p>
              <div className="w-full bg-lightGray rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${backlinksProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Backlinks Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-lightGray">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">DR</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Link Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Target Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Went Live On</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-mediumGray uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="card bg-white divide-y divide-lightGray" style={{ color: '#353233' }}>
                  {filteredBacklinks.map((backlink) => (
                    <tr key={backlink.id} className="hover:bg-lightGray">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark">{backlink.domain}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 rounded-full">{backlink.dr}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{backlink.linkType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{backlink.targetPage}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${backlink.status === 'Live' ? 'bg-green-100 text-green-800' :
                            backlink.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'}`}>
                          {backlink.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{backlink.wentLiveOn || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-mediumGray">{backlink.notes || '—'}</td>
                    </tr>
                  ))}

                  {filteredBacklinks.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-mediumGray">
                        No backlinks found for this month
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Filter Controls */}
            <div className="mt-4 flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-medium text-mediumGray mb-1">Filter by Status</label>
                <select
                  className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                  // onChange handler would be added here
                >
                  <option value="all">All Statuses</option>
                  <option value="Live">Live</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-mediumGray mb-1">Filter by DR</label>
                <select
                  className="px-3 py-2 text-sm border border-lightGray rounded-md bg-white"
                  // onChange handler would be added here
                >
                  <option value="all">All DR</option>
                  <option value="50+">DR 50+</option>
                  <option value="60+">DR 60+</option>
                  <option value="70+">DR 70+</option>
                </select>
              </div>
            </div>
          </PageContainerBody>
        )}
      </PageContainer>


    </DashboardLayout>
    </DndProvider>
  );
}
