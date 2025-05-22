'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronRight } from 'lucide-react';

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
  console.log('BriefBoard received briefs:', briefs);
  console.log('BriefBoard received selectedMonth:', selectedMonth);

  // Check if briefs is undefined or empty
  if (!briefs || briefs.length === 0) {
    console.log('No briefs data available in BriefBoard component');
  }

  // Filter briefs by status using the new Keyword/Content Status values
  const briefCreationNeededBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Creation Needed' ||
    brief.Status === 'In Progress' ||
    brief.Status === 'New' ||
    brief.Status === 'Refresh'
  );

  const briefUnderInternalReviewBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Under Internal Review' ||
    brief.Status === 'Review Brief'
  );

  const briefAwaitingClientDepthBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Awaiting Client Depth'
  );

  const briefAwaitingClientReviewBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Awaiting Client Review' ||
    brief.Status === 'Needs Review'
  );

  const briefNeedsRevisionBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Needs Revision' ||
    brief.Status === 'Needs Input'
  );

  const briefApprovedBriefs = briefs.filter(brief =>
    brief.Status === 'Brief Approved'
  );

  console.log('Filtered briefs by status:');
  console.log('Brief Creation Needed:', briefCreationNeededBriefs.length);
  console.log('Brief Under Internal Review:', briefUnderInternalReviewBriefs.length);
  console.log('Brief Awaiting Client Depth:', briefAwaitingClientDepthBriefs.length);
  console.log('Brief Awaiting Client Review:', briefAwaitingClientReviewBriefs.length);
  console.log('Brief Needs Revision:', briefNeedsRevisionBriefs.length);
  console.log('Brief Approved:', briefApprovedBriefs.length);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          {/* Kanban board with fixed-width columns */}
          <div className="flex space-x-6 min-w-max">
            {/* Brief Creation Needed Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Creation Needed"
                status="Brief Creation Needed"
                briefs={briefCreationNeededBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefCreationNeededBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Brief Under Internal Review Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Under Internal Review"
                status="Brief Under Internal Review"
                briefs={briefUnderInternalReviewBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefUnderInternalReviewBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Brief Awaiting Client Depth Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Awaiting Client Depth"
                status="Brief Awaiting Client Depth"
                briefs={briefAwaitingClientDepthBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefAwaitingClientDepthBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Brief Awaiting Client Review Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Awaiting Client Review"
                status="Brief Awaiting Client Review"
                briefs={briefAwaitingClientReviewBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefAwaitingClientReviewBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Brief Needs Revision Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Needs Revision"
                status="Brief Needs Revision"
                briefs={briefNeedsRevisionBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefNeedsRevisionBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Brief Approved Column */}
            <div className="w-[400px]">
              <BriefColumn
                title="Brief Approved"
                status="Brief Approved"
                briefs={briefApprovedBriefs}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={briefApprovedBriefs.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>
          </div>
        </div>
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
  // Filter articles by status using the new Keyword/Content Status values
  const awaitingWriterAssignmentArticles = articles.filter(article => article.Status === 'Awaiting Writer Assignment');
  
  // Only include articles explicitly with Writing In Progress or In Production status
  const writingInProgressArticles = articles.filter(article => 
    article.Status === 'Writing In Progress' || article.Status === 'In Production'
  );

  const underClientReviewArticles = articles.filter(article => article.Status === 'Under Client Review');
  const underEditorReviewArticles = articles.filter(article => article.Status === 'Under Editor Review' || article.Status === 'Review Draft');
  const writerRevisionNeededArticles = articles.filter(article => article.Status === 'Writer Revision Needed');
  const contentApprovedArticles = articles.filter(article => article.Status === 'Content Approved' || article.Status === 'Draft Approved');
  const visualAssetsNeededArticles = articles.filter(article => article.Status === 'Visual Assets Needed');
  const visualAssetsCompleteArticles = articles.filter(article => article.Status === 'Visual Assets Complete');
  const readyForCmsUploadArticles = articles.filter(article => article.Status === 'Ready for CMS Upload');
  const internalLinkingNeededArticles = articles.filter(article => article.Status === 'Internal Linking Needed');
  const readyForPublicationArticles = articles.filter(article => article.Status === 'Ready for Publication' || article.Status === 'To Be Published');
  const publishedArticles = articles.filter(article => article.Status === 'Published' || article.Status === 'Live');
  const reverseInternalLinkingNeededArticles = articles.filter(article => article.Status === 'Reverse Internal Linking Needed');
  const completeArticles = articles.filter(article => article.Status === 'Complete');
  const cancelledArticles = articles.filter(article => article.Status === 'Cancelled');
  const onHoldArticles = articles.filter(article => article.Status === 'On Hold');
  const contentPublishedArticles = articles.filter(article => article.Status === 'Content Published');

  // Count articles in each status
  console.log('Articles by status:');
  console.log('Awaiting Writer Assignment:', awaitingWriterAssignmentArticles.length);
  console.log('Writing In Progress:', writingInProgressArticles.length);
  console.log('Under Client Review:', underClientReviewArticles.length);
  console.log('Under Editor Review:', underEditorReviewArticles.length);
  console.log('Writer Revision Needed:', writerRevisionNeededArticles.length);
  console.log('Content Approved:', contentApprovedArticles.length);
  console.log('Visual Assets Needed:', visualAssetsNeededArticles.length);
  console.log('Visual Assets Complete:', visualAssetsCompleteArticles.length);
  console.log('Ready for CMS Upload:', readyForCmsUploadArticles.length);
  console.log('Internal Linking Needed:', internalLinkingNeededArticles.length);
  console.log('Ready for Publication:', readyForPublicationArticles.length);
  console.log('Published:', publishedArticles.length);
  console.log('Reverse Internal Linking Needed:', reverseInternalLinkingNeededArticles.length);
  console.log('Complete:', completeArticles.length);
  console.log('Cancelled:', cancelledArticles.length);
  console.log('On Hold:', onHoldArticles.length);
  console.log('Content Published:', contentPublishedArticles.length);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          {/* Kanban board with fixed-width columns */}
          <div className="flex space-x-6 min-w-max">
            {/* Awaiting Writer Assignment Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Awaiting Writer Assignment"
                status="Awaiting Writer Assignment"
                articles={awaitingWriterAssignmentArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Writing In Progress Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Writing In Progress"
                status="Writing In Progress"
                articles={writingInProgressArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Under Client Review Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Under Client Review"
                status="Under Client Review"
                articles={underClientReviewArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Under Editor Review Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Under Editor Review"
                status="Under Editor Review"
                articles={underEditorReviewArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Writer Revision Needed Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Writer Revision Needed"
                status="Writer Revision Needed"
                articles={writerRevisionNeededArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Content Approved Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Content Approved"
                status="Content Approved"
                articles={contentApprovedArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Visual Assets Needed Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Visual Assets Needed"
                status="Visual Assets Needed"
                articles={visualAssetsNeededArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Visual Assets Complete Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Visual Assets Complete"
                status="Visual Assets Complete"
                articles={visualAssetsCompleteArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Ready for CMS Upload Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Ready for CMS Upload"
                status="Ready for CMS Upload"
                articles={readyForCmsUploadArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Internal Linking Needed Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Internal Linking Needed"
                status="Internal Linking Needed"
                articles={internalLinkingNeededArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Ready for Publication Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Ready for Publication"
                status="Ready for Publication"
                articles={readyForPublicationArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Published Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Published"
                status="Published"
                articles={publishedArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Reverse Internal Linking Needed Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Reverse Internal Linking Needed"
                status="Reverse Internal Linking Needed"
                articles={reverseInternalLinkingNeededArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Complete Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Complete"
                status="Complete"
                articles={completeArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Cancelled Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Cancelled"
                status="Cancelled"
                articles={cancelledArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* On Hold Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="On Hold"
                status="On Hold"
                articles={onHoldArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Content Published Column */}
            <div className="w-[400px]">
              <ArticleColumn
                title="Content Published"
                status="Content Published"
                articles={contentPublishedArticles}
                bgColor="bg-white"
                selectedMonth={selectedMonth}
                onStatusChange={onStatusChange}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
