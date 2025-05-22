import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatus } from '@/lib/airtable';

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
    
    console.log(`Updating WQA task ${taskId} status to ${status}`);
    
    // Use the status value directly without mapping
    const airtableStatus = status;
    
    // Update the task using the airtable.ts function
    const updatedTask = await updateTaskStatus(taskId, airtableStatus);
    
    // Return the status directly from Airtable
    return NextResponse.json({
      success: true,
      task: {
        id: updatedTask.id,
        status: updatedTask.Status || status
      }
    });
  } catch (error) {
    console.error('Error updating WQA task status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update task status',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
