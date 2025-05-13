import { NextResponse } from 'next/server';
import Airtable from 'airtable';
import { TABLES } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  // Get Airtable credentials from environment variables
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!apiKey || !baseId) {
    return NextResponse.json({
      success: false,
      error: 'Missing Airtable credentials',
      apiKeyExists: !!apiKey,
      baseIdExists: !!baseId
    });
  }

  try {
    // Parse the request body
    const userData = await request.json();
    
    // Validate required fields
    if (!userData.Name || !userData.Email || !userData.Role) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: Name, Email, and Role are required'
      });
    }
    
    // Initialize Airtable
    Airtable.configure({ apiKey });
    const base = Airtable.base(baseId);
    
    // Add user to Airtable
    const createdRecord = await base(TABLES.USERS).create({
      Name: userData.Name,
      Email: userData.Email,
      Role: userData.Role,
      Password: userData.Password || 'password123', // Default password for testing
      Status: userData.Status || 'Active',
      Client: userData.Client || [],
      CreatedAt: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: createdRecord.id,
        ...createdRecord.fields
      }
    });
  } catch (error: any) {
    console.error('Error adding user:', error);
    
    return NextResponse.json({
      success: false,
      error: `Error adding user: ${error.message}`
    });
  }
}
