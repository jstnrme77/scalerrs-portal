import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/airtable';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET endpoint to check if a user exists
export async function GET(request: NextRequest) {
  try {
    // Get email from query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ 
      exists: true,
      user: {
        id: user.id,
        Name: user.Name,
        Email: user.Email,
        Role: user.Role
      }
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new user
export async function POST(request: NextRequest) {
  try {
    const { name, email, role, clientIds } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create the user
    const newUser = await createUser({
      Name: name,
      Email: email,
      Role: role,
      Clients: clientIds || []
    });

    return NextResponse.json({ 
      success: true, 
      user: newUser 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
