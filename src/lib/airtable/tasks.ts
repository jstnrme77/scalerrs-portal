/**
 * Task-related Airtable functions
 */
import { TABLES, getAirtableClient, fetchFromAirtableWithFallback, ensureClientIdArray } from '../airtable-utils';
import { mockTasks, mockComments } from '../mock-data';

/**
 * Get tasks from Airtable
 * @param clientIds Client IDs to filter by
 * @returns Array of tasks
 */
export async function getTasks(clientIds?: string | string[]) {
  // Convert clientIds to array if provided
  const clientIdArray = ensureClientIdArray(clientIds);
  
  // Build filter formula if clientIds are provided
  let filterFormula = '';
  if (clientIdArray.length > 0) {
    const clientFilters = clientIdArray.map(id => `FIND("${id}", {Client})`);
    filterFormula = `OR(${clientFilters.join(',')})`;
  }
  
  return fetchFromAirtableWithFallback(
    TABLES.TASKS,
    {
      filterFormula: filterFormula || undefined
    },
    mockTasks
  );
}

/**
 * Update task status in Airtable
 * @param taskId Task ID
 * @param newStatus New status
 * @returns Updated task or null if failed
 */
export async function updateTaskStatus(taskId: string, newStatus: string) {
  try {
    const { base, hasCredentials } = getAirtableClient();
    
    if (!hasCredentials || !base) {
      console.log('Cannot update task status (no credentials)');
      return null;
    }

    console.log(`Updating task ${taskId} status to ${newStatus} in Airtable...`);
    
    const records = await base(TABLES.TASKS).update([
      {
        id: taskId,
        fields: {
          Status: newStatus
        }
      }
    ]);

    if (records.length === 0) {
      console.log('Failed to update task status');
      return null;
    }

    const updatedTask = {
      id: records[0].id,
      ...records[0].fields
    };

    console.log(`Updated task:`, updatedTask);
    return updatedTask;
  } catch (error) {
    console.error('Error updating task status:', error);
    return null;
  }
}

/**
 * Get comments for a task from Airtable
 * @param taskId Task ID
 * @returns Array of comments
 */
export async function getCommentsByTask(taskId: string) {
  if (!taskId) {
    console.error('No taskId provided to getCommentsByTask');
    return [];
  }

  return fetchFromAirtableWithFallback(
    TABLES.COMMENTS,
    {
      filterFormula: `{Task} = "${taskId}"`
    },
    mockComments.filter(comment => comment.Task === taskId)
  );
}

/**
 * Add a comment to a task in Airtable
 * @param taskId Task ID
 * @param userId User ID
 * @param text Comment text
 * @returns Created comment or null if failed
 */
export async function addComment(taskId: string, userId: string, text: string) {
  try {
    const { base, hasCredentials } = getAirtableClient();
    
    if (!hasCredentials || !base) {
      console.log('Cannot add comment (no credentials)');
      return null;
    }

    console.log(`Adding comment to task ${taskId} in Airtable...`);
    
    const records = await base(TABLES.COMMENTS).create([
      {
        fields: {
          Task: [taskId],
          User: [userId],
          Text: text,
          Date: new Date().toISOString()
        }
      }
    ]);

    if (records.length === 0) {
      console.log('Failed to add comment');
      return null;
    }

    const comment = {
      id: records[0].id,
      ...records[0].fields
    };

    console.log(`Added comment:`, comment);
    return comment;
  } catch (error) {
    console.error('Error adding comment:', error);
    return null;
  }
}
