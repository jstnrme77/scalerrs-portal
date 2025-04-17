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
