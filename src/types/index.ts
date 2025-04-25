// Define types for our data
export type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
export type ContentTab = 'briefs' | 'articles';
export type MainTab = 'content' | 'backlinks';

// Brief statuses
export type BriefStatus = 'In Progress' | 'Needs Input' | 'Review Brief' | 'Brief Approved' | 'Needs Review' | 'Approved' | 'Review Brief';

// Article statuses
export type ArticleStatus = 'In Production' | 'Review Draft' | 'Draft Approved' | 'To Be Published' | 'Live';

// Backlink statuses
export type BacklinkStatus = 'Live' | 'Scheduled' | 'Rejected';

// User type
export interface User {
  id: string;
  Name: string;
  Email: string;
  Role: string;
  CreatedAt?: string;
  'Last Login'?: string;
  Client?: string[];
  Notifications?: string[];
  Comments?: string[];
  Tasks?: string[];
  Briefs?: string[];
}

// Task type
export interface Task {
  id: string;
  Title: string;
  Name?: string;
  Description?: string;
  Status: string;
  Priority?: string;
  AssignedTo?: string[];
  CreatedAt?: string;
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
  Month?: Month;
  Status: BriefStatus;
  ContentWriter?: string;
  ContentEditor?: string;
  Articles?: string[];
}

// Article type
export interface Article {
  id: string;
  Title: string;
  Writer?: string | string[];
  Editor?: string | string[];
  Client?: string | string[];
  WordCount?: number;
  DueDate?: string;
  DocumentLink?: string;
  ArticleURL?: string;
  Month?: Month;
  Status: ArticleStatus;
  Brief?: string[];
}

// Backlink type
export interface Backlink {
  id: string;
  Domain: string;
  DomainRating?: number;
  LinkType?: 'Guest Post' | 'Directory' | 'Niche Edit';
  TargetPage?: string;
  Status: BacklinkStatus;
  WentLiveOn?: string;
  Month?: Month;
  Notes?: string;
}

// KPI Metric type
export interface KPIMetric {
  id: string;
  MetricName: string;
  CurrentValue: number;
  PreviousValue?: number;
  ChangePercentage?: number;
  Goal?: number;
  Client?: string[];
  Date?: string;
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
