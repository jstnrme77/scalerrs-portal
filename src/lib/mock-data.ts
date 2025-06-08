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

// Mock users for testing
export const mockUsers = [
  {
    id: 'user1',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Role: 'Admin',
    Clients: ['client1', 'client2', 'client3'] // Admin can access all clients
  },
  {
    id: 'user2',
    Name: 'Client User 1',
    Email: 'client1@example.com',
    Role: 'Client',
    Clients: ['client1'] // This client user can only access client1
  },
  {
    id: 'user3',
    Name: 'Client User 2',
    Email: 'client2@example.com',
    Role: 'Client',
    Clients: ['client2'] // This client user can only access client2
  }
];

// Mock tasks
export const mockTasks = [
  {
    id: 'task1',
    Title: 'Write blog post about SEO',
    Description: 'Create a blog post about the latest SEO trends',
    Status: 'In Progress',
    AssignedTo: ['user1'],
    Priority: 'High',
    Category: 'Content',
    Clients: ['client1'] // Assign to client1
  },
  {
    id: 'task2',
    Title: 'Optimize homepage meta tags',
    Description: 'Update meta tags on the homepage for better SEO',
    Status: 'Not Started',
    AssignedTo: ['user2'],
    Priority: 'Medium',
    Category: 'SEO',
    Clients: ['client1'] // Assign to client1
  },
  {
    id: 'task3',
    Title: 'Create social media campaign',
    Description: 'Design a social media campaign for product launch',
    Status: 'Completed',
    AssignedTo: ['user3'],
    Priority: 'High',
    Category: 'Marketing',
    Clients: ['client2'] // Assign to client2
  },
  {
    id: 'task4',
    Title: 'Analyze website traffic',
    Description: 'Review Google Analytics and provide insights',
    Status: 'In Progress',
    AssignedTo: ['user1'],
    Priority: 'Medium',
    Category: 'Analytics',
    Clients: ['client2'] // Assign to client2
  },
  {
    id: 'task5',
    Title: 'Fix broken links',
    Description: 'Identify and fix broken links on the website',
    Status: 'Not Started',
    AssignedTo: ['user2'],
    Priority: 'Low',
    Category: 'Maintenance',
    Clients: ['client3'] // Assign to client3
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
export const mockBriefs: any[] = [];

// Mock articles
export const mockArticles: any[] = [];

// Mock backlinks
export const mockBacklinks: any[] = [];

// Mock YouTube data
export const mockYouTube = [
  {
    id: 'youtube1',
    'Keyword Topic': 'How to improve SEO rankings',
    'Video Title': 'Top 10 SEO Tips for 2025',
    'Competitor video URL': 'https://youtube.com/competitor-video-1',
    'YouTube Status': 'Idea Proposed',
    'Target Month': 'June 2025',
    'Video Type': 'Educational',
    'Script (G-Doc URL)': 'https://docs.google.com/document/d/script1',
    'Notes': 'Focus on practical tips for beginners',
    'Clients': ['client1'],
    'YouTube Strategist': 'Sarah Wilson',
    'YouTube Host': 'Mike Johnson'
  },
  {
    id: 'youtube2',
    'Keyword Topic': 'Content marketing strategies',
    'Video Title': 'Content Marketing Guide for Small Business',
    'Competitor video URL': 'https://youtube.com/competitor-video-2',
    'YouTube Status': 'Script Creation Needed',
    'Target Month': 'July 2025',
    'Video Type': 'Tutorial',
    'Script (G-Doc URL)': '',
    'Notes': 'Include case studies and examples',
    'Clients': ['client2'],
    'YouTube Strategist': 'Alex Chen',
    'YouTube Host': 'Emma Davis'
  },
  {
    id: 'youtube3',
    'Keyword Topic': 'Local SEO optimization',
    'Video Title': 'Local SEO: Complete Guide for 2025',
    'Competitor video URL': 'https://youtube.com/competitor-video-3',
    'YouTube Status': 'Video In Editing',
    'Target Month': 'August 2025',
    'Video Type': 'Comprehensive Guide',
    'Script (G-Doc URL)': 'https://docs.google.com/document/d/script3',
    'Notes': 'Include Google Business Profile optimization',
    'Clients': ['client1'],
    'YouTube Strategist': 'Sarah Wilson',
    'YouTube Host': 'Mike Johnson'
  }
];

// Mock Reddit data
export const mockReddit = [
  {
    id: 'reddit1',
    'Keyword': 'SEO tools',
    'Reddit Thread URL': 'https://reddit.com/r/seo/post1',
    'Reddit Thread Status (General)': 'Thread Proposed',
    'Thread SEO Traffic': 1250,
    'Thread SEO Traffic Value': 320,
    'Month': 'June 2025',
    'Thread Type': 'Discussion',
    'Notes': 'Engage with community about favorite SEO tools',
    'Clients': ['client1'],
    'Reddit Assignee': 'Tom Parker',
    'SEO Assignee': 'Sarah Wilson'
  },
  {
    id: 'reddit2',
    'Keyword': 'content marketing',
    'Reddit Thread URL': 'https://reddit.com/r/marketing/post2',
    'Reddit Thread Status (General)': 'Thread In Progress',
    'Thread SEO Traffic': 890,
    'Thread SEO Traffic Value': 245,
    'Month': 'July 2025',
    'Thread Type': 'Question',
    'Notes': 'Ask for advice on content distribution strategies',
    'Clients': ['client2'],
    'Reddit Assignee': 'Lisa Chen',
    'SEO Assignee': 'Alex Chen'
  },
  {
    id: 'reddit3',
    'Keyword': 'local business marketing',
    'Reddit Thread URL': 'https://reddit.com/r/smallbusiness/post3',
    'Reddit Thread Status (General)': 'Thread Published',
    'Thread SEO Traffic': 2100,
    'Thread SEO Traffic Value': 580,
    'Month': 'August 2025',
    'Thread Type': 'Case Study',
    'Notes': 'Share success story of local business growth',
    'Clients': ['client1'],
    'Reddit Assignee': 'Tom Parker',
    'SEO Assignee': 'Sarah Wilson'
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
export const mockKeywordPerformance: any[] = [];

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
