import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/airtable';

// Configure for static export
// Using static instead of dynamic for GitHub Pages compatibility
export const dynamic = 'error';
export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // In a real app, you'd verify the password here
    // For this demo, we'll accept any password

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
