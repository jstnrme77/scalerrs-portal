/**
 * Utilities for handling status values across the application
 * This centralizes status mapping and filtering logic
 */
import { Brief, BriefStatus, Article, ArticleStatus } from '@/types';

// Status constants for briefs
export const BRIEF_STATUSES = {
  // New statuses from Keyword/Content Status field
  BRIEF_CREATION_NEEDED: 'Brief Creation Needed' as BriefStatus,
  BRIEF_UNDER_INTERNAL_REVIEW: 'Brief Under Internal Review' as BriefStatus,
  BRIEF_AWAITING_CLIENT_DEPTH: 'Brief Awaiting Client Depth' as BriefStatus,
  BRIEF_AWAITING_CLIENT_REVIEW: 'Brief Awaiting Client Review' as BriefStatus,
  BRIEF_NEEDS_REVISION: 'Brief Needs Revision' as BriefStatus,
  BRIEF_APPROVED: 'Brief Approved' as BriefStatus,

  // Legacy statuses for backward compatibility
  IN_PROGRESS: 'In Progress' as BriefStatus,
  NEEDS_INPUT: 'Needs Input' as BriefStatus,
  REVIEW_BRIEF: 'Review Brief' as BriefStatus,
};

// Status constants for articles
export const ARTICLE_STATUSES = {
  // New statuses from Keyword/Content Status field
  AWAITING_WRITER_ASSIGNMENT: 'Awaiting Writer Assignment' as ArticleStatus,
  WRITING_IN_PROGRESS: 'Writing In Progress' as ArticleStatus,
  UNDER_CLIENT_REVIEW: 'Under Client Review' as ArticleStatus,
  UNDER_EDITOR_REVIEW: 'Under Editor Review' as ArticleStatus,
  WRITER_REVISION_NEEDED: 'Writer Revision Needed' as ArticleStatus,
  CONTENT_APPROVED: 'Content Approved' as ArticleStatus,
  VISUAL_ASSETS_NEEDED: 'Visual Assets Needed' as ArticleStatus,
  VISUAL_ASSETS_COMPLETE: 'Visual Assets Complete' as ArticleStatus,
  READY_FOR_CMS_UPLOAD: 'Ready for CMS Upload' as ArticleStatus,
  INTERNAL_LINKING_NEEDED: 'Internal Linking Needed' as ArticleStatus,
  READY_FOR_PUBLICATION: 'Ready for Publication' as ArticleStatus,
  PUBLISHED: 'Published' as ArticleStatus,
  REVERSE_INTERNAL_LINKING_NEEDED: 'Reverse Internal Linking Needed' as ArticleStatus,
  COMPLETE: 'Complete' as ArticleStatus,
  CANCELLED: 'Cancelled' as ArticleStatus,
  ON_HOLD: 'On Hold' as ArticleStatus,
  CONTENT_PUBLISHED: 'Content Published' as ArticleStatus,

  // Legacy statuses for backward compatibility
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

  // Direct matches for new statuses
  if (statusLower === 'brief creation needed') {
    return BRIEF_STATUSES.BRIEF_CREATION_NEEDED;
  }

  if (statusLower === 'brief under internal review') {
    return BRIEF_STATUSES.BRIEF_UNDER_INTERNAL_REVIEW;
  }

  if (statusLower === 'brief awaiting client depth') {
    return BRIEF_STATUSES.BRIEF_AWAITING_CLIENT_DEPTH;
  }

  if (statusLower === 'brief awaiting client review') {
    return BRIEF_STATUSES.BRIEF_AWAITING_CLIENT_REVIEW;
  }

  if (statusLower === 'brief needs revision') {
    return BRIEF_STATUSES.BRIEF_NEEDS_REVISION;
  }

  if (statusLower === 'brief approved') {
    return BRIEF_STATUSES.BRIEF_APPROVED;
  }

  // Legacy status mappings for backward compatibility
  if (
    statusLower.includes('creation') ||
    statusLower.includes('in progress') ||
    statusLower === 'brief in progress'
  ) {
    return BRIEF_STATUSES.BRIEF_CREATION_NEEDED;
  }

  if (
    statusLower.includes('needs input') ||
    statusLower.includes('revision')
  ) {
    return BRIEF_STATUSES.BRIEF_NEEDS_REVISION;
  }

  if (
    statusLower.includes('review') ||
    statusLower.includes('awaiting') ||
    statusLower === 'needs review'
  ) {
    return BRIEF_STATUSES.BRIEF_UNDER_INTERNAL_REVIEW;
  }

  if (
    statusLower.includes('approved')
  ) {
    return BRIEF_STATUSES.BRIEF_APPROVED;
  }

  // Default to Brief Creation Needed if no match
  return BRIEF_STATUSES.BRIEF_CREATION_NEEDED;
};

/**
 * Map Airtable article status to UI article status
 * @param airtableStatus Status from Airtable
 * @returns Standardized article status for UI
 */
export const mapAirtableArticleStatus = (airtableStatus: string): ArticleStatus => {
  const statusLower = airtableStatus.toLowerCase();

  // Direct matches for new statuses
  if (statusLower === 'awaiting writer assignment') {
    return ARTICLE_STATUSES.AWAITING_WRITER_ASSIGNMENT;
  }

  if (statusLower === 'writing in progress') {
    return ARTICLE_STATUSES.WRITING_IN_PROGRESS;
  }

  if (statusLower === 'under client review') {
    return ARTICLE_STATUSES.UNDER_CLIENT_REVIEW;
  }

  if (statusLower === 'under editor review') {
    return ARTICLE_STATUSES.UNDER_EDITOR_REVIEW;
  }

  if (statusLower === 'writer revision needed') {
    return ARTICLE_STATUSES.WRITER_REVISION_NEEDED;
  }

  if (statusLower === 'content approved') {
    return ARTICLE_STATUSES.CONTENT_APPROVED;
  }

  if (statusLower === 'visual assets needed') {
    return ARTICLE_STATUSES.VISUAL_ASSETS_NEEDED;
  }

  if (statusLower === 'visual assets complete') {
    return ARTICLE_STATUSES.VISUAL_ASSETS_COMPLETE;
  }

  if (statusLower === 'ready for cms upload') {
    return ARTICLE_STATUSES.READY_FOR_CMS_UPLOAD;
  }

  if (statusLower === 'internal linking needed') {
    return ARTICLE_STATUSES.INTERNAL_LINKING_NEEDED;
  }

  if (statusLower === 'ready for publication') {
    return ARTICLE_STATUSES.READY_FOR_PUBLICATION;
  }

  if (statusLower === 'published') {
    return ARTICLE_STATUSES.PUBLISHED;
  }

  if (statusLower === 'reverse internal linking needed') {
    return ARTICLE_STATUSES.REVERSE_INTERNAL_LINKING_NEEDED;
  }

  if (statusLower === 'complete') {
    return ARTICLE_STATUSES.COMPLETE;
  }

  if (statusLower === 'cancelled') {
    return ARTICLE_STATUSES.CANCELLED;
  }

  if (statusLower === 'on hold') {
    return ARTICLE_STATUSES.ON_HOLD;
  }

  if (statusLower === 'content published') {
    return ARTICLE_STATUSES.CONTENT_PUBLISHED;
  }

  // Legacy status mappings for backward compatibility
  if (statusLower.includes('production') || statusLower === 'in production') {
    return ARTICLE_STATUSES.WRITING_IN_PROGRESS; // Map to new equivalent
  }

  if (statusLower.includes('review draft') || statusLower === 'review draft') {
    return ARTICLE_STATUSES.UNDER_EDITOR_REVIEW; // Map to new equivalent
  }

  if (statusLower.includes('draft approved') || statusLower === 'draft approved') {
    return ARTICLE_STATUSES.CONTENT_APPROVED; // Map to new equivalent
  }

  if (statusLower.includes('to be published') || statusLower === 'to be published') {
    return ARTICLE_STATUSES.READY_FOR_PUBLICATION; // Map to new equivalent
  }

  if (statusLower.includes('live') || statusLower === 'live') {
    return ARTICLE_STATUSES.PUBLISHED; // Map to new equivalent
  }

  // Default to Awaiting Writer Assignment if no match
  return ARTICLE_STATUSES.AWAITING_WRITER_ASSIGNMENT;
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
