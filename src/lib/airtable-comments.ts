/**
 * Airtable Comments API utility functions
 * This file contains helper functions for interacting with Airtable's built-in record comments
 */

// Types for Airtable comments
export interface AirtableComment {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  contentType?: string;
  recordId: string;
  createdAt: string;
}

export interface AirtableCommentsResponse {
  comments: AirtableComment[];
  recordId: string;
  total: number;
}

export interface AddCommentResponse {
  comment: AirtableComment;
  success: boolean;
}

// Configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Helper function to get Airtable credentials
function getAirtableCredentials() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    throw new Error('Missing Airtable credentials');
  }

  return { apiKey, baseId };
}

/**
 * Check if Airtable credentials are available
 * @returns boolean
 */
export function hasAirtableCredentials(): boolean {
  try {
    getAirtableCredentials();
    return true;
  } catch {
    return false;
  }
}

/**
 * List comments for a specific record ID using Airtable's built-in comments API
 * @param recordId The record ID to fetch comments for
 * @param tableName The table name (defaults to 'Keywords' for both keywords and backlinks)
 * @returns Promise<AirtableComment[]>
 */
export async function listRecordComments(recordId: string, tableName: string = 'Keywords'): Promise<AirtableComment[]> {
  if (!recordId) {
    throw new Error('Record ID is required');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`Attempting to fetch comments for record ${recordId} in table ${tableName} (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      
      const { apiKey, baseId } = getAirtableCredentials();
      
      // Use Airtable's built-in comments API endpoint
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}/comments`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        // 10 second timeout
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Map Airtable comments to our format
      const formattedComments: AirtableComment[] = (data.comments || []).map((comment: any) => ({
        id: comment.id,
        text: comment.text || '',
        author: comment.author?.name || comment.author?.email || 'Unknown',
        timestamp: comment.createdTime ? new Date(comment.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
        contentType: '', // Not available in built-in comments
        recordId: recordId,
        createdAt: comment.createdTime || new Date().toISOString()
      }));

      console.log(`Successfully fetched ${formattedComments.length} comments for record ${recordId}`);
      return formattedComments;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Attempt ${attempt} failed for record ${recordId}:`, lastError.message);
      
      if (attempt < RETRY_ATTEMPTS) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  console.error(`All ${RETRY_ATTEMPTS} attempts failed for record ${recordId}`);
  throw lastError || new Error('Failed to fetch comments after retries');
}

/**
 * Add a comment to a record using Airtable's built-in comments API
 * @param recordId The record ID to add comment to
 * @param text The comment text
 * @param contentType Optional content type (not used in built-in comments)
 * @param tableName The table name (defaults to 'Keywords' for both keywords and backlinks)
 * @returns Promise<AirtableComment>
 */
export async function addRecordComment(
  recordId: string, 
  text: string, 
  contentType?: string,
  tableName: string = 'Keywords'
): Promise<AirtableComment> {
  if (!recordId || !text) {
    throw new Error('Record ID and text are required');
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`Attempting to add comment to record ${recordId} in table ${tableName} (attempt ${attempt}/${RETRY_ATTEMPTS})`);
      
      const { apiKey, baseId } = getAirtableCredentials();
      
      // Use Airtable's built-in comments API endpoint
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}/comments`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim()
        }),
        // 10 second timeout
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      const formattedComment: AirtableComment = {
        id: data.id,
        text: data.text || text,
        author: data.author?.name || data.author?.email || 'Anonymous User',
        timestamp: data.createdTime ? new Date(data.createdTime).toLocaleDateString() : new Date().toLocaleDateString(),
        contentType: contentType || '',
        recordId: recordId,
        createdAt: data.createdTime || new Date().toISOString()
      };

      console.log(`Successfully added comment to record ${recordId}`);
      return formattedComment;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.error(`Attempt ${attempt} failed for adding comment to record ${recordId}:`, lastError.message);
      
      if (attempt < RETRY_ATTEMPTS) {
        console.log(`Retrying in ${RETRY_DELAY_MS}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  console.error(`All ${RETRY_ATTEMPTS} attempts failed for adding comment to record ${recordId}`);
  throw lastError || new Error('Failed to add comment after retries');
}

/**
 * Get comment count for a record
 * @param recordId The record ID to count comments for
 * @param tableName The table name (defaults to 'Keywords' for both keywords and backlinks)
 * @returns Promise<number>
 */
export async function getCommentCount(recordId: string, tableName: string = 'Keywords'): Promise<number> {
  if (!recordId) {
    return 0;
  }

  try {
    const comments = await listRecordComments(recordId, tableName);
    return comments.length;
  } catch (error) {
    console.error('Error getting comment count:', error);
    return 0;
  }
} 