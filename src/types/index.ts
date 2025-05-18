// Define types for our data
export type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
export type ContentTab = 'briefs' | 'articles';
export type MainTab = 'content' | 'backlinks';

// Brief statuses
export type BriefStatus =
  // Main workflow statuses from Keyword/Content Status field
  'Brief Creation Needed' |
  'Brief Under Internal Review' |
  'Brief Awaiting Client Depth' |
  'Brief Awaiting Client Review' |
  'Brief Needs Revision' |
  'Brief Approved' |

  // Legacy status values for backward compatibility
  'In Progress' |
  'Needs Input' |
  'Review Brief' |
  'Needs Review' |
  'New' |
  'Refresh';

// Article statuses
export type ArticleStatus =
  // Main workflow statuses from Keyword/Content Status field
  'Awaiting Writer Assignment' |
  'Writing In Progress' |
  'Under Client Review' |
  'Under Editor Review' |
  'Writer Revision Needed' |
  'Content Approved' |
  'Visual Assets Needed' |
  'Visual Assets Complete' |
  'Ready for CMS Upload' |
  'Internal Linking Needed' |
  'Ready for Publication' |
  'Published' |
  'Reverse Internal Linking Needed' |
  'Complete' |
  'Cancelled' |
  'On Hold' |
  'Content Published' |

  // Legacy statuses for backward compatibility
  'In Production' |
  'Review Draft' |
  'Draft Approved' |
  'To Be Published' |
  'Live' |
  'Not Started' |
  'Client Review' |
  'Needs Revision' |
  'Resubmitted';

// Backlink statuses
export type BacklinkStatus = 'Live' | 'Scheduled' | 'Rejected';

// Client type
export interface Client {
  id: string;
  Name: string;
  Industry?: string;
  Website?: string;
  Status?: 'Active' | 'Inactive';
  ContactName?: string;
  ContactEmail?: string;
  ContactPhone?: string;
  StartDate?: string;
  EndDate?: string;
  [key: string]: any; // Allow for additional fields from Airtable
}

// User type
export interface User {
  id: string;
  Name: string;
  Email: string;
  Role: string;
  Password?: string; // For authentication (not stored in plain text in production)
  CreatedAt?: string;
  'Last Login'?: string;
  Client?: string | string[]; // Can be a single client ID or array of client IDs
  Notifications?: string[];
  Comments?: string[];
  Tasks?: string[];
  Briefs?: string[];
  Articles?: string[];
  Status?: 'Active' | 'Inactive';
  ProfileImage?: string;
  Phone?: string;
  Company?: string;
  Position?: string;
  'Login Count'?: number;
  LastActive?: string;
  [key: string]: any; // Allow for additional fields from Airtable
}

// Task type
export interface Task {
  id: string;
  Title: string;
  Name?: string;
  Description?: string;
  Status: string;
  Priority?: string;
  Category?: string;
  AssignedTo?: string[];
  Client?: string | string[];
  DueDate?: string;
  'Due Date'?: string;
  CreatedAt?: string;
  'Created Time'?: string;
  CompletedAt?: string;
  'Completed At'?: string;
  Attachments?: string[];
  Comments?: string[];
  Notes?: string;
  Tags?: string[];
  'Related To'?: string[];
  [key: string]: any; // Allow for additional fields from Airtable
}

// Comment type
export interface Comment {
  id: string;
  Title?: string;
  Comment: string;
  Task?: string[];
  User?: string[];
  CreatedAt?: string;
  'Created Time'?: string;
  [key: string]: any;
}

// Brief type
export interface Brief {
  id: string;
  Title: string;
  Client?: string | string[];
  SEOStrategist?: string;
  DueDate?: string;
  DocumentLink?: string;
  FraseDocumentLink?: string;
  TargetKeywords?: string;
  WordCountTarget?: number;
  Month?: Month;
  Status: BriefStatus;
  ContentWriter?: string;
  ContentEditor?: string;
  Articles?: string[];
  [key: string]: any; // Allow for additional fields from Airtable
}

// Article type
export interface Article {
  id: string;
  Title: string;
  Writer?: string | string[];
  Editor?: string | string[];
  'Content Writer'?: string | string[];
  'Content Editor'?: string | string[];
  Client?: string | string[];
  WordCount?: number;
  'Word Count'?: number;
  DueDate?: string;
  'Due Date'?: string;
  DocumentLink?: string;
  'Document Link'?: string;
  ArticleURL?: string;
  'Article URL'?: string;
  Month?: Month;
  Status: ArticleStatus;
  'Publication Status'?: string;
  Brief?: string[];
  'SEO Specialist'?: string;
  'Content Optimization Score'?: number;
  [key: string]: any; // Allow for additional fields from Airtable
}

// Backlink type
export interface Backlink {
  id: string;
  Domain?: string;
  'Source Domain'?: string;
  DomainRating?: number;
  'Domain Authority/Rating'?: number;
  LinkType?: 'Guest Post' | 'Directory' | 'Niche Edit';
  'Link Type'?: 'Guest Post' | 'Directory' | 'Niche Edit';
  TargetPage?: string;
  'Target URL'?: string[];
  Status: BacklinkStatus;
  WentLiveOn?: string;
  'Went Live On'?: string;
  Month?: Month;
  Notes?: string;
  [key: string]: any; // Allow for additional fields from Airtable
}

// KPI Metric type
export interface KPIMetric {
  id: string;
  MetricName: string;
  'Metric Name'?: string;
  CurrentValue: number;
  'Current Value'?: number;
  PreviousValue?: number;
  'Previous Value'?: number;
  ChangePercentage?: number;
  'Delta/Change'?: number;
  Goal?: number;
  TargetValue?: number;
  'Target Value'?: number;
  Trend?: 'up' | 'down';
  Unit?: string;
  Client?: string[];
  Date?: string;
  'KPI Timestamp'?: string;
  [key: string]: any; // Allow for additional fields from Airtable
}

// URL Performance type
export interface URLPerformance {
  id: string;
  URLPath: string;
  PageTitle?: string;
  Clicks?: number;
  Impressions?: number;
  CTR?: number;
  AveragePosition?: number;
  Client?: string[];
  Date?: string;
}

// Keyword Performance type
export interface KeywordPerformance {
  id: string;
  Keyword: string;
  Volume?: number;
  Difficulty?: number;
  CurrentPosition?: number;
  PreviousPosition?: number;
  PositionChange?: number;
  URL?: string;
  Client?: string[];
  Date?: string;
}

// Monthly Projections type
export interface MonthlyProjection {
  id: string;
  Month: string;
  Year: string;
  'Current Trajectory': number;
  'KPI Goal/Target': number;
  'Required Trajectory': number;
  Client?: string[];
  [key: string]: any; // Allow for additional fields from Airtable
}
