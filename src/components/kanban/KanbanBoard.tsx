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
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export function BriefBoard({ briefs, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: BriefBoardProps) {
  // Filter briefs by status
  const inProgressBriefs = briefs.filter(brief => brief.Status === 'In Progress');
  const needsInputBriefs = briefs.filter(brief => brief.Status === 'Needs Input');
  const reviewBriefs = briefs.filter(brief => brief.Status === 'Review Brief' || brief.Status === 'Needs Review');
  const approvedBriefs = briefs.filter(brief => brief.Status === 'Brief Approved' || brief.Status === 'Approved');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* In Progress Column */}
        <BriefColumn
          title="In Progress"
          status="In Progress"
          briefs={inProgressBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f0f4ff]"
          onStatusChange={onStatusChange}
          count={inProgressBriefs.length}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
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
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* Review Brief Column */}
        <BriefColumn
          title="Review Brief"
          status="Review Brief"
          briefs={reviewBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f9f0ff]"
          onStatusChange={onStatusChange}
          count={reviewBriefs.length}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* Brief Approved Column */}
        <BriefColumn
          title="Brief Approved"
          status="Brief Approved"
          briefs={approvedBriefs}
          selectedMonth={selectedMonth}
          bgColor="bg-[#f0fff4]"
          onStatusChange={onStatusChange}
          count={approvedBriefs.length}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />
      </div>
    </DndProvider>
  );
}

interface ArticleBoardProps {
  articles: Article[];
  selectedMonth: string;
  onStatusChange: (id: string, newStatus: ArticleStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export function ArticleBoard({ articles, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: ArticleBoardProps) {
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
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* Review Draft Column */}
        <ArticleColumn
          title="Review Draft"
          status="Review Draft"
          articles={reviewDraftArticles}
          bgColor="bg-[#f9f0ff]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* Draft Approved Column */}
        <ArticleColumn
          title="Draft Approved"
          status="Draft Approved"
          articles={draftApprovedArticles}
          bgColor="bg-[#cfe2ff]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* To Be Published Column */}
        <ArticleColumn
          title="To Be Published"
          status="To Be Published"
          articles={toBePublishedArticles}
          bgColor="bg-[#e2e3e5]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />

        {/* Live Column */}
        <ArticleColumn
          title="Live"
          status="Live"
          articles={liveArticles}
          bgColor="bg-[#d1e7dd]"
          selectedMonth={selectedMonth}
          onStatusChange={onStatusChange}
          hideActions={hideActions}
          onViewDocument={onViewDocument}
        />
      </div>
    </DndProvider>
  );
}
