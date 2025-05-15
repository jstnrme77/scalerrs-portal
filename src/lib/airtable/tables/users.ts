import { base } from '../config';
import { hasAirtableCredentials, TABLES } from '../config';
import { mockUsers } from '../mock-data';
import { User, CreateUserParams } from '../types';
import { handleAirtableError } from '../utils';

/**
 * Get all users from Airtable
 * @returns Array of user objects
 */
export async function getUsers(): Promise<User[]> {
  if (!hasAirtableCredentials) {
    console.log('Using mock users data');
    return mockUsers;
  }

  try {
    const records = await base(TABLES.USERS).select().all();
    return records.map((record: any) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    return handleAirtableError(error, mockUsers, 'getUsers');
  }
}

/**
 * Get a user by email
 * @param email User's email address
 * @returns User object or null if not found
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for getUserByEmail');
    const mockUser = mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;

    console.log('Found mock user (no credentials):', mockUser);

    // Ensure the mock user has a Name field
    if (mockUser && !mockUser.Name) {
      console.warn('Mock user does not have a Name field:', mockUser);

      // For admin@example.com, use "Admin User" as the name
      if (mockUser.Email === 'admin@example.com') {
        mockUser.Name = 'Admin User';
      }
      // For client@example.com, use "Client User" as the name
      else if (mockUser.Email === 'client@example.com') {
        mockUser.Name = 'Client User';
      }
      // For seo@example.com, use "SEO Specialist" as the name
      else if (mockUser.Email === 'seo@example.com') {
        mockUser.Name = 'SEO Specialist';
      }
      // Otherwise, set a default name based on email
      else {
        mockUser.Name = mockUser.Email.split('@')[0] || 'User';
      }

      console.log('Set default name for mock user:', mockUser.Name);
    }

    return mockUser;
  }

  try {
    console.log(`Fetching user with email: ${email}`);
    // Query Airtable for the user with the matching email
    const records = await base(TABLES.USERS)
      .select({
        filterByFormula: `LOWER({Email}) = "${email.toLowerCase()}"`,
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      console.log(`No user found with email: ${email}`);
      return null;
    }

    console.log(`Found user with email: ${email}`);

    // Log the raw record to see what fields are available
    console.log('Raw user record from Airtable:', records[0]);
    console.log('User fields from Airtable:', records[0].fields);

    const user = {
      id: records[0].id,
      ...records[0].fields
    };

    // Check if the user has a Name field
    if (!user.Name) {
      console.warn('User record does not have a Name field:', user);

      // Try to find an alternative field that might contain the name
      const possibleNameFields = ['name', 'Name', 'FullName', 'full_name', 'DisplayName', 'display_name'];
      for (const field of possibleNameFields) {
        if (records[0].fields[field]) {
          console.log(`Found alternative name field: ${field}`);
          user.Name = records[0].fields[field];
          break;
        }
      }

      // If still no name, use email-specific names or fallback
      if (!user.Name && user.Email) {
        console.log('Using email-specific names or fallback for name');

        // For admin@example.com, use "Admin User" as the name
        if (user.Email === 'admin@example.com') {
          user.Name = 'Admin User';
        }
        // For client@example.com, use "Client User" as the name
        else if (user.Email === 'client@example.com') {
          user.Name = 'Client User';
        }
        // For seo@example.com, use "SEO Specialist" as the name
        else if (user.Email === 'seo@example.com') {
          user.Name = 'SEO Specialist';
        }
        // Otherwise, use email as fallback
        else {
          user.Name = user.Email.split('@')[0];
        }
      }
    }

    console.log('Processed user object:', user);
    return user;
  } catch (error: any) {
    console.error('Error fetching user by email:', error.message);

    // Fall back to mock data
    console.log('Falling back to mock data for getUserByEmail');
    const mockUser = mockUsers.find(user => user.Email && user.Email.toLowerCase() === email.toLowerCase()) || null;

    console.log('Found mock user:', mockUser);

    // Ensure the mock user has a Name field
    if (mockUser && !mockUser.Name) {
      console.warn('Mock user does not have a Name field:', mockUser);

      // For admin@example.com, use "Admin User" as the name
      if (mockUser.Email === 'admin@example.com') {
        mockUser.Name = 'Admin User';
      }
      // For client@example.com, use "Client User" as the name
      else if (mockUser.Email === 'client@example.com') {
        mockUser.Name = 'Client User';
      }
      // For seo@example.com, use "SEO Specialist" as the name
      else if (mockUser.Email === 'seo@example.com') {
        mockUser.Name = 'SEO Specialist';
      }
      // Otherwise, set a default name based on email
      else {
        mockUser.Name = mockUser.Email.split('@')[0] || 'User';
      }

      console.log('Set default name for mock user:', mockUser.Name);
    }

    return mockUser;
  }
}

/**
 * Create a new user in Airtable
 * @param userData User data to create
 * @returns Created user object
 */
export async function createUser(userData: CreateUserParams): Promise<User> {
  if (!hasAirtableCredentials) {
    console.log('Using mock data for creating user:', userData);
    // Create a mock user with an ID
    const newUser = {
      id: `rec${Date.now()}`,
      ...userData,
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  try {
    // Check if user with this email already exists
    const existingUser = await getUserByEmail(userData.Email);
    if (existingUser) {
      throw new Error(`User with email ${userData.Email} already exists`);
    }

    // Create the user in Airtable
    const newUser = await base(TABLES.USERS).create({
      Name: userData.Name,
      Email: userData.Email,
      Role: userData.Role,
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    });

    console.log('User created successfully:', newUser.id);

    return {
      id: newUser.id,
      ...newUser.fields
    };
  } catch (error) {
    return handleAirtableError(error, {
      id: `rec${Date.now()}`,
      ...userData,
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    }, 'createUser');
  }
}
