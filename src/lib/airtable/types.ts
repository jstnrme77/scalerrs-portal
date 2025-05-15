// Common types for Airtable records
export interface AirtableRecord {
  id: string;
  [key: string]: any;
}

// User types
export interface User extends AirtableRecord {
  Name: string;
  Email: string;
  Role: string;
  Client?: string[];
  CreatedAt?: string;
}

export interface CreateUserParams {
  Name: string;
  Email: string;
  Role: string;
  Client?: string[];
}

// Client types
export interface Client extends AirtableRecord {
  Name: string;
  [key: string]: any;
}

// Task types
export interface Task extends AirtableRecord {
  Name?: string;
  Title?: string;
  Description?: string;
  Status?: string;
  DueDate?: string;
  AssignedTo?: string[] | string;
  Client?: string[] | string;
  [key: string]: any;
}

// Comment types
export interface Comment extends AirtableRecord {
  Title?: string;
  Comment?: string;
  Task?: string[];
  User?: string[];
  CreatedAt?: string;
  [key: string]: any;
}

// Brief types
export interface Brief extends AirtableRecord {
  Title?: string;
  SEOStrategist?: string;
  DueDate?: string;
  DocumentLink?: string;
  Month?: string;
  Status?: string;
  Client?: string[] | string;
  ContentWriter?: string;
  ContentEditor?: string;
  [key: string]: any;
}

// Article types
export interface Article extends AirtableRecord {
  Title?: string;
  Writer?: string;
  Editor?: string;
  WordCount?: number;
  DueDate?: string;
  DocumentLink?: string;
  ArticleURL?: string;
  Month?: string;
  Status?: string;
  Client?: string[] | string;
  [key: string]: any;
}

// Backlink types
export interface Backlink extends AirtableRecord {
  Domain?: string;
  'Domain URL'?: string;
  DomainRating?: number;
  'DR ( API )'?: number;
  'Domain Authority/Rating'?: number;
  LinkType?: string;
  'Link Type'?: string;
  TargetPage?: string;
  'Client Target Page URL'?: string;
  'Target URL'?: string;
  Status?: string;
  WentLiveOn?: string;
  'Went Live On'?: string;
  Notes?: string;
  Month?: string;
  [key: string]: any;
}

// KPI Metrics types
export interface KPIMetric extends AirtableRecord {
  Month?: string;
  Year?: string;
  Client?: string[] | string;
  Organic?: number;
  'Organic Traffic'?: number;
  'Organic Revenue'?: number;
  'Conversion Rate'?: number;
  [key: string]: any;
}

// Monthly Projection types
export interface MonthlyProjection extends AirtableRecord {
  Month?: string;
  Year?: string;
  'Current Trajectory'?: number;
  'KPI Goal/Target'?: number;
  'Required Trajectory'?: number;
  Client?: string[] | string;
  [key: string]: any;
}

// Approval types
export interface ApprovalItem extends AirtableRecord {
  item?: string;
  status?: string;
  dateSubmitted?: string;
  lastUpdated?: string;
  volume?: number;
  difficulty?: string;
  strategist?: string;
  wordCount?: number;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextOffset: string | null;
    prevOffset: string | null;
  };
}

export type ApprovalType = 'keywords' | 'briefs' | 'articles';

export interface GetApprovalItemsParams {
  type: ApprovalType;
  status?: string;
  currentPage?: number;
  itemsPerPage?: number;
  offset?: string;
  userId?: string | null;
  userRole?: string | null;
  clientIds?: string[] | null;
}
