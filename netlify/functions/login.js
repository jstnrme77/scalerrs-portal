// Optimized Netlify function for user login
const {
  getAirtableBase,
  executeQuery
} = require('./utils/airtable-connection');

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

// Optimized function to get a user by email from Airtable
async function getUserByEmail(email) {
  try {
    console.log(`Attempting to find user with email: ${email}`);

    // Get the Airtable base
    const base = getAirtableBase();

    // Set up optimized query parameters
    const queryParams = {
      filterByFormula: `{Email} = '${email}'`,
      maxRecords: 1,
      fields: ['Name', 'Email', 'Password', 'Role', 'Status', 'Client', 'CreatedAt']
    };

    // Execute the optimized query
    const records = await executeQuery(base, 'Users', queryParams);

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

    console.log(`Found user: ${user.Name} (${user.Email}), Role: ${user.Role}`);
    return user;
  } catch (error) {
    console.error('Error getting user by email:', error.message);

    // Fall back to mock data
    console.log('Falling back to mock user data');
    const mockUser = mockUsers.find(u => u.Email === email) || null;
    if (mockUser) {
      console.log(`Found mock user: ${mockUser.Name} (${mockUser.Email})`);
    }
    return mockUser;
  }
}

// Handler for the Netlify function
exports.handler = async (event, context) => {
  // Set execution timeout to avoid Netlify's 10s limit
  const EXECUTION_TIMEOUT = 8000; // 8 seconds
  const executionStart = Date.now();

  // Create a promise that rejects after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function execution timed out')), EXECUTION_TIMEOUT);
  });

  // The actual function logic wrapped in a promise
  const functionPromise = (async () => {
    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
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
      console.log('Login function called');

      // Parse the request body
      let email, password;
      try {
        const parsedBody = JSON.parse(event.body);
        email = parsedBody.email;
        password = parsedBody.password;
      } catch (parseError) {
        console.error('Error parsing request body:', parseError.message);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Invalid request format'
          })
        };
      }

      // Validate required fields
      if (!email || !password) {
        console.log('Missing required fields');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            error: 'Email and password are required'
          })
        };
      }

      console.log(`Login attempt for email: ${email}`);

      // Check if we're approaching the timeout
      const timeElapsed = Date.now() - executionStart;
      if (timeElapsed > EXECUTION_TIMEOUT * 0.5) {
        console.log(`Execution time warning: ${timeElapsed}ms elapsed`);
        throw new Error('Function execution time approaching limit');
      }

      // Get user by email
      const user = await getUserByEmail(email);

      // If no user found, return error
      if (!user) {
        console.log(`No user found with email: ${email}`);
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
      if (user.Password !== password) {
        console.log('Password mismatch for user:', email);
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

      console.log(`Successful login for: ${user.Name} (${user.Email})`);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          user: safeUserData
        })
      };
    } catch (error) {
      console.error('Login error:', error.message);

      // Try to use mock data as fallback
      try {
        const { email, password } = JSON.parse(event.body);
        const mockUser = mockUsers.find(u => u.Email === email && u.Password === password);

        if (mockUser) {
          console.log(`Falling back to mock user: ${mockUser.Name}`);
          const { Password, ...safeUserData } = mockUser;

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              user: safeUserData,
              isMockData: true
            })
          };
        }
      } catch (mockError) {
        console.error('Error using mock data:', mockError.message);
      }

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Error during login: ${error.message}`
        })
      };
    }
  })();

  // Race the function promise against the timeout promise
  try {
    return await Promise.race([functionPromise, timeoutPromise]);
  } catch (error) {
    console.error('Function execution failed:', error.message);

    // If we hit a timeout, try to use mock data
    try {
      const { email, password } = JSON.parse(event.body);
      const mockUser = mockUsers.find(u => u.Email === email && u.Password === password);

      if (mockUser) {
        console.log(`Using mock user after timeout: ${mockUser.Name}`);
        const { Password, ...safeUserData } = mockUser;

        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            success: true,
            user: safeUserData,
            isMockData: true,
            timeoutMessage: 'Login function timed out, using mock data'
          })
        };
      }
    } catch (mockError) {
      console.error('Error using mock data after timeout:', mockError.message);
    }

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Function timed out or failed: ' + error.message
      })
    };
  }
};
