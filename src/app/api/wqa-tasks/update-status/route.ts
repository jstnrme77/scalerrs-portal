import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatus } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  try {
    const { taskId, newStatus } = await request.json();

    if (!taskId || !newStatus) {
      return NextResponse.json(
        { error: 'Task ID and new status are required' },
        { status: 400 }
      );
    }

    const updatedTask = await updateTaskStatus(taskId, newStatus);
    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error) {
    console.error('Error updating WQA task status:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
}
