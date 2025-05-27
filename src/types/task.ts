// Task Types
export type TaskStatus = 'Not Started' | 'In Progress' | 'Blocked' | 'Done';
export type TaskPriority = 'High' | 'Medium' | 'Low' | 'High Priority' | 'Mid Priority' | 'Low Priority' | 'High Priority 🔥🔥🔥' | 'Mid Priority 🔥🔥' | 'Low Priority 🔥';
export type TaskEffort = 'S' | 'M' | 'L' | 'High Effort' | 'Mid Effort' | 'Low Effort' | 'High Effort ❗❗❗' | 'Mid Effort ❗❗' | 'Low Effort ❗';
export type TaskCategory = 'Technical SEO' | 'CRO' | 'Strategy' | 'Ad Hoc';

// Base Task interface
export interface BaseTask {
  id: string | number;
  task: string;
  status: TaskStatus;
  priority?: TaskPriority;  // Make priority optional
  assignedTo: string;
  dateLogged: string;
  impact?: number;  // Make impact optional
  effort?: TaskEffort;  // Make effort optional
  comments: TaskComment[];
  commentCount?: number;
  notes?: string;
  category?: TaskCategory;
  referenceLinks?: string[];
  Clients?: string | string[]; // Use Clients field for client filtering
  Client?: string | string[]; // Add Client field for compatibility with filtering
  'All Clients'?: string | string[]; // Add All Clients field for filtering
  // Original Airtable values
  originalPriority?: string;
  originalImpact?: string;
  originalEffort?: string;
  
  // CRO-specific fields
  type?: string;
  example?: string;
  exampleScreenshot?: string;
  
  // WQA-specific fields
  actionType?: string;
  whoIsResponsible?: string;
  notesByScalerrs?: string;
  explicationWhy?: string;
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
  let priority: TaskPriority | undefined = undefined;
  let originalPriority: string | undefined = undefined;
  if (airtableTask.Priority) {
    // Store the original Airtable value for display
    originalPriority = airtableTask.Priority;
    
    if (airtableTask.Priority.includes('High')) {
      priority = 'High';
    } else if (airtableTask.Priority.includes('Low')) {
      priority = 'Low';
    } else if (airtableTask.Priority.includes('Medium') || airtableTask.Priority.includes('Mid')) {
      priority = 'Medium';
    }
  }

  // Map effort to our TaskEffort type
  let effort: TaskEffort | undefined = undefined;
  let originalEffort: string | undefined = undefined;
  if (airtableTask['Effort Level'] || airtableTask.Effort) {
    // Store the original Airtable value for display
    originalEffort = airtableTask['Effort Level'] || airtableTask.Effort;
    
    const effortValue = airtableTask['Effort Level'] || airtableTask.Effort || '';
    if (effortValue.includes('Low') || effortValue.includes('Small') || effortValue.includes('❗')) {
      effort = 'S';
    } else if (effortValue.includes('High') || effortValue.includes('Large') || effortValue.includes('❗❗❗')) {
      effort = 'L';
    } else if (effortValue.includes('Medium') || effortValue.includes('Mid') || effortValue.includes('❗❗')) {
      effort = 'M';
    }
  }

  // Map impact to a number
  let impact: number | undefined = undefined;
  let originalImpact: string | undefined = undefined;
  if (airtableTask['Impact Level'] || airtableTask.Impact) {
    // Store the original Airtable value for display
    originalImpact = airtableTask['Impact Level'] || airtableTask.Impact;
    
    const impactValue = airtableTask['Impact Level'] || airtableTask.Impact || '';
    if (impactValue.includes('High') || impactValue.includes('📈📈📈')) {
      impact = 5;
    } else if (impactValue.includes('Medium') || impactValue.includes('Mid') || impactValue.includes('📈📈')) {
      impact = 3;
    } else if (impactValue.includes('Low') || impactValue.includes('📈')) {
      impact = 1;
    }
  }

  // Get assigned to
  const assignedTo = Array.isArray(airtableTask.AssignedTo) && airtableTask.AssignedTo.length > 0
    ? airtableTask.AssignedTo[0]
    : (airtableTask.Assignee || 'Unassigned');

  // Get date logged
  const dateLogged = airtableTask['Created At']
    ? new Date(airtableTask['Created At']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Unknown';

  // Create the base task
  const baseTask: BaseTask = {
    id: airtableTask.id,
    task: taskName,
    status,
    assignedTo,
    dateLogged,
    comments: [], // Comments will be loaded separately
    notes: airtableTask.Notes || airtableTask.Description,
    category: airtableTask.Category as TaskCategory || airtableTask.Type as TaskCategory,
    // Add both Client and Clients fields for compatibility with filtering
    Client: airtableTask.Client || airtableTask.Clients || airtableTask['Client'] || airtableTask['Clients'],
    Clients: airtableTask.Client || airtableTask.Clients || airtableTask['Client'] || airtableTask['Clients'],
    // Store original values for display
    originalPriority,
    originalImpact,
    originalEffort
  };
  
  // Add optional fields only if they have values
  if (priority !== undefined) {
    baseTask.priority = priority;
  }
  
  if (impact !== undefined) {
    baseTask.impact = impact;
  }
  
  if (effort !== undefined) {
    baseTask.effort = effort;
  }

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
