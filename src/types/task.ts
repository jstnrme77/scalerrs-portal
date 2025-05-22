// Task Types
export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low';
export type TaskEffort = 'S' | 'M' | 'L';
export type TaskCategory = 'Technical SEO' | 'CRO' | 'Strategy' | 'Ad Hoc';

// Base Task interface
export interface BaseTask {
  id: string | number;
  task: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  dateLogged: string;
  impact: number;
  effort: TaskEffort;
  comments: TaskComment[];
  commentCount?: number;
  notes?: string;
  category?: TaskCategory;
  referenceLinks?: string[];
  Clients?: string | string[]; // Use Clients field for client filtering
  'All Clients'?: string | string[]; // Add All Clients field for filtering
  // Original Airtable values
  originalPriority?: string;
  originalImpact?: string;
  originalEffort?: string;
}

// Task Comment interface
export interface TaskComment {
  id: number | string;
  author: string;
  text: string;
  timestamp: string;
}

// Active Task interface
export interface ActiveTask extends BaseTask {
  status: 'Not Started' | 'In Progress' | 'Blocked';
  completedDate?: undefined; // Allow undefined completedDate for type compatibility
}

// Completed Task interface
export interface CompletedTask extends BaseTask {
  status: 'Done';
  completedDate: string;
}

// Union type for all task types
export type Task = ActiveTask | CompletedTask;

// Airtable Task interface
export interface AirtableTask {
  id: string;
  Title?: string;
  Name?: string;
  Description?: string;
  Status?: string;
  Priority?: string;
  AssignedTo?: string[];
  Category?: string;
  Type?: string;
  'Impact Level'?: string;
  'Effort Level'?: string;
  'Created At'?: string;
  'Due Date'?: string;
  'Completed Date'?: string;
  Notes?: string;
  [key: string]: any; // Allow for additional fields from Airtable
}

// Function to map Airtable task to our Task type
export function mapAirtableTaskToTask(airtableTask: AirtableTask): Task {
  // Get the task name from either Title or Name field
  const taskName = airtableTask.Title || airtableTask.Name || 'Untitled Task';

  // Map status to our TaskStatus type
  let status: TaskStatus = 'Not Started';
  if (airtableTask.Status) {
    if (airtableTask.Status.includes('Progress')) {
      status = 'In Progress';
    } else if (airtableTask.Status.includes('Block')) {
      status = 'Blocked';
    } else if (airtableTask.Status.includes('Done') || airtableTask.Status.includes('Complete')) {
      status = 'Done';
    }
  }

  // Map priority to our TaskPriority type
  let priority: TaskPriority = 'Medium';
  if (airtableTask.Priority) {
    if (airtableTask.Priority.includes('High')) {
      priority = 'High';
    } else if (airtableTask.Priority.includes('Low')) {
      priority = 'Low';
    }
  }

  // Map effort to our TaskEffort type
  let effort: TaskEffort = 'M';
  if (airtableTask['Effort Level']) {
    if (airtableTask['Effort Level'].includes('Low') || airtableTask['Effort Level'].includes('Small')) {
      effort = 'S';
    } else if (airtableTask['Effort Level'].includes('High') || airtableTask['Effort Level'].includes('Large')) {
      effort = 'L';
    }
  }

  // Map impact to a number
  let impact = 3; // Default to medium impact
  if (airtableTask['Impact Level']) {
    if (airtableTask['Impact Level'].includes('High')) {
      impact = 5;
    } else if (airtableTask['Impact Level'].includes('Medium')) {
      impact = 3;
    } else if (airtableTask['Impact Level'].includes('Low')) {
      impact = 1;
    }
  }

  // Get assigned to
  const assignedTo = Array.isArray(airtableTask.AssignedTo) && airtableTask.AssignedTo.length > 0
    ? airtableTask.AssignedTo[0]
    : 'Unassigned';

  // Get date logged
  const dateLogged = airtableTask['Created At']
    ? new Date(airtableTask['Created At']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Unknown';

  // Create the base task
  const baseTask: BaseTask = {
    id: airtableTask.id,
    task: taskName,
    status,
    priority,
    assignedTo,
    dateLogged,
    impact,
    effort,
    comments: [], // Comments will be loaded separately
    notes: airtableTask.Notes || airtableTask.Description,
    category: airtableTask.Category as TaskCategory || airtableTask.Type as TaskCategory,
    Clients: airtableTask.AssignedTo as string[] || undefined
  };

  // Return as either ActiveTask or CompletedTask
  if (status === 'Done') {
    const completedDate = airtableTask['Completed Date']
      ? new Date(airtableTask['Completed Date']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : dateLogged;

    return {
      ...baseTask,
      status,
      completedDate
    } as CompletedTask;
  } else {
    return {
      ...baseTask,
      status
    } as ActiveTask;
  }
}
