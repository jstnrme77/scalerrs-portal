import { NextRequest, NextResponse } from 'next/server';
import { getTasks, updateTaskStatus } from '@/lib/airtable';
import { mockTasks } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching tasks from Airtable');
    console.log('API Key exists:', !!process.env.AIRTABLE_API_KEY);
    console.log('Base ID exists:', !!process.env.AIRTABLE_BASE_ID);

    // Get user information from the request
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');
    const userClient = request.headers.get('x-user-client');

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);

    // Parse client IDs if present
    const clientIds = userClient ? JSON.parse(userClient) : [];

    // Fetch tasks with user filtering
    const tasks = await getTasks(userId, userRole, clientIds);

    if (!tasks || tasks.length === 0) {
      console.log('API route: No tasks found, using mock data');
      // Filter mock data based on user role and ID
      let filteredMockTasks = [...mockTasks];

      if (userId && userRole) {
        // For client users, filter by client IDs
        if (userRole === 'Client' && clientIds.length > 0) {
          // Filter mock tasks by client
          filteredMockTasks = mockTasks.filter(task => {
            // Check if task has client field that matches any of the user's clients
            if (task.Client) {
              if (Array.isArray(task.Client)) {
                return task.Client.some(client => clientIds.includes(client));
              } else {
                return clientIds.includes(task.Client);
              }
            }
            return false;
          });
        }
        // For non-admin users who aren't clients, only show tasks assigned to them
        else if (userRole !== 'Admin') {
          filteredMockTasks = mockTasks.filter(task => {
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
    return NextResponse.json({ tasks: mockTasks });
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
