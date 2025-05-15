/**
 * Utilities for handling status values across the application
 * This centralizes status mapping and filtering logic
 */
import { Brief, BriefStatus, Article, ArticleStatus } from '@/types';

// Status constants for briefs
export const BRIEF_STATUSES = {
  IN_PROGRESS: 'In Progress' as BriefStatus,
  NEEDS_INPUT: 'Needs Input' as BriefStatus,
  REVIEW_BRIEF: 'Review Brief' as BriefStatus,
  BRIEF_APPROVED: 'Brief Approved' as BriefStatus,
};

// Status constants for articles
export const ARTICLE_STATUSES = {
  IN_PRODUCTION: 'In Production' as ArticleStatus,
  REVIEW_DRAFT: 'Review Draft' as ArticleStatus,
  DRAFT_APPROVED: 'Draft Approved' as ArticleStatus,
  TO_BE_PUBLISHED: 'To Be Published' as ArticleStatus,
  LIVE: 'Live' as ArticleStatus,
};

/**
 * Map Airtable brief status to UI brief status
 * @param airtableStatus Status from Airtable
 * @returns Standardized brief status for UI
 */
export const mapAirtableBriefStatus = (airtableStatus: string): BriefStatus => {
  const statusLower = airtableStatus.toLowerCase();
  
  // In Progress
  if (
    statusLower.includes('creation') || 
    statusLower.includes('in progress') ||
    statusLower === 'brief creation needed' ||
    statusLower === 'brief in progress'
  ) {
    return BRIEF_STATUSES.IN_PROGRESS;
  }
  
  // Needs Input
  if (
    statusLower.includes('needs input') || 
    statusLower.includes('revision') ||
    statusLower === 'brief needs revision'
  ) {
    return BRIEF_STATUSES.NEEDS_INPUT;
  }
  
  // Review Brief
  if (
    statusLower.includes('review') || 
    statusLower.includes('awaiting') ||
    statusLower === 'brief under internal review' ||
    statusLower === 'needs review' ||
    statusLower === 'brief awaiting client review'
  ) {
    return BRIEF_STATUSES.REVIEW_BRIEF;
  }
  
  // Brief Approved
  if (
    statusLower.includes('approved') ||
    statusLower === 'brief approved' ||
    statusLower === 'brief awaiting client depth'
  ) {
    return BRIEF_STATUSES.BRIEF_APPROVED;
  }
  
  // Default
  return BRIEF_STATUSES.IN_PROGRESS;
};

/**
 * Map Airtable article status to UI article status
 * @param airtableStatus Status from Airtable
 * @returns Standardized article status for UI
 */
export const mapAirtableArticleStatus = (airtableStatus: string): ArticleStatus => {
  const statusLower = airtableStatus.toLowerCase();
  
  // In Production
  if (
    statusLower.includes('production') ||
    statusLower === 'in production'
  ) {
    return ARTICLE_STATUSES.IN_PRODUCTION;
  }
  
  // Review Draft
  if (
    statusLower.includes('review draft') ||
    statusLower === 'review draft'
  ) {
    return ARTICLE_STATUSES.REVIEW_DRAFT;
  }
  
  // Draft Approved
  if (
    statusLower.includes('draft approved') ||
    statusLower === 'draft approved'
  ) {
    return ARTICLE_STATUSES.DRAFT_APPROVED;
  }
  
  // To Be Published
  if (
    statusLower.includes('to be published') ||
    statusLower === 'to be published'
  ) {
    return ARTICLE_STATUSES.TO_BE_PUBLISHED;
  }
  
  // Live
  if (
    statusLower.includes('live') ||
    statusLower === 'live'
  ) {
    return ARTICLE_STATUSES.LIVE;
  }
  
  // Default
  return ARTICLE_STATUSES.IN_PRODUCTION;
};

/**
 * Filter briefs by status
 * @param briefs Array of briefs
 * @param status Status to filter by
 * @returns Filtered briefs
 */
export const filterBriefsByStatus = (briefs: Brief[], status: BriefStatus): Brief[] => {
  switch (status) {
    case BRIEF_STATUSES.IN_PROGRESS:
      return briefs.filter(brief => 
        brief.Status === BRIEF_STATUSES.IN_PROGRESS ||
        brief.Status === 'Brief Creation Needed'
      );
      
    case BRIEF_STATUSES.NEEDS_INPUT:
      return briefs.filter(brief => 
        brief.Status === BRIEF_STATUSES.NEEDS_INPUT ||
        brief.Status === 'Brief Needs Revision'
      );
      
    case BRIEF_STATUSES.REVIEW_BRIEF:
      return briefs.filter(brief => 
        brief.Status === BRIEF_STATUSES.REVIEW_BRIEF ||
        brief.Status === 'Brief Under Internal Review' ||
        brief.Status === 'Needs Review' ||
        brief.Status === 'Brief Awaiting Client Review'
      );
      
    case BRIEF_STATUSES.BRIEF_APPROVED:
      return briefs.filter(brief => 
        brief.Status === BRIEF_STATUSES.BRIEF_APPROVED ||
        brief.Status === 'Brief Awaiting Client Depth'
      );
      
    default:
      return briefs;
  }
};

/**
 * Filter articles by status
 * @param articles Array of articles
 * @param status Status to filter by
 * @returns Filtered articles
 */
export const filterArticlesByStatus = (articles: Article[], status: ArticleStatus): Article[] => {
  return articles.filter(article => article.Status === status);
};

/**
 * Check if a brief status change is valid
 * @param currentStatus Current brief status
 * @param newStatus New brief status
 * @returns Whether the status change is valid
 */
export const isValidBriefStatusChange = (currentStatus: BriefStatus, newStatus: BriefStatus): boolean => {
  // Allow all status changes for now
  // This can be expanded with specific business rules later
  return true;
};

/**
 * Check if an article status change is valid
 * @param currentStatus Current article status
 * @param newStatus New article status
 * @returns Whether the status change is valid
 */
export const isValidArticleStatusChange = (currentStatus: ArticleStatus, newStatus: ArticleStatus): boolean => {
  // Allow all status changes for now
  // This can be expanded with specific business rules later
  return true;
};
