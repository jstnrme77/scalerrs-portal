import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockTasks } from '../mock-data';
import { Task } from '../types';
import { handleAirtableError, createClientFilter, createUserFilter, combineFilters } from '../utils';

/**
 * Get tasks from Airtable, filtered by user role and client
 * @param userId Optional user ID to filter tasks
 * @param userRole Optional user role to filter tasks
 * @param clientIds Optional client IDs to filter tasks
 * @returns Array of task objects
 */
export async function getTasks(
  userId?: string | null, 
  userRole?: string | null, 
  clientIds?: string[] | null
): Promise<Task[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock tasks data - no Airtable credentials');
    console.log('API Key exists:', !!hasAirtableCredentials);

    // Filter mock data based on user role and ID
    if (userId && userRole) {
      console.log(`Filtering mock tasks for user: ${userId}, role: ${userRole}`);

      // For client users, filter by client IDs
      if (userRole === 'Client' && clientIds && clientIds.length > 0) {
        console.log('Filtering mock tasks by client:', clientIds);
        return mockTasks.filter(task => {
          // Check if task has client field that matches any of the user's clients
          if (task.Client) {
            if (Array.isArray(task.Client)) {
              return task.Client.some(client => clientIds.includes(client));
            } else {
              return clientIds.includes(task.Client);
            }
          }
          return false;
        });
      }

      // For non-admin users who aren't clients, only show tasks assigned to them
      if (userRole !== 'Admin' && userRole !== 'Client') {
        return mockTasks.filter(task => {
          // Check if the task is assigned to this user
          if (task.AssignedTo) {
            if (Array.isArray(task.AssignedTo)) {
              return task.AssignedTo.includes(userId);
            } else {
              return task.AssignedTo === userId;
            }
          }
          return false;
        });
      }
    }

    return mockTasks;
  }

  try {
    console.log('Fetching tasks from Airtable...');
    
    // Build the query with appropriate filters
    const filterParts: string[] = [];

    // If user is a client, filter by client
    if (userRole === 'Client' && clientIds && clientIds.length > 0) {
      console.log('Filtering tasks by client:', clientIds);
      filterParts.push(createClientFilter(clientIds));
    }
    // If user is not an admin or client, filter by assigned user
    else if (userId && userRole && userRole !== 'Admin') {
      console.log(`Filtering tasks for user: ${userId}, role: ${userRole}`);
      filterParts.push(createUserFilter(userId, ['AssignedTo']));
    }

    // Combine all filter parts
    const filterFormula = combineFilters(filterParts);

    // Apply the filter if one was created
    let query;
    if (filterFormula) {
      console.log('Using filter formula:', filterFormula);
      query = base(TABLES.TASKS).select({
        filterByFormula: filterFormula
      });
    } else {
      query = base(TABLES.TASKS).select();
    }

    const records = await query.all();
    console.log(`Successfully fetched ${records.length} tasks from Airtable`);

    return records.map((record: any) => {
      const fields = record.fields;

      // Ensure we have consistent field names
      // If the record has Title but not Name, add Name as an alias
      if (fields.Title && !fields.Name) {
        fields.Name = fields.Title;
      }
      // If the record has Name but not Title, add Title as an alias
      else if (fields.Name && !fields.Title) {
        fields.Title = fields.Name;
      }

      return {
        id: record.id,
        ...fields,
      };
    });
  } catch (error) {
    return handleAirtableError(error, mockTasks, 'getTasks');
  }
}

/**
 * Update a task's status in Airtable
 * @param taskId Task ID to update
 * @param status New status value
 * @returns Updated task object
 */
export async function updateTaskStatus(taskId: string, status: string): Promise<Task> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for updating task status:', taskId, status);
    const updatedTask = mockTasks.find(task => task.id === taskId);
    if (updatedTask) {
      updatedTask.Status = status;
    }
    return updatedTask || { id: taskId, Status: status };
  }

  try {
    const updatedRecord = await base(TABLES.TASKS).update(taskId, {
      Status: status,
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    const updatedTask = mockTasks.find(task => task.id === taskId);
    if (updatedTask) {
      updatedTask.Status = status;
    }
    return handleAirtableError(error, updatedTask || { id: taskId, Status: status }, 'updateTaskStatus');
  }
}
