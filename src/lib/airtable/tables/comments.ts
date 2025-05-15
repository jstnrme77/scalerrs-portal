import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockComments } from '../mock-data';
import { Comment } from '../types';
import { handleAirtableError } from '../utils';

/**
 * Add a comment to a task
 * @param taskId Task ID to add comment to
 * @param userId User ID of the commenter
 * @param comment Comment text
 * @returns Created comment object
 */
export async function addComment(taskId: string, userId: string, comment: string): Promise<Comment> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for adding comment:', taskId, userId, comment);
    const newComment = {
      id: `comment-${Date.now()}`,
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment,
      CreatedAt: new Date().toISOString()
    };
    mockComments.push(newComment);
    return newComment;
  }

  try {
    // First, verify that the task exists
    const taskRecords = await base(TABLES.TASKS)
      .select({
        filterByFormula: `RECORD_ID() = '${taskId}'`,
      })
      .all();

    if (taskRecords.length === 0) {
      throw new Error(`Task with ID ${taskId} not found`);
    }

    // Create the comment
    const newComment = await base(TABLES.COMMENTS).create({
      Title: `Comment on task ${taskId}`, // Generate a title for the primary field
      Task: [taskId], // Link to the task by ID
      User: [userId], // Link to the user by ID
      Comment: comment,
      // Note: CreatedAt is an Airtable "Created time" field that's set automatically
    });

    return {
      id: newComment.id,
      ...newComment.fields,
    };
  } catch (error) {
    const newComment = {
      id: `comment-${Date.now()}`,
      Title: `Comment on task ${taskId}`,
      Task: [taskId],
      User: [userId],
      Comment: comment,
      CreatedAt: new Date().toISOString()
    };
    return handleAirtableError(error, newComment, 'addComment');
  }
}

/**
 * Get comments for a specific task
 * @param taskId Task ID to get comments for
 * @returns Array of comment objects
 */
export async function getCommentsByTask(taskId: string): Promise<Comment[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock comments data for task (no credentials):', taskId);
    return mockComments.filter(comment => comment.Task.includes(taskId));
  }

  try {
    console.log('Fetching comments from Airtable for task:', taskId);
    console.log('Using table:', TABLES.COMMENTS);

    // Log the task ID we're searching for
    console.log('Searching for comments with Task ID:', taskId);

    // First, let's get all comments to see what's available
    const allComments = await base(TABLES.COMMENTS).select().all();
    console.log('All comments in Airtable:', allComments.length);

    if (allComments.length > 0) {
      // Log the first comment to see its structure
      console.log('Sample comment structure:', allComments[0].fields);
      console.log('Sample comment Task field:', allComments[0].fields.Task);

      // Log all field names to help debug
      console.log('Available fields in first comment:', Object.keys(allComments[0].fields));
    }

    // Now try to filter for our specific task
    // For linked records in Airtable, we need to use a different approach
    // The Task field will be an array of record IDs
    const records = await base(TABLES.COMMENTS)
      .select({
        // Filter for comments where the Task field contains our taskId
        // For linked records, we need to use the FIND function to check if the taskId is in the array
        filterByFormula: `SEARCH('${taskId}', ARRAYJOIN(Task, ',')) > 0`,
        sort: [{ field: 'CreatedAt', direction: 'desc' }],
      })
      .all();

    // If we didn't find any comments, try a different approach
    if (records.length === 0) {
      console.log('No comments found with first approach, trying alternative...');

      // Try getting all comments and filtering manually
      const allTaskComments = allComments.filter((record: any) => {
        const taskField = record.fields.Task;

        // Log the task field to help debug
        console.log(`Comment ${record.id} Task field:`, taskField);

        // Check if the Task field contains our taskId
        if (Array.isArray(taskField)) {
          return taskField.includes(taskId);
        } else if (typeof taskField === 'string') {
          return taskField === taskId;
        }
        return false;
      });

      console.log(`Found ${allTaskComments.length} comments with manual filtering`);

      if (allTaskComments.length > 0) {
        return allTaskComments.map((record: any) => ({
          id: record.id,
          ...record.fields,
          // Ensure we have the expected fields
          Title: record.fields.Title || '',
          Comment: record.fields.Comment || '',
          Task: Array.isArray(record.fields.Task) ? record.fields.Task : [record.fields.Task || ''],
          User: Array.isArray(record.fields.User) ? record.fields.User : [record.fields.User || ''],
          CreatedAt: record.fields.CreatedAt || new Date().toISOString()
        }));
      }
    }

    console.log(`Found ${records.length} comments in Airtable for task ${taskId}`);

    if (records.length > 0) {
      console.log('Sample comment fields:', records[0].fields);
    }

    // Map records to our expected format, with fallbacks for different field names
    return records.map((record: any) => {
      const fields = record.fields;

      // Log each record to help debug
      console.log('Processing comment record:', record.id, fields);

      return {
        id: record.id,
        // Use the fields from your Airtable schema
        Title: fields.Title || '',
        Comment: fields.Comment || '',
        // For linked records, Task will be an array of record IDs
        Task: Array.isArray(fields.Task) ? fields.Task : [fields.Task || ''],
        // For linked records, User will be an array of record IDs
        User: Array.isArray(fields.User) ? fields.User : [fields.User || ''],
        // CreatedAt might be a timestamp or ISO string
        CreatedAt: fields.CreatedAt || fields['Created Time'] || new Date().toISOString(),
        // Include all original fields as well
        ...fields
      };
    });
  } catch (error) {
    return handleAirtableError(
      error, 
      mockComments.filter((comment: any) => comment.Task.includes(taskId)), 
      'getCommentsByTask'
    );
  }
}
