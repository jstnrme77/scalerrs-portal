// Mock data for static builds and fallbacks
// Import 2025 mockup data
import mockData2025 from '../mockups/content-workflow-2025';

// Mock clients
export const mockClients = [
  {
    id: 'client1',
    Name: 'Example Client 1',
    Industry: 'Technology',
    Website: 'https://example1.com',
    Status: 'Active'
  },
  {
    id: 'client2',
    Name: 'Example Client 2',
    Industry: 'Healthcare',
    Website: 'https://example2.com',
    Status: 'Active'
  },
  {
    id: 'client3',
    Name: 'Example Client 3',
    Industry: 'E-commerce',
    Website: 'https://example3.com',
    Status: 'Active'
  }
];

// Mock users
export const mockUsers = [
  {
    id: 'rec123',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Role: 'Admin',
    Client: ['client1', 'client2', 'client3'] // Admin can access all clients
  },
  {
    id: 'rec456',
    Name: 'Client User',
    Email: 'client@example.com',
    Role: 'Client',
    Client: ['client1'] // This client user can only access client1
  },
  {
    id: 'rec789',
    Name: 'Client User 2',
    Email: 'client2@example.com',
    Role: 'Client',
    Client: ['client2'] // This client user can only access client2
  }
];

// Mock tasks
export const mockTasks = [
  {
    id: 'task1',
    Title: 'Sample Task 1',
    Name: 'Sample Task 1',
    Description: 'This is a sample task',
    Status: 'In Progress',
    AssignedTo: ['rec123'],
    Priority: 'High',
    Category: 'Technical SEO',
    Client: ['client1'] // Assign to client1
  },
  {
    id: 'task2',
    Title: 'Sample Task 2',
    Name: 'Sample Task 2',
    Description: 'Another sample task',
    Status: 'Completed',
    AssignedTo: ['rec456'],
    Priority: 'Medium',
    Category: 'CRO',
    Client: ['client1'] // Assign to client1
  },
  {
    id: 'task3',
    Title: 'Strategy Planning Session',
    Name: 'Strategy Planning Session',
    Description: 'Plan content strategy for Q3',
    Status: 'To Do',
    AssignedTo: ['rec123'],
    Priority: 'High',
    Category: 'Strategy / Ad Hoc',
    Client: ['client2'] // Assign to client2
  },
  {
    id: 'task4',
    Title: 'Client 2 Task',
    Name: 'Client 2 Task',
    Description: 'This task is for client 2 only',
    Status: 'In Progress',
    AssignedTo: ['rec789'],
    Priority: 'High',
    Category: 'Content',
    Client: ['client2'] // Assign to client2
  },
  {
    id: 'task5',
    Title: 'Client 3 Task',
    Name: 'Client 3 Task',
    Description: 'This task is for client 3 only',
    Status: 'To Do',
    AssignedTo: ['rec123'],
    Priority: 'Medium',
    Category: 'Technical SEO',
    Client: ['client3'] // Assign to client3
  }
];

// Mock comments
export const mockComments = [
  {
    id: 'comment1',
    Title: 'Comment on task task1',
    Task: ['task1'],
    User: ['rec123'],
    Comment: 'This is a sample comment',
    CreatedAt: '2023-01-01'
  }
];

// Mock briefs
export const mockBriefs = [
  {
    id: 'brief1',
    Title: 'The Future of Remote Work',
    Client: 'Example Client',
    SEOStrategist: 'John Smith',
    DueDate: '2025-05-10',
    DocumentLink: 'https://docs.google.com/document/d/1',
    Month: 'May 2025',
    Status: 'In Progress',
    ContentWriter: 'Alex Johnson',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief2',
    Title: 'SEO Best Practices',
    Client: 'Example Client',
    SEOStrategist: 'Jane Doe',
    DueDate: '2025-05-14',
    DocumentLink: 'https://docs.google.com/document/d/2',
    Month: 'May 2025',
    Status: 'Needs Input',
    ContentWriter: 'Sarah Williams',
    ContentEditor: 'John Smith'
  },
  {
    id: 'brief3',
    Title: 'Content Marketing Guide',
    Client: 'Example Client',
    SEOStrategist: 'Alex Johnson',
    DueDate: '2025-05-07',
    DocumentLink: 'https://docs.google.com/document/d/3',
    Month: 'May 2025',
    Status: 'Review Brief',
    ContentWriter: 'Michael Brown',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief4',
    Title: 'Local SEO Strategies',
    Client: 'Example Client',
    SEOStrategist: 'John Smith',
    DueDate: '2025-05-20',
    DocumentLink: 'https://docs.google.com/document/d/4',
    Month: 'May 2025',
    Status: 'Brief Approved',
    ContentWriter: 'Emily Davis',
    ContentEditor: 'Alex Johnson'
  },
  {
    id: 'brief5',
    Title: 'E-Commerce Trends',
    Client: 'Example Client',
    SEOStrategist: 'Jane Doe',
    DueDate: '2025-05-25',
    DocumentLink: 'https://docs.google.com/document/d/5',
    Month: 'May 2025',
    Status: 'In Progress',
    ContentWriter: 'Robert Wilson',
    ContentEditor: 'John Smith'
  },
  {
    id: 'brief6',
    Title: 'Mobile SEO Optimization',
    Client: 'Example Client',
    SEOStrategist: 'Alex Johnson',
    DueDate: '2025-05-30',
    DocumentLink: 'https://docs.google.com/document/d/6',
    Month: 'May 2025',
    Status: 'Needs Input',
    ContentWriter: 'Sarah Williams',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief7',
    Title: 'Voice Search Optimization',
    Client: 'Example Client',
    SEOStrategist: 'John Smith',
    DueDate: '2025-05-05',
    DocumentLink: 'https://docs.google.com/document/d/7',
    Month: 'May 2025',
    Status: 'In Progress',
    ContentWriter: 'Michael Brown',
    ContentEditor: 'Alex Johnson'
  }
];

// Mock articles
export const mockArticles = [
  {
    id: 'article1',
    Title: 'The Future of Remote Work',
    Writer: 'Alex Johnson',
    Editor: 'Jane Doe',
    Client: 'Example Client',
    WordCount: 1500,
    DueDate: '2024-04-15',
    DocumentLink: 'https://docs.google.com/document/d/1',
    ArticleURL: 'https://example.com/future-remote-work',
    Month: 'April',
    Status: 'In Production',
    Brief: ['brief1']
  },
  {
    id: 'article2',
    Title: 'SEO Best Practices',
    Writer: 'Sarah Williams',
    Editor: 'John Smith',
    Client: 'Example Client',
    WordCount: 2000,
    DueDate: '2024-04-20',
    DocumentLink: 'https://docs.google.com/document/d/2',
    Month: 'April',
    Status: 'Review Draft',
    Brief: ['brief2']
  },
  {
    id: 'article3',
    Title: 'Content Marketing Guide',
    Writer: 'Michael Brown',
    Editor: 'Jane Doe',
    Client: 'Example Client',
    WordCount: 2500,
    DueDate: '2024-04-25',
    DocumentLink: 'https://docs.google.com/document/d/3',
    Month: 'April',
    Status: 'Draft Approved',
    Brief: ['brief3']
  },
  {
    id: 'article4',
    Title: 'Local SEO Strategies',
    Writer: 'Emily Davis',
    Editor: 'Alex Johnson',
    Client: 'Example Client',
    WordCount: 1800,
    DueDate: '2024-04-10',
    DocumentLink: 'https://docs.google.com/document/d/4',
    ArticleURL: 'https://example.com/local-seo-strategies',
    Month: 'April',
    Status: 'Live',
    Brief: ['brief4']
  },
  {
    id: 'article5',
    Title: 'E-Commerce Trends',
    Writer: 'Robert Wilson',
    Editor: 'John Smith',
    Client: 'Example Client',
    WordCount: 1600,
    DueDate: '2024-04-30',
    DocumentLink: 'https://docs.google.com/document/d/5',
    Month: 'April',
    Status: 'To Be Published',
    Brief: ['brief5']
  },
  {
    id: 'article6',
    Title: 'Mobile SEO Optimization',
    Writer: 'Sarah Williams',
    Editor: 'Jane Doe',
    Client: 'Example Client',
    WordCount: 1700,
    DueDate: '2024-05-05',
    DocumentLink: 'https://docs.google.com/document/d/6',
    Month: 'May',
    Status: 'In Production',
    Brief: ['brief6']
  },
  {
    id: 'article7',
    Title: 'Voice Search Optimization',
    Writer: 'Michael Brown',
    Editor: 'Alex Johnson',
    Client: 'Example Client',
    WordCount: 2200,
    DueDate: '2024-05-10',
    DocumentLink: 'https://docs.google.com/document/d/7',
    Month: 'May',
    Status: 'Review Draft',
    Brief: ['brief7']
  }
];

// Mock backlinks
export const mockBacklinks = [
  {
    id: 'backlink1',
    Domain: 'example.com',
    DomainRating: 45,
    LinkType: 'Guest Post',
    TargetPage: 'https://client.com/page1',
    Status: 'Live',
    WentLiveOn: '2023-01-15',
    Month: 'January',
    Notes: 'Sample backlink notes'
  },
  {
    id: 'backlink11',
    Domain: 'january-seo.com',
    DomainRating: 62,
    LinkType: 'Editorial',
    TargetPage: 'https://client.com/page11',
    Status: 'Live',
    WentLiveOn: '2023-01-10',
    Month: 'January',
    Notes: 'January editorial feature'
  },
  {
    id: 'backlink12',
    Domain: 'winter-marketing.org',
    DomainRating: 55,
    LinkType: 'Resource Page',
    TargetPage: 'https://client.com/page12',
    Status: 'Scheduled',
    WentLiveOn: '',
    Month: 'January',
    Notes: 'Winter marketing resource'
  },
  {
    id: 'backlink2',
    Domain: 'blog.example.org',
    DomainRating: 52,
    LinkType: 'Resource Page',
    TargetPage: 'https://client.com/page2',
    Status: 'Live',
    WentLiveOn: '2023-02-10',
    Month: 'February',
    Notes: 'High-quality resource link'
  },
  {
    id: 'backlink3',
    Domain: 'industry-news.com',
    DomainRating: 67,
    LinkType: 'Editorial',
    TargetPage: 'https://client.com/page3',
    Status: 'Scheduled',
    WentLiveOn: '2023-03-05',
    Month: 'March',
    Notes: 'Pending editorial review'
  },
  {
    id: 'backlink4',
    Domain: 'tech-magazine.net',
    DomainRating: 73,
    LinkType: 'Interview',
    TargetPage: 'https://client.com/page4',
    Status: 'Live',
    WentLiveOn: '2023-04-20',
    Month: 'April',
    Notes: 'Expert interview feature'
  },
  {
    id: 'backlink5',
    Domain: 'seo-journal.com',
    DomainRating: 58,
    LinkType: 'Guest Post',
    TargetPage: 'https://client.com/page5',
    Status: 'Rejected',
    WentLiveOn: '',
    Month: 'April',
    Notes: 'Content not aligned with site guidelines'
  },
  {
    id: 'backlink6',
    Domain: 'marketing-insights.io',
    DomainRating: 61,
    LinkType: 'Resource Page',
    TargetPage: 'https://client.com/page6',
    Status: 'Scheduled',
    WentLiveOn: '',
    Month: 'May',
    Notes: 'Scheduled for next content update'
  },
  {
    id: 'backlink7',
    Domain: 'digital-trends.org',
    DomainRating: 55,
    LinkType: 'Editorial',
    TargetPage: 'https://client.com/page7',
    Status: 'Live',
    WentLiveOn: '2023-05-15',
    Month: 'May',
    Notes: 'Featured in industry roundup'
  },
  {
    id: 'backlink8',
    Domain: 'seo-weekly.com',
    DomainRating: 63,
    LinkType: 'Guest Post',
    TargetPage: 'https://client.com/page8',
    Status: 'Live',
    WentLiveOn: '2023-09-05',
    Month: 'September',
    Notes: 'Thought leadership article'
  },
  {
    id: 'backlink9',
    Domain: 'marketing-today.net',
    DomainRating: 58,
    LinkType: 'Resource Page',
    TargetPage: 'https://client.com/page9',
    Status: 'Scheduled',
    WentLiveOn: '',
    Month: 'September',
    Notes: 'Pending final approval'
  },
  {
    id: 'backlink10',
    Domain: 'tech-insights.org',
    DomainRating: 72,
    LinkType: 'Editorial',
    TargetPage: 'https://client.com/page10',
    Status: 'Live',
    WentLiveOn: '2023-09-18',
    Month: 'September',
    Notes: 'Industry expert mention'
  }
];

// Mock KPI metrics
export const mockKPIMetrics = [
  {
    id: 'kpi1',
    MetricName: 'Organic Clicks',
    CurrentValue: 12543,
    PreviousValue: 10775,
    ChangePercentage: 16.4,
    Goal: 15000,
    Client: ['rec456'],
    Date: '2023-01-31'
  },
  {
    id: 'kpi2',
    MetricName: 'Conversion Rate',
    CurrentValue: 3.2,
    PreviousValue: 2.67,
    ChangePercentage: 20,
    Goal: 4.0,
    Client: ['rec456'],
    Date: '2023-01-31',
    Unit: '%'
  },
  {
    id: 'kpi3',
    MetricName: 'Estimated Leads',
    CurrentValue: 401,
    PreviousValue: 301,
    ChangePercentage: 33.2,
    Goal: 600,
    Client: ['rec456'],
    Date: '2023-01-31'
  },
  {
    id: 'kpi4',
    MetricName: 'SQLs',
    CurrentValue: 87,
    PreviousValue: 68,
    ChangePercentage: 27.5,
    Goal: 120,
    Client: ['rec456'],
    Date: '2023-01-31'
  },
  {
    id: 'kpi5',
    MetricName: 'Revenue Impact',
    CurrentValue: 24800,
    PreviousValue: 21140,
    ChangePercentage: 17.3,
    Goal: 30000,
    Client: ['rec456'],
    Date: '2023-01-31',
    Unit: '$'
  },
  {
    id: 'kpi6',
    MetricName: 'Traffic Growth YoY',
    CurrentValue: 42,
    PreviousValue: 36,
    ChangePercentage: 16,
    Goal: 50,
    Client: ['rec456'],
    Date: '2023-01-31',
    Unit: '%'
  },
  {
    id: 'kpi7',
    MetricName: 'MoM Performance',
    CurrentValue: 8.5,
    PreviousValue: 7.4,
    ChangePercentage: 15,
    Goal: 10,
    Client: ['rec456'],
    Date: '2023-01-31',
    Unit: '%'
  }
];

// Mock months data
export const mockMonths = [
  'May 2024',
  'June 2024',
  'July 2024',
  'August 2024',
  'September 2024',
  'October 2024',
  'November 2024',
  'December 2024',
  'January 2025',
  'February 2025',
  'March 2025',
  'April 2025'
];

// Mock URL performance
export const mockURLPerformance = [
  {
    id: 'url1',
    URLPath: '/blog/sample-post',
    PageTitle: 'Sample Blog Post',
    Clicks: 1200,
    Impressions: 15000,
    CTR: 8.0,
    AveragePosition: 3.5,
    Client: ['rec456'],
    Date: '2023-01-31'
  }
];

// Mock keyword performance
export const mockKeywordPerformance = [
  {
    id: 'keyword1',
    Keyword: 'sample keyword',
    Volume: 1000,
    Difficulty: 35,
    CurrentPosition: 5,
    PreviousPosition: 8,
    PositionChange: 3,
    URL: '/blog/sample-post',
    Client: ['rec456'],
    Date: '2023-01-31'
  }
];

// Export 2025 mockup data
export const mockBriefs2025 = mockData2025.briefs;
export const mockArticles2025 = mockData2025.articles;
export const mockBacklinks2025 = mockData2025.backlinks;

// Mock Monthly Projections
// This data is used when Airtable connection is not available
export const mockMonthlyProjections = [
  {
    id: 'proj1',
    Month: 'May',
    Year: '2025',
    'Current Trajectory': 15000,
    'KPI Goal/Target': 18000,
    'Required Trajectory': 16500,
    Client: ['rec456']
  },
  {
    id: 'proj2',
    Month: 'June',
    Year: '2025',
    'Current Trajectory': 16500,
    'KPI Goal/Target': 19000,
    'Required Trajectory': 18000,
    Client: ['rec456']
  },
  {
    id: 'proj3',
    Month: 'July',
    Year: '2025',
    'Current Trajectory': 18000,
    'KPI Goal/Target': 20000,
    'Required Trajectory': 19500,
    Client: ['rec456']
  },
  {
    id: 'proj4',
    Month: 'August',
    Year: '2025',
    'Current Trajectory': 19500,
    'KPI Goal/Target': 21000,
    'Required Trajectory': 21000,
    Client: ['rec456']
  },
  {
    id: 'proj5',
    Month: 'September',
    Year: '2025',
    'Current Trajectory': 21000,
    'KPI Goal/Target': 22000,
    'Required Trajectory': 22500,
    Client: ['rec456']
  },
  {
    id: 'proj6',
    Month: 'October',
    Year: '2025',
    'Current Trajectory': 22500,
    'KPI Goal/Target': 23000,
    'Required Trajectory': 24000,
    Client: ['rec456']
  }
];
