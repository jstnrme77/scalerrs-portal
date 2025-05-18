// Shared constants for Netlify functions

// Table names for the Airtable base
const TABLES = {
  // User Management
  USERS: 'Users',
  CLIENTS: 'Clients',

  // Content Management
  BRIEFS: 'Briefs',
  ARTICLES: 'Articles',
  BACKLINKS: 'Backlinks',
  CLUSTERS: 'Clusters',

  // Task Management
  TASKS: 'Tasks',
  COMMENTS: 'Comments',

  // Performance Data
  KEYWORDS: 'Keywords',
  URL_PERFORMANCE: 'URL Performance',
  KPI_METRICS: 'KPI Metrics',
  MONTHLY_PROJECTIONS: 'Monthly Projections',

  // System Tables
  INTEGRATIONS: 'Integrations',
  NOTIFICATIONS: 'Notifications',
  REPORTS: 'Reports',
  ACTIVITY_LOG: 'Activity Log'
};

// Alternative table names (in case the casing is different)
const ALT_TABLES = {
  KPI_METRICS: ['kpi_metrics', 'kpimetrics', 'kpi metrics', 'KPIMetrics'],
  URL_PERFORMANCE: ['url_performance', 'urlperformance', 'url performance', 'URLPerformance'],
  KEYWORDS: ['keyword_performance', 'keywordperformance', 'keyword performance', 'KeywordPerformance', 'keywords'],
  MONTHLY_PROJECTIONS: ['monthly_projections', 'monthlyprojections', 'monthly projections', 'MonthlyProjections']
};

// Field mappings for consistent access
const FIELD_MAPPINGS = {
  // Common fields
  ID: 'id',
  TITLE: ['Title', 'Main Keyword', 'Meta Title'],
  STATUS: ['Status', 'Keyword/Content Status'],
  MONTH: ['Month', 'Month (Keyword Targets)'],
  CLIENT: 'Client',
  
  // Brief specific fields
  BRIEF_STRATEGIST: ['SEO Strategist', 'SEO Specialist'],
  BRIEF_DUE_DATE: ['Due Date', 'Due Date (Publication)'],
  BRIEF_DOCUMENT_LINK: ['Content Brief Link (G Doc)', 'Document Link'],
  BRIEF_APPROVAL: 'Brief Approval',
  
  // Article specific fields
  ARTICLE_WRITER: ['Content Writer', 'Writer'],
  ARTICLE_EDITOR: ['Content Editor', 'Editor'],
  ARTICLE_WORD_COUNT: ['Word Count', 'WordCount', 'Final Word Count'],
  ARTICLE_DOCUMENT_LINK: ['Content Link (G Doc)', 'Document Link', 'Written Content (G Doc)'],
  ARTICLE_URL: ['Article URL', 'Target Page URL'],
  ARTICLE_APPROVAL: 'Article Approval',
  
  // Content type field
  CONTENT_TYPE: 'Content Type'
};

// Status mappings
const STATUS_MAPPINGS = {
  NOT_STARTED: ['not started', 'not_started', 'not-started'],
  IN_PROGRESS: ['in progress', 'in_progress', 'in-progress', 'writing', 'editing'],
  READY_FOR_REVIEW: ['ready for review', 'ready_for_review', 'ready-for-review', 'review'],
  AWAITING_APPROVAL: ['awaiting approval', 'awaiting_approval', 'awaiting-approval', 'pending'],
  REVISIONS_NEEDED: ['revisions needed', 'revisions_needed', 'revisions-needed', 'needs revision', 'needs_revision'],
  APPROVED: ['approved', 'approve'],
  PUBLISHED: ['published', 'publish', 'live']
};

module.exports = {
  TABLES,
  ALT_TABLES,
  FIELD_MAPPINGS,
  STATUS_MAPPINGS
};
