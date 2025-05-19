import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/airtable';
import { User } from '@/types';

// Configure for dynamic API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Add cache control headers to prevent caching
export const headers = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
};

export async function POST(request: Request) {
  console.log('Login API route called');

  try {
    // Parse the request body
    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({
        success: false,
        error: 'Invalid request format'
      }, { status: 400 });
    }

    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields');
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    // Get user by email
    const user = await getUserByEmail(email);

    // If no user found, return error
    if (!user) {
      console.log('No user found with email:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    // Check password (in a real app, you would hash passwords)
    // For development, we're using plain text passwords
    if (user.Password !== password) {
      console.log('Password mismatch for user:', email);
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    console.log('Successful login for user:', user.Name, '(', user.Email, ')');

    // Update last login time (in a real app)
    // For now, we'll just return the user data

    // Remove sensitive data before returning
    const { Password, ...safeUserData } = user;

    return NextResponse.json({
      success: true,
      user: safeUserData
    });
  } catch (error: any) {
    console.error('Login error:', error);

    return NextResponse.json({
      success: false,
      error: `Error during login: ${error.message}`
    }, { status: 500 });
  }
}
