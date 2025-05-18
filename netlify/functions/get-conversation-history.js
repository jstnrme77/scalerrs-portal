// Netlify function to get conversation history from Airtable
const Airtable = require('airtable');
const { getAirtableBase } = require('./utils/airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-id, x-user-role, x-user-client',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  try {
    console.log('Netlify function: get-conversation-history called');

    // Get user information from headers
    const userId = event.headers['x-user-id'];
    const userRole = event.headers['x-user-role'];
    const userClient = event.headers['x-user-client'];

    console.log('User ID:', userId);
    console.log('User Role:', userRole);
    console.log('User Client:', userClient);

    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const recordId = queryParams.recordId;
    const type = queryParams.type || 'keywords';

    if (!recordId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing recordId parameter' })
      };
    }

    console.log(`Fetching conversation history for ${type} record: ${recordId}`);

    // Initialize Airtable
    const base = getAirtableBase();

    // Determine which table to use based on type
    let tableName;
    if (type === 'backlinks') {
      tableName = 'Backlinks';
    } else {
      tableName = 'Keywords'; // Use Keywords table for briefs, articles, and keywords
    }

    // Get the record
    const record = await base(tableName).find(recordId);
    
    if (!record) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Record not found' })
      };
    }

    // Extract conversation history from the record
    const fields = record.fields;
    
    // Look for conversation history fields
    const conversationHistory = [];
    
    // Check for different possible field names for conversation history
    const commentFields = [
      'Conversation History',
      'Comments',
      'Revision Notes',
      'Notes',
      'Feedback'
    ];
    
    // Extract comments from any field that might contain them
    for (const field of commentFields) {
      if (fields[field]) {
        // If the field is an array, add each item
        if (Array.isArray(fields[field])) {
          fields[field].forEach(comment => {
            conversationHistory.push({
              text: comment,
              date: fields['Last Modified Time'] || new Date().toISOString(),
              user: 'Unknown'
            });
          });
        } 
        // If the field is a string, add it as a single comment
        else if (typeof fields[field] === 'string' && fields[field].trim() !== '') {
          conversationHistory.push({
            text: fields[field],
            date: fields['Last Modified Time'] || new Date().toISOString(),
            user: 'Unknown'
          });
        }
      }
    }
    
    // If we have a Comments table, try to fetch linked comments
    try {
      // Check if there's a Comments field that links to the Comments table
      if (fields['Comments'] && Array.isArray(fields['Comments']) && fields['Comments'].length > 0) {
        const commentIds = fields['Comments'];
        
        // Fetch the linked comments
        const comments = await Promise.all(
          commentIds.map(async (commentId) => {
            try {
              const comment = await base('Comments').find(commentId);
              return {
                id: comment.id,
                text: comment.fields['Comment Text'] || comment.fields['Comment'] || '',
                date: comment.fields['Created At'] || comment.fields['Created Time'] || new Date().toISOString(),
                user: comment.fields['User'] ? (Array.isArray(comment.fields['User']) ? comment.fields['User'][0] : comment.fields['User']) : 'Unknown'
              };
            } catch (error) {
              console.error(`Error fetching comment ${commentId}:`, error);
              return null;
            }
          })
        );
        
        // Add the valid comments to the conversation history
        comments.filter(Boolean).forEach(comment => {
          conversationHistory.push(comment);
        });
      }
    } catch (error) {
      console.error('Error fetching linked comments:', error);
      // Continue without linked comments
    }
    
    // Sort conversation history by date if available
    conversationHistory.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date) - new Date(b.date);
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        conversationHistory,
        recordId,
        type
      })
    };
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch conversation history',
        details: error.message
      })
    };
  }
};
