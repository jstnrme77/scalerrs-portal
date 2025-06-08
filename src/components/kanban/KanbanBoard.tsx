'use client';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ChevronRight } from 'lucide-react';

import BriefColumn from './BriefColumn';
import ArticleColumn from './ArticleColumn';
import YouTubeColumn from './YouTubeColumn';
import RedditColumn from './RedditColumn';
import { Brief, BriefStatus, Article, ArticleStatus, YouTube, YouTubeStatus, Reddit, RedditStatus } from '@/types';

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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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
            <div className="w-[500px]">
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

interface YouTubeBoardProps {
  videos: YouTube[];
  selectedMonth: string;
  onStatusChange: (id: string, newStatus: YouTubeStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export function YouTubeBoard({ videos, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: YouTubeBoardProps) {
  console.log(`YouTubeBoard received ${videos.length} videos for month: ${selectedMonth}`);
  
  // Debug the videos data
  if (videos.length > 0) {
    console.log('First 3 YouTube videos data:');
    videos.slice(0, 3).forEach((video, index) => {
      console.log(`Video ${index}:`, {
        id: video.id,
        title: video['Video Title'] || video['Keyword Topic'],
        targetMonth: video['Target Month'],
        status: video['YouTube Status']
      });
    });
  } else {
    console.log('No YouTube videos available - checking for format issues');
  }
  
  // Filter videos by status using predefined statuses
  const ideaProposedVideos = videos.filter(video => video['YouTube Status'] === 'Idea Proposed');
  const ideaAwaitingClientApprovalVideos = videos.filter(video => video['YouTube Status'] === 'Idea Awaiting Client Approval');
  const ideaApprovedVideos = videos.filter(video => video['YouTube Status'] === 'Idea Approved');
  const ideaToDoNextVideos = videos.filter(video => video['YouTube Status'] === 'Idea To Do Next');
  const scriptCreationNeededVideos = videos.filter(video => video['YouTube Status'] === 'Script Creation Needed');
  const scriptUnderInternalReviewVideos = videos.filter(video => video['YouTube Status'] === 'Script Under Internal Review');
  const scriptAwaitingClientDepthVideos = videos.filter(video => video['YouTube Status'] === 'Script Awaiting Client Depth');
  const scriptNeedsRevisionVideos = videos.filter(video => video['YouTube Status'] === 'Script Needs Revision');
  const scriptApprovedVideos = videos.filter(video => video['YouTube Status'] === 'Script Approved');
  const videoInRecordingVideos = videos.filter(video => video['YouTube Status'] === 'Video In Recording');
  const videoInEditingVideos = videos.filter(video => video['YouTube Status'] === 'Video In Editing');
  const videoReadyVideos = videos.filter(video => video['YouTube Status'] === 'Video Ready');
  const thumbnailInCreationVideos = videos.filter(video => video['YouTube Status'] === 'Thumbnail In Creation');
  const thumbnailDoneVideos = videos.filter(video => video['YouTube Status'] === 'Thumbnail Done');
  const readyToUploadVideos = videos.filter(video => video['YouTube Status'] === 'Ready To Upload');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          {/* Kanban board with fixed-width columns */}
          <div className="flex space-x-6 min-w-max">
            {/* Idea Proposed Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Idea Proposed"
                status="Idea Proposed"
                videos={ideaProposedVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={ideaProposedVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Idea Awaiting Client Approval Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Idea Awaiting Client Approval"
                status="Idea Awaiting Client Approval"
                videos={ideaAwaitingClientApprovalVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={ideaAwaitingClientApprovalVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Idea Approved Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Idea Approved"
                status="Idea Approved"
                videos={ideaApprovedVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={ideaApprovedVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Idea To Do Next Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Idea To Do Next"
                status="Idea To Do Next"
                videos={ideaToDoNextVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={ideaToDoNextVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Script Creation Needed Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Script Creation Needed"
                status="Script Creation Needed"
                videos={scriptCreationNeededVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={scriptCreationNeededVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Script Under Internal Review Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Script Under Internal Review"
                status="Script Under Internal Review"
                videos={scriptUnderInternalReviewVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={scriptUnderInternalReviewVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Script Awaiting Client Depth Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Script Awaiting Client Depth"
                status="Script Awaiting Client Depth"
                videos={scriptAwaitingClientDepthVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={scriptAwaitingClientDepthVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Script Needs Revision Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Script Needs Revision"
                status="Script Needs Revision"
                videos={scriptNeedsRevisionVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={scriptNeedsRevisionVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Script Approved Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Script Approved"
                status="Script Approved"
                videos={scriptApprovedVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={scriptApprovedVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Video In Recording Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Video In Recording"
                status="Video In Recording"
                videos={videoInRecordingVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={videoInRecordingVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Video In Editing Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Video In Editing"
                status="Video In Editing"
                videos={videoInEditingVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={videoInEditingVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Video Ready Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Video Ready"
                status="Video Ready"
                videos={videoReadyVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={videoReadyVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thumbnail In Creation Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Thumbnail In Creation"
                status="Thumbnail In Creation"
                videos={thumbnailInCreationVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={thumbnailInCreationVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thumbnail Done Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Thumbnail Done"
                status="Thumbnail Done"
                videos={thumbnailDoneVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={thumbnailDoneVideos.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Ready To Upload Column */}
            <div className="w-[500px]">
              <YouTubeColumn
                title="Ready To Upload"
                status="Ready To Upload"
                videos={readyToUploadVideos}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={readyToUploadVideos.length}
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

interface RedditBoardProps {
  threads: Reddit[];
  selectedMonth: string;
  onStatusChange: (id: string, newStatus: RedditStatus) => void;
  hideActions?: boolean;
  onViewDocument?: (url: string, title: string) => void;
}

export function RedditBoard({ threads, selectedMonth, onStatusChange, hideActions = false, onViewDocument }: RedditBoardProps) {
  // Filter threads by status
  const threadProposedThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread Proposed');
  const threadAwaitingInternalApprovalThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread Awaiting Internal Approval (Scalerrs)');
  const threadAwaitingClientApprovalThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread Awaiting Client Approval (Client)');
  const threadApprovedThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread Approved');
  const threadToDoNextThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread To Do Next (External)');
  const threadInProcessThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread In Process (External)');
  const threadDoneThreads = threads.filter(thread => thread['Reddit Thread Status (General)'] === 'Thread Done');

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        {/* Horizontal scrollable container */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          {/* Kanban board with fixed-width columns */}
          <div className="flex space-x-6 min-w-max">
            {/* Thread Proposed Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread Proposed"
                status="Thread Proposed"
                threads={threadProposedThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadProposedThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread Awaiting Internal Approval Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread Awaiting Internal Approval"
                status="Thread Awaiting Internal Approval (Scalerrs)"
                threads={threadAwaitingInternalApprovalThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadAwaitingInternalApprovalThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread Awaiting Client Approval Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread Awaiting Client Approval"
                status="Thread Awaiting Client Approval (Client)"
                threads={threadAwaitingClientApprovalThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadAwaitingClientApprovalThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread Approved Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread Approved"
                status="Thread Approved"
                threads={threadApprovedThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadApprovedThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread To Do Next Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread To Do Next"
                status="Thread To Do Next (External)"
                threads={threadToDoNextThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadToDoNextThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread In Process Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread In Process"
                status="Thread In Process (External)"
                threads={threadInProcessThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadInProcessThreads.length}
                hideActions={hideActions}
                onViewDocument={onViewDocument}
              />
            </div>

            {/* Thread Done Column */}
            <div className="w-[500px]">
              <RedditColumn
                title="Thread Done"
                status="Thread Done"
                threads={threadDoneThreads}
                selectedMonth={selectedMonth}
                bgColor="bg-white"
                onStatusChange={onStatusChange}
                count={threadDoneThreads.length}
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
