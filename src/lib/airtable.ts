import Airtable from 'airtable';

// Initialize Airtable with API key
const airtable = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '',
});

// Get the base
const base = airtable.base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// Table names
export const TABLES = {
  USERS: 'Users',
  TASKS: 'Tasks',
  COMMENTS: 'Comments',
};

// User functions
export async function getUsers() {
  try {
    const records = await base(TABLES.USERS).select().all();
    return records.map(record => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `{Email} = '${email}'`,
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    return {
      id: records[0].id,
      ...records[0].fields,
    };
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
}

// Task functions
export async function getTasks() {
  try {
    const records = await base(TABLES.TASKS).select().all();
    return records.map(record => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  try {
    const updatedRecord = await base(TABLES.TASKS).update(taskId, {
      Status: status,
    });

    return {
      id: updatedRecord.id,
      ...updatedRecord.fields,
    };
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

// Comment functions
export async function addComment(taskId: string, userId: string, comment: string) {
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
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function getCommentsByTask(taskId: string) {
  try {
    const records = await base(TABLES.COMMENTS)
      .select({
        filterByFormula: `FIND('${taskId}', {Task})`,
        sort: [{ field: 'CreatedAt', direction: 'asc' }],
      })
      .all();

    return records.map(record => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}
