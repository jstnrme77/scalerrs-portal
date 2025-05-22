import { NextRequest, NextResponse } from 'next/server';
import { createCROTask } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();
    console.log('Received CRO task data:', taskData);

    // Validate required fields
    if (!taskData.task) {
      return NextResponse.json(
        { error: 'Task name is required' },
        { status: 400 }
      );
    }

    // Set default values for required fields
    if (!taskData.status) {
      taskData.status = 'Not Started';
    }
    
    // Map from our frontend model to Airtable model - but with minimal transformation
    const airtableTaskData: any = {
      'Action Item Name': taskData.task,  // Map to "Action Item Name" field
      'Status': taskData.status  // Use status directly
    };
    
    // Only add fields if they are defined
    if (taskData.priority) {
      airtableTaskData.Priority = taskData.priority;
    }
    
    if (taskData.impact !== undefined && taskData.impact !== null) {
      airtableTaskData['Impact'] = taskData.impact.toString(); // Convert impact to string if present
    }
    
    if (taskData.effort) {
      airtableTaskData['Effort'] = taskData.effort; // Use effort directly
    }
    
    if (taskData.notes) {
      airtableTaskData['Comments'] = taskData.notes;
    }
    
    if (taskData.assignedTo && taskData.assignedTo !== 'Unassigned') {
      airtableTaskData['Assignee'] = taskData.assignedTo;
    }

    console.log('Airtable CRO task data:', airtableTaskData);

    // Create the task in Airtable
    const newTask = await createCROTask(airtableTaskData);

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create CRO task' },
        { status: 500 }
      );
    }

    // Return the created task with values directly from Airtable
    return NextResponse.json({
      success: true,
      task: {
        id: newTask.id,
        task: newTask['Action Item Name'] || newTask.Name || newTask.Title, 
        status: newTask.Status,
        priority: newTask.Priority,
        assignedTo: newTask.Assignee || 'Unassigned',
        impact: newTask.Impact,
        effort: newTask.Effort,
        notes: newTask.Comments,
        dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: [],
        commentCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating CRO task:', error);
    return NextResponse.json(
      { error: 'Failed to create CRO task', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// Keep only the format date function and delete the rest
function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.warn('Error formatting date:', error);
    return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
} 