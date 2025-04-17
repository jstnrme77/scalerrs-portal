// Netlify Function to get tasks from Airtable
const Airtable = require('airtable');

exports.handler = async function(event, context) {
  console.log('Get Tasks function called');

  // Initialize Airtable with API key from environment variables
  // Try both naming conventions for environment variables
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID || process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;

  // Log environment variables (without exposing full API key)
  console.log('Environment check:');
  console.log('AIRTABLE_API_KEY available:', process.env.AIRTABLE_API_KEY ? `Yes (starts with ${process.env.AIRTABLE_API_KEY.substring(0, 3)}...)` : 'No');
  console.log('NEXT_PUBLIC_AIRTABLE_API_KEY available:', process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? `Yes (starts with ${process.env.NEXT_PUBLIC_AIRTABLE_API_KEY.substring(0, 3)}...)` : 'No');
  console.log('AIRTABLE_BASE_ID available:', process.env.AIRTABLE_BASE_ID ? `Yes (${process.env.AIRTABLE_BASE_ID})` : 'No');
  console.log('NEXT_PUBLIC_AIRTABLE_BASE_ID available:', process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ? `Yes (${process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID})` : 'No');
  console.log('Using API Key:', apiKey ? `Yes (starts with ${apiKey.substring(0, 3)}...)` : 'No');
  console.log('Using Base ID:', baseId || 'None');

  if (!apiKey || !baseId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Airtable API key or Base ID not configured',
        envVars: {
          AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? 'Set' : 'Not set',
          NEXT_PUBLIC_AIRTABLE_API_KEY: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY ? 'Set' : 'Not set',
          AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID ? 'Set' : 'Not set',
          NEXT_PUBLIC_AIRTABLE_BASE_ID: process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID ? 'Set' : 'Not set'
        }
      })
    };
  }

  try {
    // Initialize Airtable
    const airtable = new Airtable({ apiKey });
    const base = airtable.base(baseId);

    console.log('Airtable initialized successfully');

    // Try to get the list of tables to verify connection
    try {
      const tables = await base.tables();
      console.log('Available tables in Airtable:', tables.map(t => t.name));
    } catch (tableError) {
      console.error('Error getting tables:', tableError);
      // Continue anyway, as this might not be supported in all Airtable plans
    }

    // Try different table names (Tasks, Task, tasks, task)
    let records = [];
    let tableName = '';

    // Try each possible table name
    const possibleTableNames = ['Tasks', 'Task', 'tasks', 'task'];

    for (const name of possibleTableNames) {
      try {
        console.log(`Trying to fetch from table: ${name}`);
        records = await base(name).select().all();
        tableName = name;
        console.log(`Successfully fetched ${records.length} records from table: ${name}`);
        break; // Exit the loop if successful
      } catch (tableError) {
        console.log(`Table ${name} not found or error:`, tableError.message);
        // Continue to the next table name
      }
    }

    if (records.length === 0) {
      console.error('Could not find any valid task table');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Could not find a valid task table in Airtable',
          triedTables: possibleTableNames
        })
      };
    }

    // Log the first record to see its structure
    if (records.length > 0) {
      console.log(`Sample record from ${tableName}:`, JSON.stringify(records[0].fields));
    }

    // Map records to our expected format, with fallbacks for different field names
    const tasks = records.map(record => {
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
        // Ensure we have the expected fields with fallbacks
        Name: fields.Name || fields.Title || fields.name || fields.title || 'Untitled Task',
        Status: fields.Status || fields.status || 'To Do',
        Description: fields.Description || fields.description || '',
        // Include all original fields as well
        ...fields
      };
    });

    console.log(`Returning ${tasks.length} tasks`);

    return {
      statusCode: 200,
      body: JSON.stringify({ tasks })
    };
  } catch (error) {
    console.error('Error fetching tasks from Airtable:', error);
    console.error('Error stack:', error.stack);

    // Try to get more detailed error information
    let errorDetails = error.message;
    if (error.response) {
      console.error('Airtable API response error:', error.response);
      errorDetails = `${error.message} - API response: ${JSON.stringify(error.response)}`;
    }

    // Return a more detailed error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to fetch tasks from Airtable',
        details: errorDetails,
        timestamp: new Date().toISOString()
      })
    };
  }
};
