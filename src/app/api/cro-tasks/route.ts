import { NextRequest, NextResponse } from 'next/server';
import { getCROTasks } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET handler for fetching CRO tasks
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API route: Fetching CRO tasks');
    
    // Instead of getting user session, we'll fetch all tasks without filtering
    // This simplifies the implementation and avoids the dependency on @/lib/auth
    
    // Fetch tasks from Airtable without user filtering
    const croTasks = await getCROTasks();
    
    if (!croTasks || !Array.isArray(croTasks)) {
      console.error('Invalid CRO tasks data from Airtable');
      return NextResponse.json({
        tasks: [],
        error: 'Invalid CRO tasks data'
      });
    }
    
    console.log(`Successfully fetched ${croTasks.length} CRO tasks`);
    console.log('Raw CRO tasks from Airtable:', JSON.stringify(croTasks, null, 2));
    
    // Map the Airtable data to our frontend model
    const tasks = croTasks.map(task => {
      // Add debug logging to see what fields are available
      console.log('Task fields:', Object.keys(task));
      console.log('Task data:', task);
      
      // Extract task fields with proper fallbacks
      // FIXED: Use 'Action Item Name' field for the task name
      const name = task['Action Item Name'] || task.Name || task.Title || ''; 
      
      // Map Status values based on the provided options
      let status = 'Not Started'; // Default to 'Not Started' instead of 'To Do'
      if (task.Status) {
        const statusValue = String(task.Status).toLowerCase();
        if (statusValue === 'in progress' || statusValue === 'in-progress') {
          status = 'In Progress'; // Capital P in 'Progress'
        } else if (statusValue === 'done' || statusValue === 'complete' || statusValue === 'completed') {
          status = 'Done';
        } else if (statusValue === 'to do' || statusValue === 'todo' || statusValue === 'not started') {
          status = 'Not Started'; // Use 'Not Started' instead of 'To Do'
        } else if (statusValue === 'blocked' || statusValue === 'on hold') {
          status = 'Blocked';
        } else {
          // For any other status, map to one of our expected values
          console.warn(`Unknown status value: ${task.Status}, defaulting to 'Not Started'`);
          status = 'Not Started';
        }
      }
      
      // Use the original Priority value from Airtable instead of mapping
      const priority = task.Priority || 'Medium';
      
      // Extract assignedTo, handle both array and string formats
      let assignedTo = 'Unassigned';
      if (task.AssignedTo || task.Assignee) {
        const rawAssignedTo = task.AssignedTo || task.Assignee;
        if (Array.isArray(rawAssignedTo) && rawAssignedTo.length > 0) {
          assignedTo = rawAssignedTo[0];
        } else if (typeof rawAssignedTo === 'string' && rawAssignedTo.trim() !== '') {
          assignedTo = rawAssignedTo;
        }
      }
      
      // Use the original Impact value from Airtable
      // For the frontend component, we'll still need a numeric value
      let impact = 3; // Default medium impact
      if (task.Impact) {
        const impactValue = String(task.Impact).toLowerCase();
        if (impactValue.includes('high') || impactValue.includes('📊📊📊') || impactValue.includes('📈📈📈')) {
          impact = 5;
        } else if (impactValue.includes('mid') || impactValue.includes('📊📊') || impactValue.includes('📈📈')) {
          impact = 3;
        } else if (impactValue.includes('low') || impactValue.includes('📊') || impactValue.includes('📈')) {
          impact = 1;
        } else {
          // Try to parse as a number
          const numericImpact = parseInt(String(task.Impact).trim(), 10);
          if (!isNaN(numericImpact) && numericImpact >= 1 && numericImpact <= 5) {
            impact = numericImpact;
          }
        }
      }
      
      // Use the original Effort value from Airtable
      // For the frontend component, we'll still need S/M/L
      let effort = 'M'; // Default medium effort
      if (task.Effort) {
        const effortValue = String(task.Effort).toLowerCase();
        if (effortValue.includes('high') || effortValue.includes('|||') || effortValue.includes('❗❗❗')) {
          effort = 'L';
        } else if (effortValue.includes('mid') || effortValue.includes('||') || effortValue.includes('❗❗')) {
          effort = 'M';
        } else if (effortValue.includes('low') || effortValue.includes('|') || effortValue.includes('❗')) {
          effort = 'S';
        } else {
          // If it's already S, M, or L, use it directly
          const effortStr = String(task.Effort).trim().toUpperCase();
          if (['S', 'M', 'L'].includes(effortStr)) {
            effort = effortStr;
          }
        }
      }
      
      // Extract notes
      const notes = task.Notes || task.Comments || '';
      
      // Format date for display
      let dateLogged = '';
      try {
        // Try to parse the Created field, if available
        const created = task.Created || task['Created At'] || new Date().toISOString();
        dateLogged = new Date(created).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
      } catch (error) {
        console.warn('Error parsing date:', error);
        dateLogged = 'Unknown';
      }
      
      // Return mapped task with original Airtable values included
      return {
        id: task.id,
        task: name,
        status,
        priority,
        assignedTo,
        impact,
        effort,
        notes,
        dateLogged,
        comments: [],
        commentCount: 0,
        type: 'CRO',
        // Include the original values from Airtable for display
        originalPriority: task.Priority || '',
        originalImpact: task.Impact || '',
        originalEffort: task.Effort || ''
      };
    });
    
    return NextResponse.json({
      tasks,
      isMockData: !getCROTasks.toString().includes('base(')
    });
  } catch (error) {
    console.error('Error in CRO tasks API route:', error);
    
    let errorMessage = 'Unknown error fetching CRO tasks';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({
      tasks: [],
      isMockData: true,
      error: errorMessage
    });
  }
} 