import { NextRequest, NextResponse } from 'next/server';
import { createWQATask } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const taskData = await request.json();
    console.log('Received task data:', taskData);

    // Validate required fields
    if (!taskData.task) {
      return NextResponse.json(
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Set default values for required fields
    if (!taskData.status) {
      taskData.status = 'Not Started';
    }
    
    // Map from our frontend model to Airtable model - but with minimal transformation
    // Don't include the 'Type' or 'Assigned To' fields as they're causing issues
    const airtableTaskData: any = {
      Name: taskData.task,  // Use Name as the primary field for task name
      Status: taskData.status  // Use status directly
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
      airtableTaskData['Notes By Scalerrs During Audit'] = taskData.notes;
    }

    console.log('Airtable task data:', airtableTaskData);

    // Create the task in Airtable
    const newTask = await createWQATask(airtableTaskData);

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    // Return the created task with values directly from Airtable
    return NextResponse.json({
      success: true,
      task: {
        id: newTask.id,
        task: newTask.Name || newTask.Title, 
        status: newTask.Status,
        priority: newTask.Priority,
        assignedTo: newTask.AssignedTo || 'Unassigned',
        impact: newTask.Impact,
        effort: newTask.Effort,
        notes: newTask['Notes By Scalerrs During Audit'],
        dateLogged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        comments: [],
        commentCount: 0
      }
    });
  } catch (error) {
    console.error('Error creating WQA task:', error);
    return NextResponse.json(
      { error: 'Failed to create task', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// We'll remove all helper functions since they are no longer needed 