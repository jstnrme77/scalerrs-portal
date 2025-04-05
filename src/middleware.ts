// Middleware cannot be used with static export
// This file is kept for reference but is not active

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export function middleware(request: NextRequest) {
//   // Only redirect the root path
//   if (request.nextUrl.pathname === '/') {
//     return NextResponse.redirect(new URL('/deliverables', request.url));
//   }
// }

// export const config = {
//   matcher: ['/'],
// };
