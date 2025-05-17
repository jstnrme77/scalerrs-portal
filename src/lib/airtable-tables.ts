// Table names
export const TABLES = {
  USERS: 'Users',
  TASKS: 'Tasks',
  COMMENTS: 'Comments',
  // BRIEFS and ARTICLES now come from the Keywords table
  KEYWORDS: 'Keywords',
  BRIEFS: 'Keywords', // Now using Keywords table for briefs
  ARTICLES: 'Keywords', // Now using Keywords table for articles
  BACKLINKS: 'Backlinks',
  KPI_METRICS: 'KPI Metrics',
  KEYWORD_PERFORMANCE: 'Keyword Performance',
  MONTHLY_PROJECTIONS: 'Monthly Projections',
  CLUSTERS: 'Clusters', // For SEO Layouts
  INTEGRATIONS: 'Integrations',
  NOTIFICATIONS: 'Notifications',
  REPORTS: 'Reports',
  ACTIVITY_LOG: 'Activity Log',
  CLIENTS: 'Clients'
};

// Alternative table names (in case the casing is different)
export const ALT_TABLES = {
  KEYWORDS: ['keywords', 'keyword', 'Keyword', 'KEYWORDS'],
  BRIEFS: ['keywords', 'keyword', 'Keyword', 'KEYWORDS'], // Same as KEYWORDS
  ARTICLES: ['keywords', 'keyword', 'Keyword', 'KEYWORDS'], // Same as KEYWORDS
  BACKLINKS: ['backlinks', 'backlink', 'Backlink', 'BACKLINKS'],
  KPI_METRICS: ['kpi_metrics', 'kpimetrics', 'kpi metrics', 'KPIMetrics'],
  KEYWORD_PERFORMANCE: ['keyword_performance', 'keywordperformance', 'keyword performance', 'KeywordPerformance'],
  MONTHLY_PROJECTIONS: ['monthly_projections', 'monthlyprojections', 'monthly projections', 'MonthlyProjections'],
  CLUSTERS: ['clusters', 'cluster', 'Cluster', 'CLUSTERS'],
  CLIENTS: ['clients', 'client', 'Client', 'CLIENTS'],
  USERS: ['users', 'user', 'User', 'USERS']
};
