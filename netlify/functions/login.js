// Netlify function for user login
const { getAirtableBase } = require('./utils/airtable');

// Mock users for fallback when Airtable is not available
const mockUsers = [
  {
    id: 'rec123admin',
    Name: 'Admin User',
    Email: 'admin@example.com',
    Password: 'password123',
    Role: 'Admin',
    Status: 'Active',
    Client: ['recwYAhAChGeLe1qO', 'recMwG9NFFHfjFHaj', 'recHXwrqkv16klPOr'],
    CreatedAt: '2023-01-01'
  },
  {
    id: 'rec456client',
    Name: 'Client User',
    Email: 'client@example.com',
    Password: 'password123',
    Role: 'Client',
    Status: 'Active',
    Client: ['recwYAhAChGeLe1qO'],
    CreatedAt: '2023-01-02'
  },
  {
    id: 'rec789seo',
    Name: 'SEO Specialist',
    Email: 'seo@example.com',
    Password: 'password123',
    Role: 'SEO',
    Status: 'Active',
    Client: ['recwYAhAChGeLe1qO', 'recMwG9NFFHfjFHaj'],
    CreatedAt: '2023-01-03'
  }
];

// Function to get a user by email from Airtable
async function getUserByEmail(email) {
  try {
    // Get the Airtable base
    const base = getAirtableBase();

    // Query the Users table for the user with the given email
    const records = await base('Users').select({
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1
    }).firstPage();

    // If no user found, return null
    if (records.length === 0) {
      console.log(`No user found with email: ${email}`);
      return null;
    }

    // Return the user data
    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    console.log(`Found user: ${user.Name} (${user.Email})`);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error);
    
    // Fall back to mock data
    console.log('Falling back to mock user data');
    return mockUsers.find(u => u.Email === email) || null;
  }
}

// Handler for the Netlify function
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    // Parse the request body
    const { email, password } = JSON.parse(event.body);

    // Validate required fields
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Email and password are required'
        })
      };
    }

    // Get user by email
    const user = await getUserByEmail(email);

    // If no user found, return error
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        })
      };
    }

    // Check password (in a real app, you would hash passwords)
    // For development, we're using plain text passwords
    if (user.Password !== password) {
      console.log('Password mismatch:', {
        provided: password,
        stored: user.Password,
        user: user.Email
      });
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid email or password'
        })
      };
    }

    // Remove sensitive data before returning
    const { Password, ...safeUserData } = user;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        user: safeUserData
      })
    };
  } catch (error) {
    console.error('Login error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: `Error during login: ${error.message}`
      })
    };
  }
};
