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
        { error: 'Task title is required' },
        { status: 400 }
      );
    }

    // Map Status values to match Airtable options
    let mappedStatus = 'To Do'; // Default
    if (taskData.status) {
      const status = taskData.status.toLowerCase();
      if (status === 'in progress') {
        mappedStatus = 'In progress';
      } else if (status === 'done') {
        mappedStatus = 'Done';
      } else if (status === 'to do' || status === 'not started') {
        mappedStatus = 'To Do';
      } else {
        // Keep original value if it doesn't match our expected values
        mappedStatus = taskData.status;
      }
    }
    
    // Map Priority values to match Airtable options with fire emojis
    let mappedPriority = 'Mid Priority 🔥🔥'; // Default
    if (taskData.priority) {
      const priority = taskData.priority.toLowerCase();
      if (priority === 'high') {
        mappedPriority = 'High Priority 🔥🔥🔥';
      } else if (priority === 'low') {
        mappedPriority = 'Low Priority 🔥';
      } else if (priority === 'medium') {
        mappedPriority = 'Mid Priority 🔥🔥';
      }
    }
    
    // Map Impact values to match Airtable options with chart emojis
    let mappedImpact = 'Mid Impact 📈📈'; // Default - using 📈 as seen in Airtable
    if (taskData.impact) {
      const impact = parseInt(taskData.impact.toString(), 10);
      if (impact >= 4) {
        mappedImpact = 'High Impact 📈📈📈';
      } else if (impact <= 2) {
        mappedImpact = 'Low Impact 📈';
      } else {
        mappedImpact = 'Mid Impact 📈📈';
      }
    }
    
    // Map Effort values to match Airtable options with symbols
    let mappedEffort = 'Mid Effort ❗❗'; // Default - using ❗ as seen in Airtable
    if (taskData.effort) {
      const effort = taskData.effort.toUpperCase();
      if (effort === 'L') {
        mappedEffort = 'High Effort ❗❗❗';
      } else if (effort === 'S') {
        mappedEffort = 'Low Effort ❗';
      } else if (effort === 'M') {
        mappedEffort = 'Mid Effort ❗❗';
      }
    }
    
    // Map from our frontend model to Airtable model
    const airtableTaskData = {
      'Action Item Name': taskData.task,  // Map to "Action Item Name" field
      'Status': mappedStatus,             // Status field with proper values
      'Priority': mappedPriority,         // Priority field with emojis
      'Impact': mappedImpact,             // Impact field with emojis
      'Effort': mappedEffort,             // Effort field with symbols
      'Comments': taskData.notes,         // Comments field
      'Assignee': taskData.assignedTo     // Assignee field
    };

    console.log('Airtable CRO task data:', airtableTaskData);

    // Create the task in Airtable
    const newTask = await createCROTask(airtableTaskData);

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create CRO task' },
        { status: 500 }
      );
    }

    // Return the created task
    return NextResponse.json({
      success: true,
      task: {
        id: newTask.id,
        task: newTask.Name || newTask.Title || newTask['Action Item Name'], // Use any available name field
        status: mapAirtableStatus(newTask.Status),
        priority: mapAirtablePriority(newTask.Priority),
        assignedTo: newTask.AssignedTo || newTask.Assignee || 'Unassigned',
        impact: mapAirtableImpact(newTask.Impact),
        effort: mapAirtableEffort(newTask.Effort),
        notes: newTask.Notes || newTask.Comments,
        dateLogged: formatDate(newTask.Created || new Date().toISOString()),
        comments: [],
        commentCount: 0,
        type: 'CRO'
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

// Helper functions for mapping values

function mapAirtableStatus(status?: string): string {
  if (!status) return 'To Do';
  
  const statusLower = status.toLowerCase();
  if (statusLower === 'in progress' || statusLower === 'in-progress') {
    return 'In progress';
  } else if (statusLower === 'done' || statusLower === 'complete' || statusLower === 'completed') {
    return 'Done';
  } else if (statusLower === 'to do' || statusLower === 'todo' || statusLower === 'not started') {
    return 'To Do';
  }
  
  return status; // Return original if no match
}

function mapAirtablePriority(priority?: string): string {
  if (!priority) return 'Medium';
  
  const priorityLower = priority.toLowerCase();
  if (priorityLower.includes('high')) return 'High';
  if (priorityLower.includes('low')) return 'Low';
  if (priorityLower.includes('mid')) return 'Medium';
  
  // Check for emojis
  if (priority.includes('🔥🔥🔥')) return 'High';
  if (priority.includes('🔥🔥')) return 'Medium';
  if (priority.includes('🔥')) return 'Low';
  
  return 'Medium';
}

function mapAirtableImpact(impact?: string): number {
  if (!impact) return 3;
  
  // Check for text values
  const impactLower = impact.toLowerCase();
  if (impactLower.includes('high')) return 5;
  if (impactLower.includes('mid')) return 3;
  if (impactLower.includes('low')) return 1;
  
  // Check for emojis - both 📊 and 📈
  if (impact.includes('📊📊📊') || impact.includes('📈📈📈')) return 5;
  if (impact.includes('📊📊') || impact.includes('📈📈')) return 3;
  if (impact.includes('📊') || impact.includes('📈')) return 1;
  
  // Try to parse as a number
  const numericImpact = parseInt(impact, 10);
  if (!isNaN(numericImpact) && numericImpact >= 1 && numericImpact <= 5) {
    return numericImpact;
  }
  
  return 3;
}

function mapAirtableEffort(effort?: string): string {
  if (!effort) return 'M';
  
  // Check for text values
  const effortLower = effort.toLowerCase();
  if (effortLower.includes('high')) return 'L';
  if (effortLower.includes('mid')) return 'M';
  if (effortLower.includes('low')) return 'S';
  
  // Check for symbols - both | and ❗
  if (effort.includes('|||') || effort.includes('❗❗❗')) return 'L';
  if (effort.includes('||') || effort.includes('❗❗')) return 'M';
  if (effort.includes('|') || effort.includes('❗')) return 'S';
  
  // If it's already S, M, or L, return it directly
  if (effort === 'S' || effort === 'M' || effort === 'L') {
    return effort;
  }
  
  return 'M';
}

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