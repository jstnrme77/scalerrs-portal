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
    
    // Call the updateCROTaskStatus function directly
    const updatedTask = await updateCROTaskStatus(taskId, status);
    
    if (!updatedTask) {
      return NextResponse.json(
        { error: 'Failed to update task status' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating CRO task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status', details: (error as Error).message },
      { status: 500 }
    );
  }
} 