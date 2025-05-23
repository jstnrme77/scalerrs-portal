import { NextRequest, NextResponse } from 'next/server';
import { getCROTasks, updateCROTaskStatus } from '@/lib/airtable';
import { mockTasks } from '@/lib/mock-data';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET handler for fetching CRO tasks
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching CRO tasks from Airtable');
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
    let clientIds = null;
    try {
      if (userClient) {
        clientIds = JSON.parse(userClient);
        console.log('Parsed client IDs:', clientIds);
      }
    } catch (e) {
      console.error('Error parsing client IDs:', e);
    }

    // Check if we have the required API keys
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      console.warn('API route: Missing Airtable credentials');
      // Return a specific error message with mock data
      return NextResponse.json({
        tasks: [],
        isMockData: true,
        error: 'Missing Airtable API credentials'
      });
    }

    try {
      // Fetch CRO tasks with user filtering
      // For Client role, we should always use clientIds for filtering, not userId
      const tasks = await getCROTasks(
        userRole === 'Client' ? null : userId, // Only pass userId if not a client
        userRole,
        clientIds
      );

      if (!tasks || tasks.length === 0) {
        console.log('API route: No CRO tasks found');
        // Return empty array with a message
        return NextResponse.json({
          tasks: [],
          isMockData: true,
          error: 'No CRO tasks found in Airtable'
        });
      }

      // Process the tasks to handle Comments field properly
      const processedTasks = tasks.map((task: any) => {
        // Make a copy of the task to avoid modifying the original
        const processedTask = { ...task };
        
        // Handle Comments field if it exists
        if (processedTask.Comments) {
          // If Comments is a string (long text field), parse it
          if (typeof processedTask.Comments === 'string') {
            // Count the number of comments by splitting on double newlines
            // This matches the format we use when adding comments: "User Date\nComment text\n\nUser Date\nComment text"
            const commentBlocks = processedTask.Comments.split('\n\n')
              .filter((block: string) => block.trim().length > 0);
            
            // Add a commentCount property
            processedTask.commentCount = commentBlocks.length;
          } else if (Array.isArray(processedTask.Comments)) {
            // If it's already an array, just count the items
            processedTask.commentCount = processedTask.Comments.length;
          } else {
            // Default to 0 if we can't determine the count
            processedTask.commentCount = 0;
          }
        } else {
          // No Comments field, set count to 0
          processedTask.commentCount = 0;
        }
        
        return processedTask;
      });

      console.log(`API route: Found ${processedTasks.length} CRO tasks`);
      return NextResponse.json({ tasks: processedTasks });
    } catch (airtableError: any) {
      console.error('API route: Airtable error:', airtableError);
      
      let errorMessage = 'Error accessing Airtable';
      
      // Check for specific Airtable error types
      if (airtableError.error === 'NOT_AUTHORIZED') {
        errorMessage = 'Not authorized to access Airtable CRO table';
      } else if (airtableError.error === 'NOT_FOUND') {
        errorMessage = 'CRO table not found in Airtable';
      } else if (airtableError.message) {
        errorMessage = airtableError.message;
      }
      
      // Return a specific error with empty tasks
      return NextResponse.json({
        tasks: [],
        isMockData: true,
        error: errorMessage
      });
    }
  } catch (error: any) {
    console.error('Error in CRO tasks API route:', error);
    
    let errorMessage = 'Unknown error fetching CRO tasks';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      tasks: [],
      isMockData: true,
      error: errorMessage
    });
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

    const updatedTask = await updateCROTaskStatus(taskId, status);
    return NextResponse.json({ task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json(
      { error: 'Failed to update task' },
      { status: 500 }
    );
  }
} 