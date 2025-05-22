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
    
    // Map from our frontend model to Airtable model
    // Don't include the 'Type' or 'Assigned To' fields as they're causing issues
    const airtableTaskData = {
      Name: taskData.task,  // Use Name as the primary field for task name
      Status: mapStatusToAirtable(taskData.status), // Map to valid Airtable status values
      Priority: taskData.priority,
      'Impact': taskData.impact.toString(), // Convert impact to string (1-5)
      'Effort': taskData.effort, // Use S, M, or L directly
      'Notes By Scalerrs During Audit': taskData.notes
    };

    console.log('Airtable task data:', airtableTaskData);

    // Create the task in Airtable
    const newTask = await createWQATask(airtableTaskData);

    if (!newTask) {
      return NextResponse.json(
        { error: 'Failed to create task' },
        { status: 500 }
      );
    }

    // Return the created task
    return NextResponse.json({
      success: true,
      task: {
        id: newTask.id,
        task: newTask.Name || newTask.Title, // Use Name first, fall back to Title
        status: mapAirtableStatus(newTask.Status), // Map Airtable status to frontend status
        priority: newTask.Priority,
        assignedTo: 'Unassigned', // Set a default value
        impact: mapAirtableImpact(newTask['Impact']),
        effort: mapAirtableEffort(newTask['Effort']),
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

// Helper functions to map between our model and Airtable model
// No longer needed since we're passing the values directly
// function mapImpactToAirtable(impact: number): string {
//   if (impact >= 5) return 'High';
//   if (impact >= 3) return 'Medium';
//   return 'Low';
// }

// function mapEffortToAirtable(effort: string): string {
//   if (effort === 'L') return 'Large';
//   if (effort === 'M') return 'Medium';
//   return 'Small';
// }

function mapAirtableImpact(impact?: string): number {
  if (!impact) return 3;
  // Try to parse the impact as a number
  const numericImpact = parseInt(impact, 10);
  if (!isNaN(numericImpact) && numericImpact >= 1 && numericImpact <= 5) {
    return numericImpact;
  }
  // Fallback to old mapping if not a valid number
  if (impact.includes('5')) return 5;
  if (impact.includes('4')) return 4;
  if (impact.includes('3')) return 3;
  if (impact.includes('2')) return 2;
  return 1;
}

function mapAirtableEffort(effort?: string): string {
  if (!effort) return 'M';
  // If it's already S, M, or L, return it directly
  if (effort === 'S' || effort === 'M' || effort === 'L') {
    return effort;
  }
  // Fallback to old mapping
  if (effort.includes('L')) return 'L';
  if (effort.includes('M')) return 'M';
  return 'S';
}

function mapStatusToAirtable(status: string): string {
  // Map frontend status values to Airtable's accepted values
  switch (status.toLowerCase()) {
    case 'not started':
      return 'To Do';
    case 'in progress':
      return 'In Progress';
    case 'blocked':
    case 'done':
      return 'Setup'; // Map both Blocked and Done to Setup as fallback
    default:
      return 'To Do'; // Default to To Do if unknown status
  }
}

// Function to map Airtable status values to frontend status values
function mapAirtableStatus(status?: string): string {
  if (!status) return 'Not Started';
  
  switch (status) {
    case 'To Do':
      return 'Not Started';
    case 'In Progress':
      return 'In Progress';
    case 'Setup':
      return 'Blocked'; // Default to Blocked for Setup
    default:
      return 'Not Started';
  }
} 