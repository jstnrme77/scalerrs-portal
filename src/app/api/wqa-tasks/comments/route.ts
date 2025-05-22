import { NextRequest, NextResponse } from 'next/server';
import { getAirtableTable } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get taskId from the request query params
    const url = new URL(request.url);
    const taskId = url.searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // Get the WQA table
    const table = await getAirtableTable('WQA');
    
    // Find the task by ID
    const task = await table.find(taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }
    
    // Get the comments field from the task
    const taskFields = task.fields as Record<string, any>;
    const commentsField = taskFields.Comments || '';
    
    // If the comments field is a string (long text format), parse it
    if (typeof commentsField === 'string') {
      // Split the comments by double newlines to get individual comments
      const commentBlocks = commentsField.split('\n\n').filter(block => block.trim().length > 0);
      
      // Parse each comment block into a structured format
      const comments = commentBlocks.map((block, index) => {
        // Split the first line from the rest of the comment
        const lines = block.split('\n');
        
        // First line should contain username and date
        const headerLine = lines[0] || '';
        
        // Try to extract username and date
        let author = 'User';
        let timestamp = new Date().toLocaleDateString();
        
        // Try to parse the header line
        const headerMatch = headerLine.match(/^(.+?)\s+(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}\/\d{1,2}\/\d{2})$/);
        if (headerMatch) {
          author = headerMatch[1].trim();
          timestamp = headerMatch[2].trim();
        }
        
        // The rest of the lines make up the comment text
        const commentText = lines.slice(1).join('\n').trim();
        
        return {
          id: `comment-${taskId}-${index}`,
          author,
          text: commentText || headerLine, // If parsing failed, use the whole line as text
          timestamp
        };
      });
      
      return NextResponse.json({ comments });
    } 
    // If it's already an array, return it directly
    else if (Array.isArray(commentsField)) {
      return NextResponse.json({ 
        comments: commentsField.map((comment, index) => ({
          id: comment.id || `comment-${taskId}-${index}`,
          author: comment.author || comment.User || 'User',
          text: comment.text || comment.Comment || 'No text',
          timestamp: comment.timestamp || comment.CreatedAt || new Date().toLocaleDateString()
        }))
      });
    }
    
    // If no comments or unrecognized format, return empty array
    return NextResponse.json({ comments: [] });
  } catch (error) {
    console.error('Error fetching comments for WQA task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments', details: (error as Error).message },
      { status: 500 }
    );
  }
} 