import { NextResponse } from 'next/server';

// Configure for Netlify and Vercel deployment
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Use this API to reset localStorage flags. Call it from the browser console with: fetch("/api/reset-mock-flags").then(r => r.json()).then(console.log)'
  });
} 