import { NextRequest, NextResponse } from 'next/server';
import { updateCROTaskStatus } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { taskId, status } = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }
    
    console.log(`Updating CRO task ${taskId} status to ${status}`);
    
    // Map status to Airtable-compatible values
    // CRO tasks use these status values: To Do, In progress, Done
    let airtableStatus = status;
    
    // Normalize the status to match Airtable's expected values
    const statusLower = status.toLowerCase();
    if (statusLower === 'to do' || statusLower === 'todo' || statusLower === 'not started') {
      airtableStatus = 'To Do';
    } else if (statusLower === 'in progress' || statusLower === 'in-progress' || statusLower === 'inprogress') {
      airtableStatus = 'In progress';
    } else if (statusLower === 'done' || statusLower === 'complete' || statusLower === 'completed') {
      airtableStatus = 'Done';
    }
    
    console.log(`Mapped status for Airtable: ${airtableStatus}`);
    
    // Update the task using the airtable.ts function
    const updatedTask = await updateCROTaskStatus(taskId, airtableStatus);
    
    // Map the status back to our frontend format if needed
    let frontendStatus = updatedTask.Status || status;
    
    // Normalize the returned status to match our frontend expected values
    const returnedStatusLower = String(frontendStatus).toLowerCase();
    if (returnedStatusLower === 'to do' || returnedStatusLower === 'todo' || returnedStatusLower === 'not started') {
      frontendStatus = 'To Do';
    } else if (returnedStatusLower === 'in progress' || returnedStatusLower === 'in-progress' || returnedStatusLower === 'inprogress') {
      frontendStatus = 'In progress';
    } else if (returnedStatusLower === 'done' || returnedStatusLower === 'complete' || returnedStatusLower === 'completed') {
      frontendStatus = 'Done';
    }
    
    console.log(`Mapped status for frontend: ${frontendStatus}`);
    
    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        status: frontendStatus
      }
    });
  } catch (error) {
    console.error('Error updating CRO task status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update task status',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
} 