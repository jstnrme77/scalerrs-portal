import { NextRequest, NextResponse } from 'next/server';
import { getAirtableTable } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { taskId, comment } = await request.json();

    if (!taskId || !comment) {
      return NextResponse.json(
        { error: 'Task ID and comment are required' },
        { status: 400 }
      );
    }

    // Get the WQA table - use 'WQA' instead of 'WQA Tasks'
    const table = await getAirtableTable('WQA');
    
    // First, retrieve the current task to get existing comments
    const task = await table.find(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Get the current comments string (or empty string if none)
    const taskFields = task.fields as Record<string, any>;
    const currentComments = taskFields.Comments || '';
    
    // Format the new comment with username and date
    const username = 'User'; // In a real app, get this from auth
    const date = new Date().toLocaleDateString();
    const formattedComment = `${username} ${date}\n${comment}`;
    
    // Append the new comment to existing comments
    // If there are existing comments, add a newline separator
    const updatedComments = currentComments 
      ? `${currentComments}\n\n${formattedComment}`
      : formattedComment;
    
    // Update the task with the new comments
    await table.update(taskId, {
      Comments: updatedComments
    });
    
    // Return the updated task and the new comment
    return NextResponse.json({
      success: true,
      comment: {
        id: `comment-${Date.now()}`,
        author: username,
        text: comment,
        timestamp: date
      },
      commentCount: updatedComments.split('\n\n').filter(Boolean).length
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment', details: (error as Error).message },
      { status: 500 }
    );
  }
}
