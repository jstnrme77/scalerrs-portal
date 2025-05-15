'use client';

/**
 * Test component for the refactored kanban components
 * This is for testing purposes only and should not be used in production
 */
import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BriefColumn from './BriefColumn';
import ArticleColumn from './ArticleColumn';
import { Brief, BriefStatus, Article, ArticleStatus } from '@/types';
import { BRIEF_STATUSES, ARTICLE_STATUSES } from '@/utils/status-utils';

// Sample data for testing
const sampleBriefs: Brief[] = [
  {
    id: 'brief1',
    Title: 'Sample Brief 1',
    Status: 'In Progress' as BriefStatus,
    DueDate: new Date().toISOString(),
    'SEO Strategist': 'John Doe',
    Client: 'Client A',
    DocumentLink: 'https://example.com/doc1',
    'TargetKeywords': 'keyword1, keyword2',
    'WordCountTarget': 1500
  },
  {
    id: 'brief2',
    Title: 'Sample Brief 2',
    Status: 'Needs Input' as BriefStatus,
    DueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    'SEO Strategist': 'Jane Smith',
    Client: 'Client B',
    DocumentLink: 'https://example.com/doc2',
    'FraseDocumentLink': 'https://example.com/frase2'
  }
];

const sampleArticles: Article[] = [
  {
    id: 'article1',
    Title: 'Sample Article 1',
    Status: 'In Production' as ArticleStatus,
    DueDate: new Date().toISOString(),
    Writer: 'Alice Johnson',
    Client: 'Client A',
    DocumentLink: 'https://example.com/article1',
    WordCount: 1200
  },
  {
    id: 'article2',
    Title: 'Sample Article 2',
    Status: 'Review Draft' as ArticleStatus,
    DueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    'Content Writer': 'Bob Williams',
    Client: 'Client B',
    'Document Link': 'https://example.com/article2',
    'GoogleDocLink': 'https://example.com/gdoc2',
    'TargetURL': 'https://example.com/target2'
  }
];

export default function TestKanban() {
  const [briefs, setBriefs] = useState<Brief[]>(sampleBriefs);
  const [articles, setArticles] = useState<Article[]>(sampleArticles);
  const [selectedMonth, setSelectedMonth] = useState<string>('April 2023');

  // Handle brief status change
  const handleBriefStatusChange = (id: string, newStatus: BriefStatus) => {
    setBriefs(prevBriefs => 
      prevBriefs.map(brief => 
        brief.id === id ? { ...brief, Status: newStatus } : brief
      )
    );
  };

  // Handle article status change
  const handleArticleStatusChange = (id: string, newStatus: ArticleStatus) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === id ? { ...article, Status: newStatus } : article
      )
    );
  };

  // Handle document view
  const handleViewDocument = (url: string, title: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Kanban Test</h1>
      
      <h2 className="text-xl font-semibold mb-4">Briefs</h2>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <BriefColumn
            title="In Progress"
            status={BRIEF_STATUSES.IN_PROGRESS}
            briefs={briefs.filter(brief => brief.Status === BRIEF_STATUSES.IN_PROGRESS)}
            selectedMonth={selectedMonth}
            bgColor="bg-blue-100"
            onStatusChange={handleBriefStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <BriefColumn
            title="Needs Input"
            status={BRIEF_STATUSES.NEEDS_INPUT}
            briefs={briefs.filter(brief => brief.Status === BRIEF_STATUSES.NEEDS_INPUT)}
            selectedMonth={selectedMonth}
            bgColor="bg-yellow-100"
            onStatusChange={handleBriefStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <BriefColumn
            title="Review Brief"
            status={BRIEF_STATUSES.REVIEW_BRIEF}
            briefs={briefs.filter(brief => brief.Status === BRIEF_STATUSES.REVIEW_BRIEF)}
            selectedMonth={selectedMonth}
            bgColor="bg-purple-100"
            onStatusChange={handleBriefStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <BriefColumn
            title="Brief Approved"
            status={BRIEF_STATUSES.BRIEF_APPROVED}
            briefs={briefs.filter(brief => brief.Status === BRIEF_STATUSES.BRIEF_APPROVED)}
            selectedMonth={selectedMonth}
            bgColor="bg-green-100"
            onStatusChange={handleBriefStatusChange}
            onViewDocument={handleViewDocument}
          />
        </div>
      </DndProvider>
      
      <h2 className="text-xl font-semibold mb-4">Articles</h2>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ArticleColumn
            title="In Production"
            status={ARTICLE_STATUSES.IN_PRODUCTION}
            articles={articles.filter(article => article.Status === ARTICLE_STATUSES.IN_PRODUCTION)}
            selectedMonth={selectedMonth}
            bgColor="bg-blue-100"
            onStatusChange={handleArticleStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <ArticleColumn
            title="Review Draft"
            status={ARTICLE_STATUSES.REVIEW_DRAFT}
            articles={articles.filter(article => article.Status === ARTICLE_STATUSES.REVIEW_DRAFT)}
            selectedMonth={selectedMonth}
            bgColor="bg-yellow-100"
            onStatusChange={handleArticleStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <ArticleColumn
            title="Draft Approved"
            status={ARTICLE_STATUSES.DRAFT_APPROVED}
            articles={articles.filter(article => article.Status === ARTICLE_STATUSES.DRAFT_APPROVED)}
            selectedMonth={selectedMonth}
            bgColor="bg-purple-100"
            onStatusChange={handleArticleStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <ArticleColumn
            title="To Be Published"
            status={ARTICLE_STATUSES.TO_BE_PUBLISHED}
            articles={articles.filter(article => article.Status === ARTICLE_STATUSES.TO_BE_PUBLISHED)}
            selectedMonth={selectedMonth}
            bgColor="bg-indigo-100"
            onStatusChange={handleArticleStatusChange}
            onViewDocument={handleViewDocument}
          />
          
          <ArticleColumn
            title="Live"
            status={ARTICLE_STATUSES.LIVE}
            articles={articles.filter(article => article.Status === ARTICLE_STATUSES.LIVE)}
            selectedMonth={selectedMonth}
            bgColor="bg-green-100"
            onStatusChange={handleArticleStatusChange}
            onViewDocument={handleViewDocument}
          />
        </div>
      </DndProvider>
    </div>
  );
}
