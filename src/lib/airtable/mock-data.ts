// Mock data for static builds and fallbacks
// Import 2025 mockup data
import mockData2025 from '../../mockups/content-workflow-2025';

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
  }
];

// Import the rest of the mock data from the original file
import {
  mockArticles,
  mockBacklinks,
  mockKPIMetrics,
  mockURLPerformance,
  mockKeywordPerformance,
  mockMonths
} from '../mock-data';
