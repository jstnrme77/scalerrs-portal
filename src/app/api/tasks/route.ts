import { NextRequest, NextResponse } from 'next/server';
import { getTasks, updateTaskStatus } from '@/lib/airtable';
import { mockTasks } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Define a more flexible Task interface to handle both new and legacy data structures
interface Task {
  id: string;
  Title?: string;
  Description?: string;
  Status: string;
  AssignedTo?: string | string[];
  Priority?: string;
  Category?: string;
  // New field name
  Clients?: string | string[];
  // Legacy field name for backward compatibility
  Client?: string | string[];
  [key: string]: any; // Allow for other fields
}

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching tasks from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClientsHeader = request.headers.get('x-user-clients');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Clients Header:', userClientsHeader);

    // Parse client IDs if present
    let clientIds: string[] = [];
    if (userClientsHeader) {
      try {
        clientIds = JSON.parse(userClientsHeader);
        console.log('Parsed Client IDs:', clientIds);
      } catch (e) {
        console.error('Error parsing client IDs:', e);
      }
    }

    // Fetch tasks with user filtering
    const tasks = await getTasks(userId, userRole, clientIds);

    if (!tasks || tasks.length === 0) {
      console.log('API route: No tasks found, using mock data');
      // Filter mock data based on user role and ID
      let filteredMockTasks = [...mockTasks] as Task[];

      if (userId && userRole) {
        // For client users, filter by client IDs
        if (userRole === 'Client' && clientIds.length > 0) {
          console.log('Filtering mock tasks for client user with client IDs:', clientIds);
          // Filter mock tasks by client
          filteredMockTasks = mockTasks.filter((task: Task) => {
            // Check if task has client field that matches any of the user's clients
            if (task.Clients) {
              if (Array.isArray(task.Clients)) {
                return task.Clients.some((client: string) => clientIds.includes(client));
              } else {
                return clientIds.includes(task.Clients);
              }
            }
            // Try legacy Client field for backwards compatibility
            if (task.Client) {
              if (Array.isArray(task.Client)) {
                return task.Client.some((client: string) => clientIds.includes(client));
              } else {
                return clientIds.includes(task.Client);
              }
            }
            return false;
          });
          console.log(`Filtered ${filteredMockTasks.length} tasks for client user out of ${mockTasks.length}`);
        }
        // For non-admin users who aren't clients, only show tasks assigned to them
        else if (userRole !== 'Admin') {
          filteredMockTasks = mockTasks.filter((task: Task) => {
            // Check if the task is assigned to this user
            if (task.AssignedTo) {
              if (Array.isArray(task.AssignedTo)) {
                return task.AssignedTo.includes(userId);
              } else {
                return task.AssignedTo === userId;
              }
            }
            return false;
          });
        }
      }

      return NextResponse.json({ tasks: filteredMockTasks });
    }

    console.log(`API route: Found ${tasks.length} tasks`);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    console.log('API route: Error fetching tasks, using mock data');
    
    // Even in error case, try to filter mock data for client users
    const userRole = request.headers.get('x-user-role');
    const userClientsHeader = request.headers.get('x-user-clients');
    const userId = request.headers.get('x-user-id');
    
    let clientIds: string[] = [];
    if (userClientsHeader) {
      try {
        clientIds = JSON.parse(userClientsHeader);
      } catch (e) {
        console.error('Error parsing client IDs in error handler:', e);
      }
    }
    
    // Filter mock data based on user role and ID
    let filteredMockTasks = [...mockTasks] as Task[];

    if (userId && userRole) {
      // For client users, filter by client IDs
      if (userRole === 'Client' && clientIds.length > 0) {
        console.log('Filtering mock tasks for client user with client IDs (error case):', clientIds);
        // Filter mock tasks by client
        filteredMockTasks = mockTasks.filter((task: Task) => {
          // Check if task has client field that matches any of the user's clients
          if (task.Clients) {
            if (Array.isArray(task.Clients)) {
              return task.Clients.some((client: string) => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Clients);
            }
          }
          // Try legacy Client field for backwards compatibility
          if (task.Client) {
            if (Array.isArray(task.Client)) {
              return task.Client.some((client: string) => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Client);
            }
          }
          return false;
        });
      }
      // For non-admin users who aren't clients, only show tasks assigned to them
      else if (userRole !== 'Admin') {
        filteredMockTasks = mockTasks.filter((task: Task) => {
          // Check if the task is assigned to this user
          if (task.AssignedTo) {
            if (Array.isArray(task.AssignedTo)) {
              return task.AssignedTo.includes(userId);
            } else {
              return task.AssignedTo === userId;
            }
          }
          return false;
        });
      }
    }
    
    return NextResponse.json({ tasks: filteredMockTasks });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { taskId, status } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Task ID and status are required' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTaskStatus(taskId, status);
    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
}
