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
      taskData.status = 'To Do'; // default valid value
    }
    
    // Map common UI strings to the single-select options configured in Airtable
    const mapStatus = (s: string) => {
      const v = s.toLowerCase();
      if (v.includes('not started')) return 'To Do';
      if (v.includes('completed') || v.includes('done')) return 'Complete';
      return s; // In Progress / others passthrough
    };

    taskData.status = mapStatus(taskData.status);
    
    // Map from our frontend model to Airtable model - but with minimal transformation
    // Don't include the 'Type' or 'Assigned To' fields as they're causing issues
    const airtableTaskData: any = {
      Name: taskData.task,  // Use Name as the primary field for task name
      Status: taskData.status  // Use status directly
    };
    
    // Only add fields if they are defined, and make sure they match valid options
    if (taskData.priority) {
      airtableTaskData.Priority = taskData.priority;
    }
    
    if (taskData.impact !== undefined && taskData.impact !== null) {
      airtableTaskData['Impact'] = taskData.impact;
    }
    
    if (taskData.effort) {
      airtableTaskData['Effort'] = taskData.effort;
    }
    
    // Add new WQA-specific fields
    if (taskData.actionType) {
      airtableTaskData['Action Type'] = taskData.actionType;
    }
    
    if (taskData.whoIsResponsible) {
      airtableTaskData['Who Is Responsible'] = taskData.whoIsResponsible;
    }
    
    // Prioritize the new specific field over the generic notes field
    if (taskData.notesByScalerrs) {
      airtableTaskData['Notes By Scalerrs During Audit'] = taskData.notesByScalerrs;
    } else if (taskData.notes) {
      airtableTaskData['Notes By Scalerrs During Audit'] = taskData.notes;
    }
    
    if (taskData.explicationWhy) {
      airtableTaskData['Explication: Why?'] = taskData.explicationWhy;
    }

    // Add the Clients field if present in the incoming taskData
    if (taskData.clients && Array.isArray(taskData.clients) && taskData.clients.length > 0) {
      airtableTaskData['Clients'] = taskData.clients; // Assuming 'Clients' is the correct Airtable field name
    }

    console.log('Airtable task data (with Clients):', airtableTaskData);

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