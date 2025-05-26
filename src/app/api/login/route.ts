import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/airtable';
import { User } from '@/types';
import { type NextRequest } from 'next/server';

// Configure for dynamic API route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
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
      const response = NextResponse.json({
        success: false,
        error: 'Invalid request format'
      }, { status: 400 });

      // Add cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    console.log('Login attempt for email:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('Missing required fields');
      const response = NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });

      // Add cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Get user by email
    const user = await getUserByEmail(email);

    // If no user found, return error
    if (!user) {
      console.log('No user found with email:', email);
      const response = NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });

      // Add cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    // Check password (in a real app, you would hash passwords)
    // For development, we're using plain text passwords
    if (user.Password !== password) {
      console.log('Password mismatch for user:', email);
      const response = NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });

      // Add cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');

      return response;
    }

    console.log('Successful login for user:', user.Name, '(', user.Email, ')');

    // Update last login time (in a real app)
    // For now, we'll just return the user data

    // Remove sensitive data before returning
    const { Password, ...safeUserData } = user;

    // Create response with cache control headers
    const response = NextResponse.json({
      success: true,
      user: safeUserData
    });

    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;
  } catch (error: any) {
    console.error('Login error:', error);

    const response = NextResponse.json({
      success: false,
      error: `Error during login: ${error.message}`
    }, { status: 500 });

    // Add cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');

    return response;
  }
}
