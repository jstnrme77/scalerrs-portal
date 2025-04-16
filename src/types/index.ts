// Define types for our data
export type Month = 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December';
export type ContentTab = 'briefs' | 'articles';
export type MainTab = 'content' | 'backlinks';

// Brief statuses
export type BriefStatus = 'In Progress' | 'Needs Input' | 'Review Brief' | 'Brief Approved';

// Article statuses
export type ArticleStatus = 'In Production' | 'Review Draft' | 'Draft Approved' | 'To Be Published' | 'Live';

// Backlink statuses
export type BacklinkStatus = 'Live' | 'Scheduled' | 'Rejected';

// Brief type
export type Brief = {
  id: number;
  title: string;
  seoStrategist: string;
  dueDate: string;
  docLink: string;
  month: Month;
  status: BriefStatus;
};

// Article type
export type Article = {
  id: number;
  title: string;
  writer: string;
  wordCount: number;
  dueDate: string;
  docLink: string;
  articleUrl?: string;
  month: Month;
  status: ArticleStatus;
};

// Backlink type
export type Backlink = {
  id: number;
  domain: string;
  dr: number;
  linkType: 'Guest Post' | 'Directory' | 'Niche Edit';
  targetPage: string;
  status: BacklinkStatus;
  wentLiveOn?: string;
  month: Month;
  notes?: string;
};
