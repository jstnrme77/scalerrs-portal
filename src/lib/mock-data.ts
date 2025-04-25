// Mock data for static builds and fallbacks

// Mock users
export const mockUsers = [
  {
    id: 'rec123',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Role: 'Admin'
  },
  {
    id: 'rec456',
    Name: 'Client User',
    Email: 'client@example.com',
    Role: 'Client'
  }
];

// Mock tasks
export const mockTasks = [
  {
    id: 'task1',
    Title: 'Sample Task 1',
    Name: 'Sample Task 1',  // Add Name field to match interface
    Description: 'This is a sample task',
    Status: 'In Progress',
    AssignedTo: ['rec123'],
    Priority: 'High'
  },
  {
    id: 'task2',
    Title: 'Sample Task 2',
    Name: 'Sample Task 2',  // Add Name field to match interface
    Description: 'Another sample task',
    Status: 'Completed',
    AssignedTo: ['rec456'],
    Priority: 'Medium'
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
    DueDate: '2024-04-10',
    DocumentLink: 'https://docs.google.com/document/d/1',
    Month: 'April',
    Status: 'In Progress',
    ContentWriter: 'Alex Johnson',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief2',
    Title: 'SEO Best Practices',
    Client: 'Example Client',
    SEOStrategist: 'Jane Doe',
    DueDate: '2024-04-14',
    DocumentLink: 'https://docs.google.com/document/d/2',
    Month: 'April',
    Status: 'Needs Input',
    ContentWriter: 'Sarah Williams',
    ContentEditor: 'John Smith'
  },
  {
    id: 'brief3',
    Title: 'Content Marketing Guide',
    Client: 'Example Client',
    SEOStrategist: 'Alex Johnson',
    DueDate: '2024-04-07',
    DocumentLink: 'https://docs.google.com/document/d/3',
    Month: 'April',
    Status: 'Review Brief',
    ContentWriter: 'Michael Brown',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief4',
    Title: 'Local SEO Strategies',
    Client: 'Example Client',
    SEOStrategist: 'John Smith',
    DueDate: '2024-04-20',
    DocumentLink: 'https://docs.google.com/document/d/4',
    Month: 'April',
    Status: 'Brief Approved',
    ContentWriter: 'Emily Davis',
    ContentEditor: 'Alex Johnson'
  },
  {
    id: 'brief5',
    Title: 'E-Commerce Trends',
    Client: 'Example Client',
    SEOStrategist: 'Jane Doe',
    DueDate: '2024-04-25',
    DocumentLink: 'https://docs.google.com/document/d/5',
    Month: 'April',
    Status: 'In Progress',
    ContentWriter: 'Robert Wilson',
    ContentEditor: 'John Smith'
  },
  {
    id: 'brief6',
    Title: 'Mobile SEO Optimization',
    Client: 'Example Client',
    SEOStrategist: 'Alex Johnson',
    DueDate: '2024-04-30',
    DocumentLink: 'https://docs.google.com/document/d/6',
    Month: 'April',
    Status: 'Needs Input',
    ContentWriter: 'Sarah Williams',
    ContentEditor: 'Jane Doe'
  },
  {
    id: 'brief7',
    Title: 'Voice Search Optimization',
    Client: 'Example Client',
    SEOStrategist: 'John Smith',
    DueDate: '2024-05-05',
    DocumentLink: 'https://docs.google.com/document/d/7',
    Month: 'May',
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
