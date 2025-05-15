/**
 * User-related Airtable functions
 */
import { TABLES, getAirtableClient, fetchFromAirtableWithFallback } from '../airtable-utils';
import { mockUsers } from '../mock-data';

/**
 * Get all users from Airtable
 * @returns Array of users
 */
export async function getUsers() {
  return fetchFromAirtableWithFallback(
    TABLES.USERS,
    {},
    mockUsers
  );
}

/**
 * Get a user by email
 * @param email User email
 * @returns User object or null if not found
 */
export async function getUserByEmail(email: string) {
  if (!email) {
    console.error('No email provided to getUserByEmail');
    return null;
  }

  try {
    const { base, hasCredentials } = getAirtableClient();
    
    if (!hasCredentials || !base) {
      console.log('Using mock user data (no credentials)');
      const mockUser = mockUsers.find(user => user.Email === email);
      return mockUser || null;
    }

    console.log(`Fetching user with email ${email} from Airtable...`);
    
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `{Email} = "${email}"`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      console.log(`No user found with email ${email}`);
      return null;
    }

    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    console.log(`Found user:`, user);
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

/**
 * Create a new user in Airtable
 * @param userData User data
 * @returns Created user or null if failed
 */
export async function createUser(userData: any) {
  try {
    const { base, hasCredentials } = getAirtableClient();
    
    if (!hasCredentials || !base) {
      console.log('Cannot create user (no credentials)');
      return null;
    }

    console.log(`Creating user in Airtable...`, userData);
    
    const records = await base(TABLES.USERS).create([
      {
        fields: {
          Name: userData.name,
          Email: userData.email,
          Role: userData.role || 'User',
          Client: userData.client || [],
          Status: 'Active'
        }
      }
    ]);

    if (records.length === 0) {
      console.log('Failed to create user');
      return null;
    }

    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    console.log(`Created user:`, user);
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}
