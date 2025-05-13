import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/airtable';
import { User } from '@/types';

// Configure for Netlify deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    // Parse the request body
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Get user by email
    const user = await getUserByEmail(email);

    // If no user found, return error
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password (in a real app, you would hash passwords)
    // For development, we're using plain text passwords
    if (user.Password !== password) {
      console.log('Password mismatch:', {
        provided: password,
        stored: user.Password,
        user: user.Email
      });
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      });
    }

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
    });
  }
}
