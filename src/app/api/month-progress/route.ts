import { NextRequest, NextResponse } from 'next/server';
import { createCROTask } from '@/lib/airtable';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID } from "@/lib/server-env";

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Helper function identical to strategy route
async function lookupUserId(search: string): Promise<string | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return null;

  try {
    const res = await fetch(
      `https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/users`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error("[cro-tasks/add] users lookup failed", await res.text());
      return null;
    }

    const data = (await res.json()) as { users?: any[] };
    const users = data.users ?? [];

    const needle = search.trim().toLowerCase();
    const match = users.find(
      (u) =>
        (u.name && u.name.toLowerCase() === needle) ||
        (u.email && u.email.toLowerCase() === needle)
    );

    return match?.id ?? null;
  } catch (err) {
    console.error("[cro-tasks/add] users lookup error", err);
    return null;
  }
}

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
      airtableTaskData['Impact'] = taskData.impact; // Send the exact string selected by user
    }
    
    if (taskData.effort) {
      airtableTaskData['Effort'] = taskData.effort; // Send the exact string selected by user
    }
    
    if (taskData.notes) {
      airtableTaskData['Comments'] = taskData.notes;
    }
    
    if (taskData.assignedTo && taskData.assignedTo !== 'Unassigned') {
      const uid = await lookupUserId(taskData.assignedTo);
      if (uid) {
        airtableTaskData['Assigned To'] = [uid];
      } else {
        console.warn(`[cro-tasks/add] No Airtable user id found for "${taskData.assignedTo}" – leaving task unassigned.`);
      }
    }

    // Add the Clients field if present in the incoming taskData
    if (taskData.clients && Array.isArray(taskData.clients) && taskData.clients.length > 0) {
      airtableTaskData['Clients'] = taskData.clients; // Assuming 'Clients' is the correct Airtable field name
    }

    console.log('Airtable CRO task data (with Clients):', airtableTaskData);

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
        assignedTo: newTask['Assigned To'] || newTask.Assignee || 'Unassigned',
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