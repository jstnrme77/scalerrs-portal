'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ReactNode } from 'react';
import BriefColumn from './BriefColumn';
import ArticleColumn from './ArticleColumn';
import { Brief, BriefStatus, Article, ArticleStatus } from '@/types';

interface BriefBoardProps {
  briefs: Brief[];
  selectedMonth: string;
  onStatusChange: (id: string, newStatus: BriefStatus) => void;
}

export function BriefBoard({ briefs, selectedMonth, onStatusChange }: BriefBoardProps) {
  // Filter briefs by status
  const reviewBriefs = briefs.filter(brief => brief.Status === 'Review Brief' || brief.Status === 'Needs Review');
  const inProgressBriefs = briefs.filter(brief => brief.Status === 'In Progress');
  const needsInputBriefs = briefs.filter(brief => brief.Status === 'Needs Input');
  const approvedBriefs = briefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Needs Your Review Column */}
        <BriefColumn
          title="Needs Your Review"
          status="Needs Review"
          briefs={reviewBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f9f0ff]"
          onStatusChange={onStatusChange}
          count={reviewBriefs.length}
        />

        {/* In Progress Column */}
        <BriefColumn
          title="In Progress"
          status="In Progress"
          briefs={inProgressBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f0f4ff]"
          onStatusChange={onStatusChange}
          count={inProgressBriefs.length}
        />

        {/* Needs Input Column */}
        <BriefColumn
          title="Needs Input"
          status="Needs Input"
          briefs={needsInputBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-white"
          onStatusChange={onStatusChange}
          count={needsInputBriefs.length}
        />

        {/* Brief Approved Column */}
        <BriefColumn
          title="Brief Approved"
          status="Approved"
          briefs={approvedBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f0fff4]"
          onStatusChange={onStatusChange}
          count={approvedBriefs.length}
        />
      </div>
    </DndProvider>
  );
}

interface ArticleBoardProps {
  articles: Article[];
  selectedMonth: string;
  onStatusChange: (id: string, newStatus: ArticleStatus) => void;
}

export function ArticleBoard({ articles, selectedMonth, onStatusChange }: ArticleBoardProps) {
  // Filter articles by status
  const inProductionArticles = articles.filter(article => article.Status === 'In Production');
  const reviewDraftArticles = articles.filter(article => article.Status === 'Review Draft');
  const draftApprovedArticles = articles.filter(article => article.Status === 'Draft Approved');
  const toBePublishedArticles = articles.filter(article => article.Status === 'To Be Published');
  const liveArticles = articles.filter(article => article.Status === 'Live');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* In Production Column */}
        <ArticleColumn
          title="In Production"
          status="In Production"
          articles={inProductionArticles}
          bgColor="bg-[#f0f4ff]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
        />

        {/* Review Draft Column */}
        <ArticleColumn
          title="Review Draft"
          status="Review Draft"
          articles={reviewDraftArticles}
          bgColor="bg-[#f9f0ff]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
        />

        {/* Draft Approved Column */}
        <ArticleColumn
          title="Draft Approved"
          status="Draft Approved"
          articles={draftApprovedArticles}
          bgColor="bg-[#cfe2ff]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
        />

        {/* To Be Published Column */}
        <ArticleColumn
          title="To Be Published"
          status="To Be Published"
          articles={toBePublishedArticles}
          bgColor="bg-[#e2e3e5]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
        />

        {/* Live Column */}
        <ArticleColumn
          title="Live"
          status="Live"
          articles={liveArticles}
          bgColor="bg-[#d1e7dd]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
        />
      </div>
    </DndProvider>
  );
}
